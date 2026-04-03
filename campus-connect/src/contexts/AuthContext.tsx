import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import API from "@/lib/api";

/* ---------------- ROLES ---------------- */
type UserRole = "STUDENT" | "ORGANIZER" | "ADMIN";

/* ---------------- USER ---------------- */
interface User {
  id?: number; // ✅ make optional (important fix)
  username: string;
  role: UserRole;
  avatar?: string;
}

/* ---------------- CONTEXT ---------------- */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<UserRole>;
  logout: () => void;
}

/* ---------------- CONTEXT INIT ---------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 Restore session on refresh */
  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role") as UserRole | null;
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");

    if (token && role && username) {
      setUser({
        username,
        role,
        avatar: avatar ?? "",
      });
    }

    setLoading(false);
  }, []);

  /* 🔐 LOGIN */
  const login = async (
    username: string,
    password: string
  ): Promise<UserRole> => {
    try {
      const res = await API.post("login/", { username, password });

      const {
        access,
        refresh,
        role,
        username: name,
        avatar,
        id, // ✅ if backend sends it
      } = res.data;

      /* Save tokens */
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);
      localStorage.setItem("username", name);
      localStorage.setItem("avatar", avatar || "");

      const newUser: User = {
        id: id ?? undefined, // ✅ safe
        username: name,
        role: role,
        avatar: avatar ?? "",
      };

      setUser(newUser);

      return role;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail ||
          "Invalid username or password"
      );
    }
  };

  /* 🚪 LOGOUT */
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}