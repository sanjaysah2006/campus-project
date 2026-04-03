import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Grid, List } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAuth } from "@/contexts/AuthContext"
import { ClubCard } from "@/components/clubs/ClubCard"
import API from "@/lib/api"
import { Club } from "@/types"

export default function Clubs() {

  const [clubs, setClubs] = useState<Club[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const { user } = useAuth()
  const navigate = useNavigate()

  /* ================= FETCH CLUBS ================= */

  useEffect(() => {

    const fetchClubs = async () => {

      try {

        const res = await API.get("clubs/")
        setClubs(res.data)

      } catch (error) {

        console.error("Failed to fetch clubs", error)

      }

    }

    fetchClubs()

  }, [])


  /* ================= CLUB CATEGORIES ================= */

  const clubCategories = [
    "All Categories",
    ...Array.from(new Set(clubs.map((club) => club.category))),
  ]


  /* ================= FILTER LOGIC ================= */

  const filteredClubs = clubs.filter((club) => {

    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "All Categories" ||
      club.category === selectedCategory

    return matchesSearch && matchesCategory

  })


  return (

    <div className="space-y-6">

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >

        <div>
          <h1 className="text-3xl font-bold">
            Clubs Directory
          </h1>

          <p className="text-muted-foreground mt-1">
            Discover and join student organizations
          </p>
        </div>


        {/* ADMIN CREATE CLUB BUTTON */}

        {user?.role === "ADMIN" && (

          <Button onClick={() => navigate("/clubs/create")}>
            Create Club
          </Button>

        )}

      </motion.div>


      {/* Filters */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >

        {/* Search */}

        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />

        </div>


        {/* Category Filter */}

        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >

          <SelectTrigger className="w-full md:w-48">

            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />

          </SelectTrigger>

          <SelectContent>

            {clubCategories.map((category) => (

              <SelectItem
                key={category}
                value={category}
              >

                {category}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>


        {/* View Mode */}

        <div className="flex gap-2">

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >

            <Grid className="w-4 h-4" />

          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >

            <List className="w-4 h-4" />

          </Button>

        </div>

      </motion.div>


      {/* Result Count */}

      <p className="text-sm text-muted-foreground">

        Showing {filteredClubs.length} club
        {filteredClubs.length !== 1 ? "s" : ""}

      </p>


      {/* Clubs Grid */}

      <div
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >

        {filteredClubs.map((club, index) => (

          <ClubCard
            key={club.id}
            club={club}
            index={index}
          />

        ))}

      </div>


      {/* Empty State */}

      {filteredClubs.length === 0 && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >

          <p className="text-muted-foreground text-lg">
            No clubs found matching your criteria.
          </p>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {

              setSearchQuery("")
              setSelectedCategory("All Categories")

            }}
          >

            Clear Filters

          </Button>

        </motion.div>

      )}

    </div>

  )

}