// app/voting/stats/page.tsx
"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  BarChart3,
  Trophy,
  Crown,
  Users,
  Award,
  TrendingUp,
  Download,
  Share2,
  Filter,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { authStore } from "@/stores/authStore";
import { voteStore } from "@/stores/vote.store";

// Mock data for demonstration - in real app, this would come from your API
const MOCK_VOTE_STATS = {
  totalVotes: 1247,
  totalVoters: 89,
  participationRate: 92.5,
  topCategories: [
    {
      id: "most-jovial",
      name: "Most Jovial Image",
      totalVotes: 87,
      winner: {
        id: "1",
        name: "John Doe",
        votes: 42,
        percentage: 48.3
      }
    },
    {
      id: "leader-of-the-year",
      name: "Leader Of The Year",
      totalVotes: 89,
      winner: {
        id: "3",
        name: "Precious Olusola",
        votes: 56,
        percentage: 62.9
      }
    },
    {
      id: "most-fashionable-male",
      name: "Most Fashionable Male",
      totalVotes: 85,
      winner: {
        id: "2",
        name: "Jane Smith",
        votes: 38,
        percentage: 44.7
      }
    }
  ],
  recentActivity: [
    { time: "2 mins ago", voter: "User 1", category: "Most Jovial" },
    { time: "5 mins ago", voter: "User 2", category: "Leader Of The Year" },
    { time: "12 mins ago", voter: "User 3", category: "Most Fashionable" },
    { time: "15 mins ago", voter: "User 4", category: "Most Versatile" }
  ],
  categoryStats: [
    { name: "Most Jovial", votes: 87, completion: 100 },
    { name: "Leader Of The Year", votes: 89, completion: 100 },
    { name: "Most Fashionable Male", votes: 85, completion: 98 },
    { name: "Most Fashionable Female", votes: 82, completion: 95 },
    { name: "Most Influential", votes: 78, completion: 92 },
    { name: "Most Talented", votes: 75, completion: 88 }
  ]
};

// Progress Bar Component
const ProgressBar = ({ percentage, color = "bg-champagne-gold-400" }: { percentage: number; color?: string }) => (
  <div className="w-full bg-pearl-200 dark:bg-pearl-700 rounded-full h-2">
    <div 
      className={`${color} h-2 rounded-full transition-all duration-1000 ease-out`}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

// Winner Card Component
const WinnerCard = ({ winner, category, totalVotes }: { winner: any; category: string; totalVotes: number }) => (
  <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-2xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6">
    <div className="text-center">
      <div className="relative mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r from-champagne-gold-400 to-rose-gold-400 p-1">
        <div className="w-full h-full rounded-full bg-white dark:bg-pearl-800 flex items-center justify-center">
          <Crown className="w-8 h-8 text-champagne-gold-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-2">
        {winner.name}
      </h3>
      
      <p className="text-sm text-pearl-600 dark:text-pearl-300 mb-3">
        {category}
      </p>
      
      <div className="bg-champagne-gold-50 dark:bg-champagne-gold-900/20 rounded-xl p-3">
        <div className="text-2xl font-bold text-champagne-gold-600">
          {winner.votes} votes
        </div>
        <div className="text-sm text-pearl-600">
          {winner.percentage}% of total
        </div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-champagne-gold-600" }: { icon: any; title: string; value: string | number; subtitle: string; color?: string }) => (
  <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-2xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-pearl-600 dark:text-pearl-300 mb-1">{title}</p>
        <h3 className={`text-2xl font-luxury font-bold ${color} mb-2`}>{value}</h3>
        <p className="text-xs text-pearl-500 dark:text-pearl-400">{subtitle}</p>
      </div>
      <div className="bg-champagne-gold-100/30 dark:bg-champagne-gold-900/20 p-2 rounded-full">
        <Icon className="w-5 h-5 text-champagne-gold-600" />
      </div>
    </div>
  </div>
);

function VotingStatsPage() {
  const [stats, setStats] = useState(MOCK_VOTE_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const user = authStore.member;

  useEffect(() => {
    // Simulate loading data from API
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // In real app: const data = await fetchVoteStats();
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStats(MOCK_VOTE_STATS);
      } catch (error) {
        console.error("Failed to load vote statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-50 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80">
        <div className="text-center">
          <div className="relative">
            <BarChart3 className="w-16 h-16 animate-pulse text-champagne-gold-400 mx-auto mb-4" />
            <Sparkles className="w-8 h-8 text-rose-gold-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h2 className="text-xl font-luxury text-pearl-700 mb-2">
            Loading Statistics
          </h2>
          <p className="text-pearl-600">Gathering voting insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-white to-rose-50/50 dark:from-luxury-900 dark:via-luxury-800 dark:to-romance-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="absolute left-1/4 top-0 w-12 h-12 bg-champagne-gold-300 rounded-full opacity-20 blur-lg animate-float"></div>
            <div className="absolute right-1/4 bottom-0 w-12 h-12 bg-rose-gold-300 rounded-full opacity-20 blur-lg animate-float-slow"></div>

            <h1 className="text-4xl md:text-5xl font-luxury font-bold text-gradient-gold mb-6 relative z-10">
              Voting Statistics
            </h1>
          </div>

          <p className="text-xl font-elegant text-pearl-700 dark:text-pearl-200 mb-8 max-w-3xl mx-auto">
            Real-time insights and results from the fellowship awards voting
          </p>

          {/* Filter Controls */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center bg-glass-warm backdrop-blur-sm rounded-xl p-2">
              <Filter className="w-4 h-4 text-pearl-500 mr-2" />
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent border-none text-pearl-700 dark:text-pearl-200 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <button className="btn btn-outline flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>

            <button className="btn btn-outline flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={Users}
            title="Total Votes Cast"
            value={stats.totalVotes}
            subtitle="Across all categories"
            color="text-champagne-gold-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Participation Rate"
            value={`${stats.participationRate}%`}
            subtitle="Of eligible voters"
            color="text-rose-gold-500"
          />
          <StatCard
            icon={Award}
            title="Active Voters"
            value={stats.totalVoters}
            subtitle="Community members voted"
            color="text-luxury-500"
          />
        </div>

        {/* Winners Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-luxury font-bold text-gradient-gold">
              Category Winners
            </h2>
            <div className="flex items-center text-pearl-500 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              Updated 5 minutes ago
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.topCategories.map((category) => (
              <WinnerCard
                key={category.id}
                winner={category.winner}
                category={category.name}
                totalVotes={category.totalVotes}
              />
            ))}
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6 mb-12">
          <h3 className="text-2xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6">
            Category Performance
          </h3>

          <div className="space-y-4">
            {stats.categoryStats.map((category, index) => (
              <div key={index} className="bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-pearl-800 dark:text-pearl-100">
                    {category.name}
                  </h4>
                  <div className="text-sm text-pearl-600 dark:text-pearl-300">
                    {category.votes} votes • {category.completion}% complete
                  </div>
                </div>
                <ProgressBar percentage={category.completion} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6">
          <h3 className="text-2xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6">
            Recent Voting Activity
          </h3>

          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-pearl-50/50 dark:bg-pearl-800/30">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-champagne-gold-100/30 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-4 h-4 text-champagne-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pearl-800 dark:text-pearl-100">
                      {activity.voter} voted for {activity.category}
                    </p>
                    <p className="text-xs text-pearl-500 dark:text-pearl-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-champagne-gold-400" />
              </div>
            ))}
          </div>
        </div> */}

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-pearl-500 dark:text-pearl-400">
            Statistics update in real-time. Last refreshed: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default observer(VotingStatsPage);