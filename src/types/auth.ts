export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dob?: string;
  role: "admin" | "doctor" | "patient";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
