import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
}

export function useGetUserDetails() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<User>("/api/auth/me");
      setUser(res.data);
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError(err?.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}
