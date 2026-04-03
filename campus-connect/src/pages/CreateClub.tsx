import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"

import API from "@/lib/api"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"

export default function CreateClub() {

  const navigate = useNavigate()

  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  const [image, setImage] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "TECH",
    organizer_id: ""
  })


  /* ================= FETCH STUDENTS ================= */

  useEffect(() => {

    const fetchStudents = async () => {

      try {

        const res = await API.get("/students/")
        setStudents(res.data)

      } catch (err) {

        console.error("Failed to load students", err)

      } finally {

        setLoadingStudents(false)

      }

    }

    fetchStudents()

  }, [])


  /* ================= CREATE CLUB ================= */

  const createClub = useMutation({

    mutationFn: async () => {

      const data = new FormData()

      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("category", formData.category)

      if (formData.organizer_id) {
        data.append("organizer_id", formData.organizer_id)
      }

      if (image) {
        data.append("image", image)
      }

      return API.post("/clubs/create/", data)

    },

    onSuccess: () => {

      alert("Club created successfully")
      navigate("/clubs")

    },

    onError: () => {

      alert("Failed to create club")

    }

  })


  /* ================= HANDLERS ================= */

  const handleChange = (field: string, value: string) => {

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

  }

  const handleSubmit = (e: any) => {

    e.preventDefault()
    createClub.mutate()

  }


  return (

    <div className="p-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >

        <Card>

          <CardHeader>

            <CardTitle>
              Create Club
            </CardTitle>

            <CardDescription>
              Create a new club and assign a coordinator
            </CardDescription>

          </CardHeader>


          <form onSubmit={handleSubmit}>

            <CardContent className="space-y-6">

              {/* CLUB NAME */}

              <Input
                placeholder="Club Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />


              {/* DESCRIPTION */}

              <textarea
                className="w-full border rounded-md p-3 text-sm"
                placeholder="Club Description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />


              {/* CATEGORY */}

              <select
                className="w-full border rounded-md p-2"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="TECH">Tech</option>
                <option value="CULTURAL">Cultural</option>
                <option value="SPORTS">Sports</option>
                <option value="GENERAL">General</option>
              </select>


              {/* 🔥 COORDINATOR DROPDOWN */}

              <div>

                <p className="text-sm mb-1">
                  Assign Coordinator
                </p>

                {loadingStudents ? (

                  <p className="text-sm text-muted-foreground">
                    Loading students...
                  </p>

                ) : (

                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.organizer_id}
                    onChange={(e) => handleChange("organizer_id", e.target.value)}
                  >

                    <option value="">
                      Select Coordinator
                    </option>

                    {students.map((s) => (

                      <option key={s.id} value={s.id}>

                        {s.name} ({s.roll})

                      </option>

                    ))}

                  </select>

                )}

              </div>


              {/* IMAGE UPLOAD */}

              <div>

                <p className="text-sm mb-1">
                  Club Image / Badge
                </p>

                <input
                  type="file"
                  onChange={(e) =>
                    setImage(e.target.files?.[0] || null)
                  }
                />

              </div>


              {/* SUBMIT */}

              <Button
                className="w-full"
                type="submit"
                disabled={createClub.isPending}
              >

                {createClub.isPending
                  ? "Creating Club..."
                  : "Create Club"}

              </Button>

            </CardContent>

          </form>

        </Card>

      </motion.div>

    </div>

  )

}