import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import API from "@/lib/api";

export default function AdminEventApproval() {
  const queryClient = useQueryClient();

  // 🔹 Fetch pending events
  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-pending-events"],
    queryFn: async () => {
      const res = await API.get("admin/events/all/");
      return res.data;
    },
  });

  // 🔹 Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await API.post(`admin/events/${eventId}/approve/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-events"],
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading pending events...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load pending events.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold">Event Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve pending events
        </p>
      </motion.div>

      {events.length === 0 ? (
        <div className="text-muted-foreground">
          No pending events 🎉
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Category: {event.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Club: {event.club}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(event.start_datetime).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    approveMutation.mutate(event.id)
                  }
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}