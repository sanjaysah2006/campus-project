import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Clubs", href: "/clubs", icon: Users },
  { title: "Events", href: "/events", icon: Calendar },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
    roles: ["ORGANIZER", "ADMIN", "STUDENT"],
  },
  
  {
    title: "Requests",
    href: "/requests",
    icon: FileText,
    roles: ["ORGANIZER", "ADMIN"],
  },
  {
    title: "Admin",
    href: "/admin/dashboard",
    icon: Shield,
    roles: ["ADMIN"],
  },
];

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.roles ||
      (user && item.roles.includes(user.role))
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-xl font-bold text-sidebar-foreground">
              Campus Sync
            </span>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/" &&
              location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive &&
                    "text-sidebar-primary-foreground"
                )}
              />
              {!isCollapsed && (
                <span className="font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar className="w-10 h-10 border-2 border-sidebar-primary">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                {user?.username?.charAt(0)?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <User className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm">Profile</span>
            )}
          </Link>

          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors w-full",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}