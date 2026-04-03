import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import API from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function CreateEvent() {

  const navigate = useNavigate()

  const [image, setImage] = useState<File | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()

      data.append("title", form.title)
      data.append("description", form.description)
      data.append("date", form.date)
      data.append("location", form.location)

      if (image) {
        data.append("image", image)
      }

      // ❌ NO club field here

      await API.post("/events/create/", data)

      alert("Event Created (Pending approval)")
      navigate("/events")

    } catch (error) {
      console.error(error)
      alert("Error creating event")
    }

    setLoading(false)
  }

  /* ================= UI ================= */

  return (

    <div className="min-h-screen flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >

        <Card className="shadow-xl">

          <CardHeader>
            <CardTitle className="text-2xl">
              Create Event
            </CardTitle>

            <CardDescription>
              Organize a new event for your club
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>

            <CardContent className="space-y-5">

              {/* TITLE */}
              <Input
                placeholder="Event Title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />

              {/* DESCRIPTION */}
              <textarea
                className="w-full border rounded-md p-3 text-sm"
                placeholder="Event Description"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />

              {/* DATE */}
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />

              {/* LOCATION */}
              <Input
                placeholder="Event Location"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />

              {/* IMAGE */}
              <div>
                <p className="text-sm mb-1">Event Image</p>

                <input
                  type="file"
                  onChange={(e) =>
                    setImage(e.target.files?.[0] || null)
                  }
                />
              </div>

              {/* BUTTON */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>

            </CardContent>

          </form>

        </Card>

      </motion.div>

    </div>

  )
}