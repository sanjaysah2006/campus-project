import { useEffect, useState } from "react";
import API from "@/lib/api";

interface DashboardStats {
  total_clubs: number;
  pending_clubs: number;
  total_events: number;
  pending_events: number;
  active_events: number;
  total_registrations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("admin/dashboard/");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <div className="card">Total Clubs: {stats.total_clubs}</div>
      <div className="card">Pending Clubs: {stats.pending_clubs}</div>
      <div className="card">Total Events: {stats.total_events}</div>
      <div className="card">Pending Events: {stats.pending_events}</div>
      <div className="card">Active Events: {stats.active_events}</div>
      <div className="card">Registrations: {stats.total_registrations}</div>
    </div>
  );
}
