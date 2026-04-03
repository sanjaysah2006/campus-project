import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/events/EventCard";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { Event } from "@/types";

/* FIX MEDIA */
const getMediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8000${path}`;
};

export default function Events() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  /* ---------------- FETCH ---------------- */
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ["events", user?.role],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      if (user.role === "STUDENT") {
        const res = await API.get("student/events/");
        return res.data;
      }

      if (user.role === "ORGANIZER") {
        const res = await API.get("organizer/events/history/");
        return res.data;
      }

      if (user.role === "ADMIN") {
        const res = await API.get("admin/events/all/");
        return res.data;
      }

      return [];
    },
  });

  /* ---------------- ADMIN ---------------- */

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await API.post(`admin/events/${id}/approve/`);
    },
    onSuccess: () => {
      toast({ title: "Event Approved" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await API.post(`admin/events/${id}/reject/`);
    },
    onSuccess: () => {
      toast({ title: "Event Rejected", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  /* ---------------- FILTER ---------------- */

  const filterEvents = (eventsList: Event[]) => {
    return eventsList
      .filter((event) => {
        const title = event.title?.toLowerCase() || "";

        const club =
          typeof event.club === "object"
            ? event.club?.name?.toLowerCase() || ""
            : (event.club || "").toString().toLowerCase();

        return (
          title.includes(searchQuery.toLowerCase()) ||
          club.includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );
        }

        return (a.title || "").localeCompare(b.title || "");
      });
  };

  /* ---------------- SPLIT ---------------- */

  const approvedEvents = events.filter((e: Event) => e.approved);
  const pendingEvents = events.filter((e: Event) => !e.approved);

  const now = new Date();

  const upcomingEvents = approvedEvents.filter(
    (e: Event) =>
      e.date &&
      new Date(e.date) >= now
  );

  const pastEvents = approvedEvents.filter(
    (e: Event) =>
      e.date &&
      new Date(e.date) < now
  );

  /* ---------------- STATES ---------------- */

  if (isLoading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load events
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">
          Discover campus events and activities
        </p>
      </motion.div>

      {/* SEARCH */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by event or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- STUDENT ---------------- */}

      {user?.role === "STUDENT" && (
        <Tabs defaultValue="upcoming">

          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvents(upcomingEvents).map((event, i) => (
                <EventCard key={event.id} event={event} index={i} role={user.role} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvents(pastEvents).map((event, i) => (
                <EventCard key={event.id} event={event} index={i} role={user.role} />
              ))}
            </div>
          </TabsContent>

        </Tabs>
      )}

      {/* ---------------- ORGANIZER ---------------- */}

      {user?.role === "ORGANIZER" && (
        <Tabs defaultValue="upcoming">

          {/* TAB BUTTONS */}
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* UPCOMING EVENTS */}
          <TabsContent value="upcoming">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  role={user.role}
                />
              ))}
            </div>
          </TabsContent>

          {/* PAST EVENTS */}
          <TabsContent value="past">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  role={user.role}
                />
              ))}
            </div>
          </TabsContent>

        </Tabs>
      )}

      {/* ---------------- ADMIN ---------------- */}

      {user?.role === "ADMIN" && (
        <Tabs defaultValue="approved">

          <TabsList>
            <TabsTrigger value="approved">
              Approved ({approvedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvents(approvedEvents).map((event, i) => (
                <EventCard key={event.id} event={event} index={i} role={user.role} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvents(pendingEvents).map((event, i) => (
                <div key={event.id} className="relative">

                  <EventCard event={event} index={i} role={user.role} />

                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    Pending
                  </Badge>

                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(event.id)}>
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(event.id)}
                    >
                      Reject
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}