import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/* MEDIA FIX */
const getMediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8000${path}`;
};

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const avatarUrl =
    typeof user?.avatar === "string"
      ? getMediaUrl(user.avatar)
      : null;

  /* CLOSE DROPDOWNS ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* LOGOUT */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-white/80 backdrop-blur sticky top-0 z-50">

      {/* LEFT */}
      <h2 className="text-lg font-semibold">Dashboard</h2>

      {/* CENTER SEARCH */}
      <div className="hidden md:flex items-center w-[320px] relative">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-9" />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🔔 NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-muted transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg p-4 z-50"
              >
                <p className="text-sm font-semibold mb-2">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ROLE */}
        <Badge variant="outline" className="hidden md:block">
          {user?.role}
        </Badge>

        {/* 👤 PROFILE */}
        <div className="relative" ref={profileRef}>
          <Avatar
            className="cursor-pointer"
            onClick={() => setShowProfile(!showProfile)}
          >
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback>
              {user?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50"
              >
                <div className="p-4 border-b">
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}