import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Event } from "@/types";
import { getMediaUrl } from "@/lib/media";

interface EventCardProps {
  event: Event;
  role?: string;
  index?: number;
}

export function EventCard({ event, role, index = 0 }: EventCardProps) {

  /* ---------------- SAFE DATE ---------------- */

  const eventDate = event.date ? new Date(event.date) : null;

  const formattedDate = eventDate && !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "No Date";

  /* ---------------- IMAGE ---------------- */

  const imageUrl = getMediaUrl(event.image) || null;
  console.log("EventCard imageUrl:", imageUrl);
  /* ---------------- CLUB NAME ---------------- */

  const clubName =
    typeof event.club === "object"
      ? event.club.name
      : "Club";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">

        {/* IMAGE / BANNER */}
        <div className="relative h-44 overflow-hidden">

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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg">
              {event.title}
            </div>
          )}

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* STATUS */}
          {role !== "STUDENT" && (
            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.approved
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 text-white"
                }`}
              >
                {event.approved ? "Approved" : "Pending"}
              </span>
            </div>
          )}

          {/* CLUB NAME */}
          <div className="absolute bottom-3 left-3 bg-white/90 rounded-full py-1 px-3 text-xs font-medium shadow">
            {clubName}
          </div>

        </div>

        {/* CONTENT */}
        <CardContent className="p-4">

          <h3 className="font-bold text-lg mb-2 line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">

            {/* DATE */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </div>

            {/* LOCATION */}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

          </div>

          {/* BUTTON */}
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

        </CardContent>

      </Card>
    </motion.div>
  );
}