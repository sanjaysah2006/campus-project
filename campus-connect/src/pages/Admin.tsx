import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import API from "@/lib/api";

interface DashboardStats {
  total_clubs: number;
  pending_clubs: number;
  total_events: number;
  pending_events: number;
  active_events: number;
  total_registrations: number;
}

export default function Admin() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Only admin access
  if (user?.role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <Link to="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  // 🔹 Fetch Dashboard Stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await API.get("admin/dashboard/");
        setStats(statsRes.data);

        const pendingRes = await API.get("admin/events/pending/");
        setPendingEvents(pendingRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const approveEvent = async (eventId: number) => {
    try {
      await API.post(`admin/events/${eventId}/approve/`);
      setPendingEvents((prev) =>
        prev.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage system approvals and statistics
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total_clubs}</p>
              <p className="text-sm text-muted-foreground">Total Clubs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Calendar className="w-6 h-6 text-accent" />
            <div>
              <p className="text-2xl font-bold">{stats.total_events}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <p className="text-2xl font-bold">{stats.total_registrations}</p>
              <p className="text-sm text-muted-foreground">
                Total Registrations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pending events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Events ({pendingEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pendingEvents
                    .filter((event) =>
                      event.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.club?.name}</TableCell>
                        <TableCell>
                          {new Date(
                            event.start_datetime
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-warning/20 text-warning">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => approveEvent(event.id)}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
