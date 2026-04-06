import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface EventType {
  id: number;
  title: string;
}

interface Props {
  events: EventType[]; // ✅ REQUIRED now
}

export default function TopNav({ events }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<EventType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const filtered = events
      .filter((e) =>
        e.title.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);

    setResults(filtered);
    setShowDropdown(true);
    setHighlightIndex(0);
  };

  /* ---------------- KEYBOARD NAVIGATION ---------------- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : prev
      );
    }

    if (e.key === "Enter") {
      const selected = results[highlightIndex];
      if (selected) {
        navigate(`/events/${selected.id}`);
        setShowDropdown(false);
        setSearch("");
      }
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-50">

      {/* LEFT */}
      <h2 className="text-lg font-semibold">Dashboard</h2>

      {/* SEARCH */}
      <div className="relative w-[320px]" ref={dropdownRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />

        {/* 🔽 DROPDOWN */}
        <AnimatePresence>
          {showDropdown && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-1 z-50"
            >
              {results.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/events/${item.id}`);
                    setShowDropdown(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm ${
                    index === highlightIndex
                      ? "bg-muted"
                      : "hover:bg-muted"
                  }`}
                >
                  {item.title}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        <Bell className="w-5 h-5" />

        <Badge variant="outline">
          {user?.role}
        </Badge>

        <Avatar>
          <AvatarFallback>
            {user?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <button onClick={handleLogout}>
          <LogOut />
        </button>

      </div>
    </div>
  );
}