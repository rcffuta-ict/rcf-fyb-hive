import { makeAutoObservable, runInAction, toJS,  } from "mobx";
import { getMemberFromStoredToken, loginMember, Member, resolveMemberFromPath } from "@rcffuta/ict-lib";


export class AuthStore {
    _member: Member | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
        this.init();
    }


    get member(): Member | null {
        return toJS(this._member);
    }

    set member(data: Member | null){
        this._member = data;
    }

    async init() {
        try {
            const {
                message,
                success,
                data: member,
            } = await getMemberFromStoredToken();
            if (!success || !member) {
                throw new Error(message || "No valid stored token");
            }
            runInAction(() => {
                this.member = member;
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
            const {message, success, data} = await resolveMemberFromPath(undefined, false);

            if (!success || !data) {
                throw new Error(message || "SSO verification failed");
            }
            runInAction(() => {
                this.member = data;
            });
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
