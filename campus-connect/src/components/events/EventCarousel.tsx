import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getMediaUrl } from "@/lib/media";
import { useEffect } from "react";
interface Event {
  id: number;
  title: string;
  date: string;
  location?: string;
  image?: string;
  club_name?: string;
}

interface EventCarouselProps {
  events: Event[];
}

export default function EventCarousel({ events }: EventCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // ✅ ONLY CHANGE: filter upcoming events
  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  if (!upcomingEvents || upcomingEvents.length === 0) return null;

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) => {
      const total = upcomingEvents.length;
      return dir === 1
        ? (prev + 1) % total
        : (prev - 1 + total) % total;
    }
    );
  };

  const currentEvent = upcomingEvents[currentIndex];

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

  const imageUrl = getMediaUrl(currentEvent.image) || null;




  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        (prev + 1) % upcomingEvents.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, upcomingEvents.length]);


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

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">

            {currentEvent.club_name && (
              <div className="mb-3 text-sm text-white/80 font-medium">
                {currentEvent.club_name}
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-2xl">
              {currentEvent.title}
            </h2>

            <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base">

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>

              {currentEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentEvent.location}</span>
                </div>
              )}

            </div>

            <Link to={`/events/${currentEvent.id}`}>
              <Button variant="accent" size="lg" className="mt-6">
                View Details
              </Button>
            </Link>

          </div>

        </motion.div>
      </AnimatePresence>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      ></div>

      {upcomingEvents.length > 1 && (
        <>
          <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2">
            <ChevronLeft />
          </button>
          <button onClick={() => navigate(1)} className="absolute right-4 top-1/2 -translate-y-1/2">
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
}