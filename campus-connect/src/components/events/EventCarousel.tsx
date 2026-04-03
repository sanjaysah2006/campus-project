import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getMediaUrl } from "@/lib/media";
interface Event {
  id: number;
  title: string;
  date: string;              // ✅ FIXED
  location?: string;         // ✅ FIXED
  image?: string;            // ✅ FIXED
  club_name?: string;        // ✅ FIXED (from serializer)
}

interface EventCarouselProps {
  events: Event[];
}

/* Media helper */


export default function EventCarousel({ events }: EventCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!events || events.length === 0) return null;

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) =>
      dir === 1 ? (prev + 1) % events.length : prev === 0 ? events.length - 1 : prev - 1
    );
  };

  const currentEvent = events[currentIndex];

  /* ✅ FIXED DATE */
  const eventDate = currentEvent.date
    ? new Date(currentEvent.date)
    : null;

  const formattedDate =
    eventDate && !isNaN(eventDate.getTime())
      ? eventDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "No Date";

  /* ✅ FIXED IMAGE */
  const imageUrl = getMediaUrl(currentEvent.image) || null;
  console.log("EventCarousel imageUrl:", imageUrl);
  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl">

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction < 0 ? 300 : -300 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >

          {/* ✅ BACKGROUND IMAGE */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={currentEvent.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {currentEvent.title}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* CONTENT */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">

            {/* ✅ CLUB NAME */}
            {currentEvent.club_name && (
              <div className="mb-3 text-sm text-white/80 font-medium">
                {currentEvent.club_name}
              </div>
            )}

            {/* TITLE */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-2xl">
              {currentEvent.title}
            </h2>

            {/* DATE + LOCATION */}
            <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base">

              {/* DATE */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>

              {/* LOCATION */}
              {currentEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentEvent.location}</span>
                </div>
              )}

            </div>

            {/* BUTTON */}
            <Link to={`/events/${currentEvent.id}`}>
              <Button variant="accent" size="lg" className="mt-6">
                View Details
              </Button>
            </Link>

          </div>

        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION */}
      {events.length > 1 && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* DOTS */}
      {events.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}