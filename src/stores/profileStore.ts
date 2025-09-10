import {DinnerProfileRecord, DinnerProfile, createDinnerProfile, wait, getMemberDinnerProfile, TableRecord, getDinnerProfile, createTable} from "@rcffuta/ict-lib";
import { makeAutoObservable, runInAction, toJS } from "mobx";

class ProfileStore {
    private _profile: DinnerProfileRecord | null = null;
    private _date_profile: DinnerProfileRecord | null = null;
    private _table: TableRecord | null = null;

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
        return toJS(this._date_profile);
    }

    set profile(value: DinnerProfileRecord | null) {
        this._profile = value;
    }
    get table(): TableRecord | null {
        return toJS(this._table);
    }

    set table(value: TableRecord | null) {
        this._table = value;
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

    async loadProfile(email:string) {
        const {message, success, data} = await getMemberDinnerProfile(email);

        if (success) {
            console.debug({data})
            const {
                attendee,
                tables
            } = data;

            this._profile = attendee;
            const table = selectTableRecord(tables);

            this._table = table;

            console.debug({attendee,tables, table, })

            if (table) {

                let id = attendee.gender === "female" ? table.male : table.female;
                const {message, success, data: date} = await getDinnerProfile({
                    by: "id" as any,
                    field: id
                });

                

                if (success){
                    this._date_profile = date;
                }


            }
        } {
            console.error(message);
        }
    }

    async pairProfile(consentToken: string) {
        try {
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

            // Validate that the found profile is of opposite gender
            if (!this.profile) {
                throw new Error("You need to create your dinner profile first");
            }

            if (this.profile.gender === data.gender) {
                throw new Error("Cannot pair with someone of the same gender");
            }
            

            this.status = "Pairing you both";

            await new Promise((resolve) => setTimeout(resolve, 2500));

            const maleId = this.profile.gender === "male" ? this.profile.id : data.id;
            const femaleId = this.profile.gender === "male" ? data.id : this.profile.id;

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
        this.profile = null;
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