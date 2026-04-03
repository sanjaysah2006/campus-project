import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";

interface Club {
  id: number;
  name: string;
  logo?: string;
}

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    priority: "",
    targetClubs: [] as number[],
  });

  // 🔹 Fetch Clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await API.get("clubs/");
        setClubs(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClubs();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleClub = (clubId: number) => {
    setFormData((prev) => ({
      ...prev,
      targetClubs: prev.targetClubs.includes(clubId)
        ? prev.targetClubs.filter((id) => id !== clubId)
        : [...prev.targetClubs, clubId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.post("requests/create/", {
        title: formData.title,
        description: formData.description,
        event_date: formData.eventDate,
        priority: formData.priority,
        target_clubs: formData.targetClubs,
      });

      toast({
        title: "Request Created",
        description: "Your request has been sent successfully.",
      });

      navigate("/requests");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔒 Only ADMIN or ORGANIZER (adjust to your roles)
  if (user?.role !== "ADMIN" && user?.role !== "ORGANIZER") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          You don't have permission to create requests.
        </p>
        <Link to="/requests">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <Link to="/requests">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Requests
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          Create Assistance Request
        </h1>
        <p className="text-muted-foreground mt-1">
          Request help from student clubs
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Provide information about your assistance needs
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div className="space-y-2">
                <Label>Request Title</Label>
                <Input
                  placeholder="Enter request title"
                  value={formData.title}
                  onChange={(e) =>
                    handleChange("title", e.target.value)
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your requirements..."
                  value={formData.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  rows={4}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    handleChange("eventDate", e.target.value)
                  }
                  required
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clubs */}
              <div className="space-y-3">
                <Label>Select Clubs</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border"
                    >
                      <Checkbox
                        checked={formData.targetClubs.includes(club.id)}
                        onCheckedChange={() =>
                          toggleClub(club.id)
                        }
                      />
                      <span>{club.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    formData.targetClubs.length === 0
                  }
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Request"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
