import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Users, TrendingUp } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EventCarousel from "@/components/events/EventCarousel";
import { ClubCard } from "@/components/clubs/ClubCard";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { Event, Club } from "@/types";
import TopNav from "@/components/layout/TopNav";

const Index = () => {
  const { user } = useAuth();

  // ✅ GET SEARCH FROM MAIN LAYOUT
  const { search } = useOutletContext<{ search: string }>();

  /* ---------------- FETCH EVENTS ---------------- */
  const {
    data: events = [],
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: ["home-events", user?.role],
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
        const res = await API.get("admin/events/pending/");
        return res.data;
      }

      return [];
    },
  });

  /* ---------------- FETCH CLUBS ---------------- */
  const {
    data: clubs = [],
    isLoading: clubsLoading,
  } = useQuery({
    queryKey: ["home-clubs"],
    queryFn: async () => {
      const res = await API.get("clubs/");
      return res.data;
    },
  });

  const loading = eventsLoading || clubsLoading;

  /* ---------------- FILTER EVENTS ---------------- */
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e: Event) => new Date(e.date) > new Date()) // upcoming only
      .filter((e: Event) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      ) // 🔍 search filter
      .sort(
        (a: Event, b: Event) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [events, search]);

  /* ---------------- FEATURED CLUBS ---------------- */
  const featuredClubs = useMemo(() => {
    return clubs.slice(0, 4);
  }, [clubs]);

  /* ---------------- STATS ---------------- */
  const stats = [
    {
      label: "Active Clubs",
      value: clubs.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-accent",
    },
    {
      label: "Total Events",
      value: events.length,
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TopNav events={events} />
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.username || "User"} 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening on campus
          </p>
        </div>

        {/* {user?.role === "ORGANIZER" && (
          <Link to="/events/create">
            <Button variant="hero">Create Event</Button>
          </Link>
        )} */}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground text-sm">
              Don’t miss these
            </p>
          </div>

          <Link to="/events">
            <Button variant="ghost">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* ✅ FIXED CAROUSEL */}
        {upcomingEvents.length > 0 ? (
          <EventCarousel events={upcomingEvents} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No upcoming events found
          </p>
        )}
      </section>

      {/* Featured Clubs */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold">Featured Clubs</h2>
            <p className="text-muted-foreground text-sm">
              Explore communities
            </p>
          </div>

          <Link to="/clubs">
            <Button variant="ghost">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredClubs.map((club: Club, index: number) => (
            <ClubCard key={club.id} club={club} index={index} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Index;