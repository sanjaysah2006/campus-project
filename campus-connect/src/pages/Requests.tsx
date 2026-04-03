import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import API from "@/lib/api";

/* ================= TYPES ================= */

interface RequestType {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed";
  club_name: string;
  requester_name: string;
  created_at: string;
}

/* ================= COMPONENT ================= */

export default function Requests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  const fetchRequests = async () => {
    try {
      const res = await API.get("requests/");
      setRequests(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (
    id: number,
    status: "accepted" | "completed"
  ) => {
    try {
      await API.patch(`requests/${id}/update/`, { status });
      fetchRequests();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  /* ================= FILTER ================= */

  const pending = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");
  const completed = requests.filter((r) => r.status === "completed");

  if (loading) return <div className="p-6">Loading requests...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Assistance Requests
          </h1>
          <p className="text-muted-foreground">
            Manage event assistance workflow
          </p>
        </div>

        {/* OPTIONAL BUTTON */}
        <Link to="/clubs">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create via Club
          </Button>
        </Link>
      </motion.div>

      {/* TABS */}
      <Tabs defaultValue="pending">

        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({accepted.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        {/* ================= PENDING ================= */}
        <TabsContent value="pending">
          <div className="grid md:grid-cols-2 gap-4">

            {pending.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5 space-y-3">

                  <Badge className="bg-yellow-500 text-white">
                    Pending
                  </Badge>

                  <h3 className="font-bold text-lg">
                    {r.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {r.description}
                  </p>

                  <p className="text-sm">
                    <strong>Club:</strong> {r.club_name}
                  </p>

                  <p className="text-sm">
                    <strong>Requested by:</strong>{" "}
                    {r.requester_name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </p>

                  {/* ORGANIZER ACTION */}
                  {user?.role === "ORGANIZER" && (
                    <div className="flex gap-2 pt-2">

                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus(r.id, "accepted")
                        }
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatus(r.id, "completed")
                        }
                      >
                        Complete
                      </Button>

                    </div>
                  )}

                </CardContent>
              </Card>
            ))}

            {pending.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  No pending requests
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>

        {/* ================= ACCEPTED ================= */}
        <TabsContent value="accepted">
          <div className="grid md:grid-cols-2 gap-4">

            {accepted.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5 space-y-2">

                  <Badge className="bg-blue-600 text-white">
                    Accepted
                  </Badge>

                  <h3 className="font-bold">{r.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    {r.description}
                  </p>

                </CardContent>
              </Card>
            ))}

          </div>
        </TabsContent>

        {/* ================= COMPLETED ================= */}
        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">

            {completed.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5 space-y-2">

                  <Badge className="bg-green-600 text-white">
                    Completed
                  </Badge>

                  <h3 className="font-bold">{r.title}</h3>

                </CardContent>
              </Card>
            ))}

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}