import { client } from "./client";

export type ReferralFriend = {
  id: string;
  name?: string;
  joinedAt: string;
  status: "pending" | "earned";
  reward?: number;
};

export type ReferralStats = {
  totalReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  recentReferrals: ReferralFriend[];
};

export type ReferralData = {
  code: string;
  link: string;
  total: number;
  earned: number;
  pending: number;
  friends: ReferralFriend[];
};

export const referralsApi = {
  getMyReferral: async (): Promise<ReferralData> => {
    try {
      const res = await client.get("/api/v1/referrals/me");
      const d = res.data.referral || res.data;
      const friends: ReferralFriend[] = Array.isArray(d.friends)
        ? d.friends.map((f: any) => ({
          id: String(f.id || f._id || ""),
          name: f.name ? String(f.name) : undefined,
          joinedAt: String(f.joinedAt || f.createdAt || new Date().toISOString()),
          status: (String(f.status || "pending").toLowerCase() as "pending" | "earned"),
          reward: f.reward ? Number(f.reward) : undefined
        }))
        : [];
      return {
        code: String(d.code || ""),
        link: String(d.link || ""),
        total: Number(d.total || friends.length || 0),
        earned: Number(d.earned || 0),
        pending: Number(d.pending || 0),
        friends
      };
    } catch (e: any) {
      // Fallback for 401/403 or offline/dev: provide empty referral state
      return {
        code: "",
        link: "",
        total: 0,
        earned: 0,
        pending: 0,
        friends: []
      };
    }
  },

  generateReferralCode: async (): Promise<{ code: string }> => {
    try {
      const res = await client.post("/api/v1/referrals/generate");
      return res.data;
    } catch (e: any) {
      // Provide a deterministic demo code when generation is not permitted
      return { code: "DEMO-REF" };
    }
  },

  getStats: async (): Promise<ReferralStats> => {
    try {
      const res = await client.get("/api/v1/referrals/stats");
      // Ensure shape matches expected
      const anyRes: any = res.data || {};
      return {
        totalReferrals: Number(anyRes.totalReferrals || anyRes.total || 0),
        totalEarnings: Number(anyRes.totalEarnings || anyRes.earned || 0),
        pendingRewards: Number(anyRes.pendingRewards || anyRes.pending || 0),
        recentReferrals: Array.isArray(anyRes.recentReferrals) ? anyRes.recentReferrals.map((f: any) => ({
          id: String(f.id || f._id || ""),
          name: f.name ? String(f.name) : undefined,
          joinedAt: String(f.joinedAt || f.createdAt || new Date().toISOString()),
          status: (String(f.status || "pending").toLowerCase() as "pending" | "earned"),
          reward: f.reward ? Number(f.reward) : undefined
        })) : []
      };
    } catch {
      // Fallback stats in restricted environments
      return {
        totalReferrals: 0,
        totalEarnings: 0,
        pendingRewards: 0,
        recentReferrals: []
      };
    }
  }
};
