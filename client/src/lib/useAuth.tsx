"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { refresh as apiRefresh } from "./auth";
import { jwtDecode } from "jwt-decode";

type User = { email: string; userId: number } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRefresh()
      .then((data) => {
        const decoded: any = jwtDecode(data.accessToken);
        setUser({ email: decoded.email, userId: decoded.sub });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext);
}
