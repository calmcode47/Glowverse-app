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
  },

  generateReferralCode: async (): Promise<{ code: string }> => {
    const res = await client.post("/api/v1/referrals/generate");
    return res.data;
  },

  getStats: async (): Promise<ReferralStats> => {
    const res = await client.get("/api/v1/referrals/stats");
    return res.data;
  }
};
