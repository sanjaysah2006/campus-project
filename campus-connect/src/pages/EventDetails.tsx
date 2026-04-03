import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, MapPin, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getMediaUrl } from "@/lib/media";
/* Fix Django media path */


export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* Fetch event */
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await API.get(`events/${id}/`);
        setEvent(res.data);

        if (user?.role === "STUDENT") {
          await API.post(`student/events/${id}/view/`);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  /* Register */
  const handleRegister = async () => {
    try {
      await API.post(`student/events/${event.id}/register/`);
      alert("Successfully Registered!");
    } catch {
      alert("Already registered or error occurred.");
    }
  };

  /* Download Excel */
  const downloadExcel = async () => {
    try {
      const res = await API.get(
        `events/${event.id}/registrations/export/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `event_${event.id}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Download failed");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  /* ✅ FIXED DATE */
  const eventDate = event.date ? new Date(event.date) : null;

  const formattedDate =
    eventDate && !isNaN(eventDate.getTime())
      ? eventDate.toDateString()
      : "No Date";

  /* ✅ IMAGE FIX */
  const imageUrl = getMediaUrl(event.image) || null;

  /* ✅ CLUB NAME FIX */
  const clubName =
    event.club_name || "Club";

  /* ✅ UPCOMING FIX */
  const isUpcoming =
    eventDate && eventDate >= new Date();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Back */}
      <Link to="/events">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 md:h-96 rounded-2xl overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-2xl font-semibold">
            {event.title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute bottom-6 left-6">
          <Badge className="mb-3 bg-white text-black">
            {isUpcoming ? "Upcoming" : "Past Event"}
          </Badge>

          <h1 className="text-3xl font-bold text-white">
            {event.title}
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                
                About This Event
              </h2>

              <p className="text-muted-foreground">
                {event.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          <Card>
            <CardContent className="p-5 space-y-4">

              {/* DATE */}
              <div className="flex gap-3">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date
                  </p>
                  <p className="font-semibold">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* TIME */}
              <div className="flex gap-3">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Time
                  </p>
                  <p className="font-semibold">
                    Full Day Event
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Venue
                  </p>
                  <p className="font-semibold">
                    {event.location || "Online"}
                  </p>
                </div>
              </div>

              {/* REGISTRATION */}
              {user?.role !== "STUDENT" && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registrations
                  </p>
                  <p className="font-semibold">
                    {event.registrations ?? 0} students
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* CLUB */}
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Organized by
              </p>
              <p className="font-semibold">
                {clubName}
              </p>
            </CardContent>
          </Card>

          {/* DOWNLOAD */}
          {user?.role !== "STUDENT" && (
            <Button className="w-full" onClick={downloadExcel}>
              <Download className="w-4 h-4 mr-2" />
              Download Student List
            </Button>
          )}

          {/* REGISTER */}
          {user?.role === "STUDENT" && isUpcoming && (
            <Button className="w-full" onClick={handleRegister}>
              Register for Event
            </Button>
          )}

        </div>

      </div>
    </div>
  );
}