import { makeAutoObservable, runInAction, toJS,  } from "mobx";
import { findLiveTenure, findUnitById, getAllUnits, getMemberFromStoredToken, loginMember, Member, MemberObject, resolveMemberFromPath, TenureObject, TenurePopulated, UnitObject } from "@rcffuta/ict-lib";
import { appToast } from "@/providers/ToastProvider";


export class AuthStore {
    _member: MemberObject | null = null;
    _tenureProfile: TenurePopulated | null = null;
    _unit: UnitObject | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }


    get member(): MemberObject | null {
        return toJS(this._member);
    }

    set member(data: MemberObject | null){
        this._member = data;
    }

    get unit(): UnitObject | null {
        return toJS(this._unit);
    }

    set unit(data: UnitObject | null){
        this._unit = data;
    }

    get tenureProfile(): TenurePopulated | null {
        return toJS(this._tenureProfile);
    }

    set tenureProfile(data: TenurePopulated | null){
        this._tenureProfile = data;
    }

    async init() {
        try {
            let unit: UnitObject | null = null;
            const {message: tmg, success:tsx, data:tenure} = await findLiveTenure();
            
            if (!tsx) {
                throw new Error(tmg || "Could not resolve tenure profile");
            }
            const {
                message,
                success,
                data: member,
            } = await getMemberFromStoredToken();
            if (!success || !member) {
                throw new Error(message || "No valid stored token");
            }


            if (member.unitId) {

                const {data: duit} = await findUnitById(member.unitId || "");

                unit = duit || null;
            }

            // const {data: units} = await getAllUnits();
            runInAction(() => {
                this.tenureProfile = tenure;
                this.member = member;
                this.unit = unit;
                // this.units = units || [];
            });
        } catch (error) {
            console.warn("No valid stored token found or failed to fetch member:", error);
            runInAction(() => {
                this.member = null;
            });
        }
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
            

            let unit: UnitObject | null = null;


            const {message, success, data} = await resolveMemberFromPath(undefined, false);

            if (!success || !data) {
                throw new Error(message || "SSO verification failed");
            }

            if (data.unitId) {

                const {data: duit} = await findUnitById(data.unitId || "");

                unit = duit || null;
            }
            
            runInAction(() => {
                this.member = data;
                // this.tenureProfile = tenure;
                this.unit = unit;
            });
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
        this.unit = null;
    }

    get isAuthenticated() {
        return !!this.member;
    }
}

// Singleton instance
export const authStore = new AuthStore();
