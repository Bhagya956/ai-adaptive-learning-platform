export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus?: string;      // "active" | "pending" | "rejected"
  educatorId?: string | null;
  organizationId?: string | null;
  mentorName?: string | null;       // resolved mentor display name
  organizationName?: string | null; // resolved org display name
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
