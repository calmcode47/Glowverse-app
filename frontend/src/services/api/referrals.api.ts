import { client } from "./client";

export type ReferralFriend = {
  id: string;
  name?: string;
  joinedAt: string;
  status: "pending" | "earned";
};

export type ReferralData = {
  code: string;
  link: string;
  total: number;
  earned: number;
  pending: number;
  friends: ReferralFriend[];
};

export async function getMyReferrals(): Promise<ReferralData> {
  const res = await client.get("/api/v1/referrals/me");
  const d = res.data.referral || res.data;
  const friends: ReferralFriend[] = Array.isArray(d.friends)
    ? d.friends.map((f: any) => ({ id: String(f.id || f._id || ""), name: f.name ? String(f.name) : undefined, joinedAt: String(f.joinedAt || f.createdAt || new Date().toISOString()), status: (String(f.status || "pending").toLowerCase() as "pending" | "earned") }))
    : [];
  return {
    code: String(d.code || ""),
    link: String(d.link || ""),
    total: Number(d.total || friends.length || 0),
    earned: Number(d.earned || 0),
    pending: Number(d.pending || 0),
    friends
  };
}
