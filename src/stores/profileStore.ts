import {DinnerProfileRecord, DinnerProfile, createDinnerProfile, wait} from "@rcffuta/ict-lib";
import { makeAutoObservable, runInAction } from "mobx";

class ProfileStore {
    _profile: DinnerProfileRecord | null = null;

    loading: boolean = false;
    error: string | null = null;
    success: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }


    get profile(): DinnerProfileRecord | null {
        return this._profile;
    }

    set profile(value: DinnerProfileRecord | null) {
        this._profile = value;
    }

    /**
     * Create a new DinnerProfile (Finalist or Associate)
     */
    async createProfile(data: DinnerProfile) {
        this.loading = true;
        this.error = null;
        this.success = null;

        try {
            
            // await wait(3);
            const {
                message,
                success,
                data: profile,
            } = await createDinnerProfile(data);

            if (!success) {
                throw new Error(message || "Failed to create profile");
            }

            // console.debug("Created profile with data:", profile);

            runInAction(() => {
                // this.profiles.push(profile);
                this.profile = profile;
                this.success = "Profile successfully created!";
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message || "Failed to create profile";
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    /**
     * Reset store state (useful on logout)
     */
    reset() {
        this.profile = null;
        this.loading = false;
        this.error = null;
        this.success = null;
    }
}

export const profileStore = new ProfileStore();
