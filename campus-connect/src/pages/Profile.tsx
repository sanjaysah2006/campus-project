import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import API from "@/lib/api";

/* MEDIA FIX */
const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8000${path}`;
};

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function Profile() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  /* FETCH PROFILE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("profile/");
        setUser(res.data);
        setEditName(res.data.name);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* UPDATE PROFILE */
  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("name", editName);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await API.put("profile/update/", formData);

      toast({ title: "Profile updated" });

      window.location.reload();
    } catch {
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive",
      });
    }
  };

  /* CHANGE PASSWORD */
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      return toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
    }

    try {
      await API.post("change-password/", {
        current_password: passwords.current,
        new_password: passwords.new,
      });

      toast({ title: "Password updated" });

      setPasswords({ current: "", new: "", confirm: "" });
    } catch {
      toast({
        title: "Error",
        description: "Password change failed",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate("/login");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">No profile</div>;

  const avatarUrl = getMediaUrl(user.avatar);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold">Profile</h1>
      </motion.div>

      {/* PROFILE CARD */}
      <Card>
        <CardContent className="p-6 flex gap-6 items-center">

          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setAvatarFile(e.target.files?.[0] || null)
                }
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge className="mt-2">{user.role}</Badge>
          </div>

        </CardContent>
      </Card>

      {/* EDIT NAME */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Name"
          />

          <Button onClick={handleUpdateProfile}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Current Password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="New Password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />

          <Button onClick={handlePasswordChange}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* LOGOUT */}
      <Card>
        <CardContent className="p-4">
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}