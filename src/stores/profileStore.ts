import {DinnerProfileRecord, DinnerProfile, createDinnerProfile, wait, getMemberDinnerProfile, TableRecord, getDinnerProfile, createTable, searchDinnerProfile} from "@rcffuta/ict-lib";
import { makeAutoObservable, runInAction, toJS } from "mobx";
import { createHistogram } from "perf_hooks";

class ProfileStore {
    private _profile: DinnerProfileRecord | null = null;
    private _date_profile: DinnerProfileRecord | null = null;
    private _associate_profile: DinnerProfileRecord | null = null;
    private _table: TableRecord | null = null;

    private _allProfiles: DinnerProfileRecord[] = [];

    status: string = "";

    loading: boolean = false;
    error: string | null = null;
    success: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }


    get profile(): DinnerProfileRecord | null {
        return toJS(this._profile);
    }
    get dateProfile(): DinnerProfileRecord | null {
        return this._associate_profile ? toJS(this._associate_profile) : toJS(this._date_profile);
    }

    get allProfiles() {
        return toJS(this._allProfiles);
    }

    // set profile(value: DinnerProfileRecord | null) {
    //     this._profile = value;
    // }
    get table(): TableRecord | null {
        return toJS(this._table);
    }

    // set table(value: TableRecord | null) {
    //     this._table = value;
    // }

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

            runInAction(() => {
                // this.profiles.push(profile);
                this._profile = profile;
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
     * Create a new DinnerProfile (Finalist or Associate)
     */
    async createAssociate(data: DinnerProfile) {
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

            runInAction(() => {
                // this.profiles.push(profile);
                this._associate_profile = profile;
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

    async loadProfile(email:string) {
        const {message, success, data} = await getMemberDinnerProfile(email);

        if (success) {

            const {
                attendee,
                tables
            } = data;

            
            let table = null;
            let d_date = null;
            let d_associate = null;
            const {success, data: associate} = await getDinnerProfile({
                by: "relationId",
                field: attendee.id
            });

            if (success) {
                d_associate = associate
            } else {
                table = selectTableRecord(tables);
            }

            

            if (table) {

                let id = attendee.gender === "female" ? table.male : table.female;
                const {message, success, data: date} = await getDinnerProfile({
                    by: "id" as any,
                    field: id
                });

                

                if (success){
                    d_date = date
                }
            }

            runInAction(()=>{
                this._date_profile = d_date;
                this._associate_profile = d_associate;
                this._table = table;
                this._profile = attendee;
            })
        } {
            console.error(message);
        }
    }
    async loadAllProfiles() {
        const {success, data} = await searchDinnerProfile();

        if (success) {

            this._allProfiles = data;
        } 
    }

    async pairProfile(consentToken: string, isAssociate: boolean) {
        try {

            let partner = null;

            if (!isAssociate) {

                this._date_profile = null;
                this.status = "Checking for finalist";
                // Validate consent token format first
                if (!consentToken.match(/^FYB-[A-Z0-9]{5}$/)) {
                    throw new Error("Invalid consent token format");
                }
                const { message, success, data } = await getDinnerProfile({
                    by: "consentToken",
                    field: consentToken
                });
                if (!success) {
                    throw new Error(message || "Failed to find profile with this consent token");
                }
                this._date_profile = data;
                partner = data;
            } else {
                partner = this.dateProfile;
            }




            // Validate that the found profile is of opposite gender
            if (!this.profile) {
                throw new Error("You need to create your dinner profile first");
            }
            if (!partner) {
                throw new Error("You need a partner!");
            }

            if (this.profile.gender === partner.gender) {
                throw new Error("Cannot pair with someone of the same gender");
            }
            

            this.status = "Pairing you both";

            const maleId = this.profile.gender === "male" ? this.profile.id : partner.id;
            const femaleId = this.profile.gender === "male" ? partner.id : this.profile.id;

            const { message: msg, success: scs, data: table } = await createTable(maleId, femaleId);

            if (!scs) {
                throw new Error(msg || "Failed to create pairing");
            }

            this._table = table;
            this.status = "";
            
            return { success: true, data: table };

        } catch (error: any) {
            this.status = "";
            // this._date_profile = null; // Clear the date profile on error
            
            // Re-throw the error for the caller to handle
            throw new Error(error.message || "Pairing failed");
        }
    }

    /**
     * Reset store state (useful on logout)
     */
    reset() {
        this._profile = null;
        this.loading = false;
        this.error = null;
        this.success = null;
    }
}

export const profileStore = new ProfileStore();


function selectTableRecord(tables: TableRecord[]): TableRecord | null {
  if (!tables || tables.length === 0) {
    return null;
  }

  // Helper function to get the most recent date for sorting
  const getLatestDate = (table: TableRecord): Date => {
    // Prefer updatedAt, then createdAt, fallback to very old date
    const dateString = table.updatedAt || table.createdAt;
    return dateString ? new Date(dateString) : new Date(0); // Date(0) = Jan 1, 1970
  };

  // Sort all tables by recency (most recent first)
  const sortedTables = [...tables].sort((a, b) => 
    getLatestDate(b).getTime() - getLatestDate(a).getTime()
  );

  // Get all paid tables (already sorted by recency)
  const paidTables = sortedTables.filter(table => table.paid === true);

  // Criteria 1: If there's exactly one paid table, select it
  if (paidTables.length === 1) {
    return paidTables[0];
  }

  // Criteria 2: If multiple paid tables, select the most recent one
  if (paidTables.length > 1) {
    return paidTables[0]; // Already sorted, first is most recent
  }

  // Criteria 3: If no paid tables, select the most recent table record
  return sortedTables[0];
}