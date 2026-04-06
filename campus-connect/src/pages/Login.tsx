import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  Lock,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "ORGANIZER", label: "Organizer" },
  { value: "ADMIN", label: "Admin" },
];

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    try {

      const loggedRole = await login(username, password);

      if (loggedRole !== role) {
        throw new Error("Selected role does not match account role.");
      }

      toast({
        title: "Login successful 🎉",
        description: `Logged in as ${loggedRole}`,
      });

      if (loggedRole === "ADMIN") {
        navigate("/admin/dashboard");
      }
      else if (loggedRole === "ORGANIZER") {
        navigate("/events");
      }
      else {
        navigate("/");
      }

    } catch (err: any) {

      toast({
        title: "Login failed",
        description:
          err?.message || "Invalid username, password, or role",
        variant: "destructive",
      });

    } finally {
      setIsLoading(false);
    }
  };
console.log(import.meta.env.VITE_API_URL);
  return (

    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        {/* LOGO */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-xl mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-primary-foreground">
            Campus Sync
          </h1>

          <p className="text-primary-foreground/80 mt-2">
            Your college collaboration hub
          </p>

        </div>

        <Card variant="elevated">

          <CardHeader className="text-center">

            <CardTitle className="text-2xl">
              Sign In
            </CardTitle>

            <CardDescription>
              Select role and login
            </CardDescription>

          </CardHeader>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>

            <CardContent className="space-y-4">

              {/* ROLE */}
              <div className="space-y-2">

                <Label htmlFor="role">Login As</Label>

                <div className="relative">

                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as UserRole)
                    }
                    className="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                  >
                    {ROLE_OPTIONS.map((option) => (

                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>

                    ))}
                  </select>

                </div>
              </div>

              {/* USERNAME */}
              <div className="space-y-2">

                <Label>Username</Label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div className="space-y-2">

                <Label>Password</Label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >

                    {showPassword ? <EyeOff /> : <Eye />}

                  </button>

                </div>

              </div>

            </CardContent>

            <CardFooter>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >

                {isLoading ? "Signing in…" : "Sign In"}

              </Button>

            </CardFooter>

          </form>

        </Card>

        <p className="text-sm text-center text-muted-foreground mt-4 text-white cursor-pointer">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-white cursor-pointer"
          >
            Register
          </span>
        </p>

      </motion.div>

    </div>
  );
}