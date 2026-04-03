import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMediaUrl } from "@/lib/media";

/* ================= TYPES ================= */

interface Club {
  id: number;
  name: string;
  description: string;
  category?: string;
  image?: string;

  organizer?: number;
  organizer_name?: string;
  organizer_email?: string;   // ✅ added
  organizer_phone?: string;   // ✅ added
  organizer_rollno?: string;
}

interface EventType {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  club: number;
  image?: string;
}

/* ================= EVENT IMAGE HELPER ================= */

function EventImage({ image, title }: { image?: string; title: string }) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = image || null;
console.log("EventImage imageUrl:", imageUrl);
  if (imageUrl && !imgError) {
    return (
      <div className="h-40 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-40 w-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-semibold px-4 text-center">
      {title}
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function ClubProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ================= STATES (REQUEST) ================= */

  const [openRequest, setOpenRequest] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* ================= FETCH CLUB ================= */

  const {
    data: club,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["club", id],
    queryFn: async () => {
      const res = await API.get(`clubs/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  /* ================= FETCH EVENTS ================= */

  const { data: events = [] } = useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const res = await API.get("events/");
      const all = res.data.filter((e: EventType) => e.club === Number(id));
      console.log("All events for club", id, all);
      return all;
    },
    enabled: !!id,
  });

  /* ================= CREATE CHAT ================= */

  const createChat = useMutation({
    mutationFn: async () => {
      if (!club?.organizer) {
        throw new Error("Organizer not found");
      }

      return API.post("chat/create/", {
        user_id: club.organizer,
        club_id: club.id,
      });
    },

    onSuccess: async (res) => {
      const conversationId = res.data.conversation_id;

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      navigate(`/messages?conversation=${conversationId}`);
    },

    onError: (err) => {
      console.error("Chat error:", err);
      alert("Failed to start chat");
    },
  });

  /* ================= CREATE REQUEST ================= */

  const createRequest = useMutation({
    mutationFn: async () => {
      return API.post("requests/create/", {
        club: club.id,
        title,
        description,
      });
    },

    onSuccess: () => {
      alert("Request created ✅");
      setOpenRequest(false);
      setTitle("");
      setDescription("");
    },

    onError: (err) => {
      console.error("Request error:", err);
      alert("Failed to create request ❌");
    },
  });

  /* ================= LOADING / ERROR ================= */

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading club...
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="text-center py-12 text-red-500">
        Club not found
      </div>
    );
  }

  /* ================= LOGIC ================= */

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const upcomingEvents = events.filter((e: EventType) => {
    const eventDateStr = e.date.split("T")[0];
    return eventDateStr >= todayStr;
  });

  const pastEvents = events.filter((e: EventType) => {
    const eventDateStr = e.date.split("T")[0];
    return eventDateStr < todayStr;
  });

  const isOrganizer =
    club.organizer === user?.id ||
    club.organizer_rollno === user?.username ||
    club.organizer_name === user?.username;

  const canMessage = !isOrganizer && !!club.organizer;

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* BACK */}
      <Link to="/clubs">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clubs
        </Button>
      </Link>

      {/* CLUB BANNER IMAGE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-muted"
      >
        {club.image ? (
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}

        <div className="absolute bottom-4 left-6">
          <h1 className="text-3xl font-bold text-white">{club.name}</h1>

          {club.category && (
            <Badge className="mt-2">{club.category}</Badge>
          )}
        </div>
      </motion.div>

      {/* ACTION BUTTONS */}
      {isOrganizer ? (
        <Button onClick={() => navigate(`/events/create/${club.id}`)}>
          + Create Event
        </Button>
      ) : (
        <div className="flex gap-3">

          {/* MESSAGE BUTTON */}
          <Button
            disabled={!canMessage || createChat.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => createChat.mutate()}
          >
            {createChat.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening chat...
              </>
            ) : (
              "💬 Message Club"
            )}
          </Button>

          {/* REQUEST BUTTON — hidden for students */}
          {user?.role !== "STUDENT" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setOpenRequest(true)}
            >
              📩 Request Assistance
            </Button>
          )}
        </div>
      )}

      {/* REQUEST MODAL */}
      {openRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

            <h2 className="text-lg font-semibold">Create Request</h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenRequest(false)}>
                Cancel
              </Button>

              <Button
                onClick={() => createRequest.mutate()}
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {club.description || "No description"}
            </CardContent>
          </Card>

          {/* ================= EVENTS ================= */}

          <Tabs defaultValue="upcoming">

            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            {/* ================= UPCOMING ================= */}
            <TabsContent value="upcoming">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    No upcoming events
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingEvents.map((e: EventType) => (
                    <Card key={e.id} className="overflow-hidden">

                      <EventImage image={e.image} title={e.title} />

                      <CardContent className="p-4 space-y-2">

                        <h3 className="font-semibold text-lg">
                          {e.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          📅 {new Date(e.date).toLocaleString()}
                        </p>

                        <p className="text-sm">
                          📍 {e.location}
                        </p>

                        <Badge className="bg-green-500 text-white">
                          Upcoming
                        </Badge>

                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => navigate(`/events/${e.id}`)}
                        >
                          View Details →
                        </Button>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ================= PAST ================= */}
            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    No past events
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pastEvents.map((e: EventType) => (
                    <Card key={e.id} className="overflow-hidden opacity-80">

                      <EventImage image={e.image} title={e.title} />

                      <CardContent className="p-4 space-y-2">

                        <h3 className="font-semibold text-lg">
                          {e.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          📅 {new Date(e.date).toLocaleString()}
                        </p>

                        <Badge variant="secondary">
                          Completed
                        </Badge>

                        <Button
                          variant="ghost"
                          className="w-full mt-2"
                          onClick={() => navigate(`/events/${e.id}`)}
                        >
                          View Details →
                        </Button>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>

        </div>

        <div className="space-y-6">

          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-xl font-bold">{events.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Events
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ================= COORDINATOR CARD ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Coordinator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">

                {/* AVATAR */}
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-lg font-bold">
                    {club.organizer_name?.charAt(0)?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>

                {/* DETAILS */}
                <div className="space-y-1">

                  {/* NAME */}
                  <p className="font-semibold text-base">
                    {club.organizer_name || "Not Assigned"}
                  </p>

                  {/* EMAIL */}
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    ✉️{" "}
                    {club.organizer_email ? (
                      <a
                        href={`mailto:${club.organizer_email}`}
                        className="hover:underline text-blue-600"
                      >
                        {club.organizer_email}
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </p>

                  {/* PHONE */}
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    📞{" "}
                    {club.organizer_phone ? (
                      <a
                        href={`tel:${club.organizer_phone}`}
                        className="hover:underline text-blue-600"
                      >
                        {club.organizer_phone}
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </p>

                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
