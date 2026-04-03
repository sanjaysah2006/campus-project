import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: JSX.Element;
  role?: string;
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

  // 🔥 Wait until auth check completes
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Role restriction
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
