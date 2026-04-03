import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Club } from "@/types";

/* MEDIA FIX */
const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8000${path}`;
};

interface ClubCardProps {
  club: Club;
  index?: number;
}

export function ClubCard({ club, index = 0 }: ClubCardProps) {

  const logoUrl = getMediaUrl(club.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Card className="h-full rounded-2xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition">

        <CardContent className="p-5">

          <div className="flex gap-4">

            {/* LOGO */}
            <div>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={club.name}
                  className="w-16 h-16 rounded-xl object-cover shadow ring-2 ring-white group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {club.name.charAt(0)}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">

              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition">
                  {club.name}
                </h3>

                {club.category && (
                  <Badge className="text-xs bg-indigo-100 text-indigo-600">
                    {club.category}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {club.description}
              </p>

              <div className="flex justify-end">
                <Link to={`/clubs/${club.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:bg-indigo-50"
                  >
                    View Club
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

            </div>

          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}