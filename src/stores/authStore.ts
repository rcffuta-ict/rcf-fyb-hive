import { makeAutoObservable, runInAction, toJS,  } from "mobx";
import { findLiveTenure, findUnitById, getAllUnits,MemberProfile, getMemberFromStoredToken, loginMember, resolveMemberFromPath, TenurePopulated, UnitObject } from "@rcffuta/ict-lib";
import { appToast } from "@/providers/ToastProvider";
import { profileStore } from "./profileStore";


export class AuthStore {
    _member: MemberProfile | null = null;
    _tenureProfile: TenurePopulated | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }


    get member(): MemberProfile | null {
        return toJS(this._member);
    }

    set member(data: MemberProfile | null){
        this._member = data;
    }

    get tenureProfile(): TenurePopulated | null {
        return toJS(this._tenureProfile);
    }

    set tenureProfile(data: TenurePopulated | null){
        this._tenureProfile = data;
    }

    private async runInit(member?: MemberProfile) {
        const {message: tmg, success:tsx, data:tenure} = await findLiveTenure();

        let email: string | null = null;

        if (tsx) {
            this._tenureProfile = tenure;
        }else {
            console.error(tmg || "Could not resolve tenure profile");
        }

        if (!member) {
            const {
                message,
                success,
                data: mem,
            } = await getMemberFromStoredToken();

            if (success) {
                this.member = mem;
                email = mem.email;
            }else {
                console.log(message || "No valid stored token");
            }
        }else {
            this.member = member;
            email = member.email;
        }

        if (email) {
            profileStore.loadProfile(email);
        }


    }

    async init() {
        this.runInit();
    }

  // Trigger sending login link
    async login(email: string) {
        this.isLoading = true;
        this.error = null;

        try {
            const token = await loginMember({ email, verifyPath: "/login/verify" });
            return token;
        } catch (err: any) {
            this.error = "Failed to send login link";
            throw err;
        } finally {
            this.isLoading = false;
        }
    }

  // Verify token / resolve member
    async verify() {
        if (this.isLoading) return; // Prevent multiple calls
        this.isLoading = true;
        this.error = null;

        try {
            const {message, success, data} = await resolveMemberFromPath(undefined, false);

            if (!success || !data) {
                throw new Error(message || "SSO verification failed");
            }
            
            this.runInit(data);
            appToast.elegant("Login verified! Redirecting...");
            return data;
        } catch (err: any) {
            runInAction(() => {
                this.error = "SSO verification failed";
            });
            throw err;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }


    // Logout / clear
    logout() {
        this.member = null;
    }

    get isAuthenticated() {
        return !!this.member;
    }
}

// Singleton instance
export const authStore = new AuthStore();
