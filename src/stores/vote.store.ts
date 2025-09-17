// stores/voteStore.ts
import { makeAutoObservable, runInAction, toJS } from "mobx";
import { appToast } from "@/providers/ToastProvider";
import { loadVotes, saveVote, VoteRecord, DinnerProfileRecord, getDinnerProfile } from "@rcffuta/ict-lib";

interface VotingState {
  votes: Map<string, string>;
  currentSession: VoteRecord | null;
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  contestants: Map<string, DinnerProfileRecord>;
  progress: number;
  lastVotedCategory: string | null;
}

class VoteStore {
  private state: VotingState = {
    votes: new Map<string, string>(),
    currentSession: null,
    loading: false,
    error: null,
    isSubmitting: false,
    contestants: new Map<string, DinnerProfileRecord>(),
    progress: 0,
    lastVotedCategory: null
  };

  constructor() {
    makeAutoObservable(this);
  }

  // Getters
  get votes() {
    return this.state.votes;
  }

  get contestants() {
    return toJS(Array.from(this.state.contestants.values()));
  }

  get loading() {
    return this.state.loading;
  }

  get error() {
    return this.state.error;
  }

  get isSubmitting() {
    return this.state.isSubmitting;
  }

  get progress() {
    return this.state.progress;
  }

  get lastVotedCategory() {
    return this.state.lastVotedCategory;
  }

  get votedCategories() {
    return this.state.votes.size;
  }

  // Actions
  setLoading = (loading: boolean) => {
    this.state.loading = loading;
  };

  setError = (error: string | null) => {
    this.state.error = error;
  };

  setProgress = (progress: number) => {
    this.state.progress = Math.min(100, Math.max(0, progress));
  };

  addVote = (category: string, voteValue: string) => {
    this.state.votes.set(category, voteValue);
    this.state.lastVotedCategory = category;
    this.calculateProgress();
  };

  removeVote = (category: string) => {
    this.state.votes.delete(category);
    this.calculateProgress();
  };

  clearVotes = () => {
    this.state.votes = new Map<string, string>();
    this.state.lastVotedCategory = null;
    this.setProgress(0);
  };

  setContestants(records: DinnerProfileRecord[]) {
    runInAction(() => {
      records.forEach(each => {
        this.state.contestants.set(each.email, each);
      });
    });
  }

  private calculateProgress() {
    const totalCategories = 28; // Adjust based on your actual category count
    this.setProgress((this.votedCategories / totalCategories) * 100);
  }

  private updateVote(updates: Record<string, string>) {
    runInAction(() => {
      for (const [key, value] of Object.entries(updates)) {
        this.state.votes.set(key, value);
      }
      this.calculateProgress();
    });
  }

  private mapToRecord(): Record<string, string> {
    const record: Record<string, string> = {};
    for (const [key, value] of Array.from(this.state.votes.entries())) {
      record[key] = value;
    }
    return record;
  }

  // API Actions
  loadVotingSession = async (voterId: string) => {
    this.setLoading(true);
    this.setError(null);
    
    try {
      const { message, success, data } = await loadVotes(voterId);

      if (success) {
        runInAction(() => {
          this.state.currentSession = data;
          this.updateVote(data.voteData);
        });
      } else {
        throw new Error(message);
      }
    } catch (error: any) {
      this.setError(error.message || "Failed to load voting session");
      appToast.error("Failed to load your previous votes.");
    } finally {
      this.setLoading(false);
    }
  };

  submitVotes = async (voterMail: string) => {
    this.state.isSubmitting = true;
    this.setError(null);

    let isDone = false;
    
    try {
      const { message, success, data } = await saveVote({
        voteData: this.mapToRecord(),
        voterMail
      });

      if (!success) {
        throw new Error(message);
      }

      runInAction(() => {
        this.state.currentSession = data;
        this.updateVote(data.voteData);
      });
      
      isDone = true;
      appToast.romantic("Your votes have been submitted successfully! 🎉");
    } catch (error: any) {
      this.setError(error.message || "Failed to submit votes");
      appToast.error("Failed to submit votes. Please try again.");
    } finally {
      runInAction(() => {
        this.state.isSubmitting = false;
      });
    }

    return isDone;
  };

  getVoteForCategory = (categoryId: string) => {
    return this.state.votes.get(categoryId);
  };

  // Reset state
  reset = () => {
    runInAction(() => {
      this.state = {
        votes: new Map<string, string>(),
        currentSession: null,
        loading: false,
        error: null,
        isSubmitting: false,
        contestants: new Map<string, DinnerProfileRecord>(),
        progress: 0,
        lastVotedCategory: null
      };
    });
  };
}

export const voteStore = new VoteStore();