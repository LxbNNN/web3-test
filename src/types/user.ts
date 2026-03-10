export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  kycStatus: "pending" | "verified" | "rejected" | "unsubmitted"
  twoFactorEnabled: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  username: string
  inviteCode?: string
}
