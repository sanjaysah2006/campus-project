import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Eye, EyeOff, GraduationCap, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useToast } from "@/hooks/use-toast"
import API from "@/lib/api"

export default function Register() {

  const navigate = useNavigate()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [idCard, setIdCard] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    section: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIdCard(file)
  }

  const registerMutation = useMutation({

    mutationFn: async () => {

      const form = new FormData()

      form.append("name", formData.name)
      form.append("roll_no", formData.roll_no)
      form.append("section", formData.section)
      form.append("email", formData.email)
      form.append("phone", formData.phone)
      form.append("password", formData.password)

      if (idCard) {
        form.append("id_card", idCard)
      }

      return API.post("/register/", form)
    },

    onSuccess: () => {

      toast({
        title: "Registration Successful 🎉",
        description: "You can now login."
      })

      navigate("/login")
    },

    onError: (error: any) => {

      toast({
        title: "Registration Failed",
        description:
          error?.response?.data?.roll_no?.[0] ||
          error?.response?.data?.detail ||
          "Something went wrong",
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {

      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })

      return
    }

    registerMutation.mutate()
  }

  return (

    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        <div className="text-center mb-8">

          <GraduationCap className="w-10 h-10 mx-auto text-white mb-3" />

          <h1 className="text-3xl font-bold text-white">
            Campus Sync
          </h1>

          <p className="text-white/80 mt-2">
            Join your college community
          </p>

        </div>

        <Card>

          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Complete your student registration
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>

            <CardContent className="space-y-4">

              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e)=>handleChange("name",e.target.value)}
                required
              />

              <Input
                placeholder="Roll Number"
                value={formData.roll_no}
                onChange={(e)=>handleChange("roll_no",e.target.value)}
                required
              />

              <Input
                placeholder="Section"
                value={formData.section}
                onChange={(e)=>handleChange("section",e.target.value)}
                required
              />

              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e)=>handleChange("email",e.target.value)}
                required
              />

              <Input
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e)=>handleChange("phone",e.target.value)}
                required
              />

              <div>

                <label className="flex items-center gap-2 text-sm mb-1">
                  <Upload size={16}/>
                  Upload ID Card
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdUpload}
                />

              </div>

              <div className="relative">

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e)=>handleChange("password",e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>

              </div>

              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e)=>handleChange("confirmPassword",e.target.value)}
                required
              />

            </CardContent>

            <CardFooter className="flex flex-col gap-4">

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create Account"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>

            </CardFooter>

          </form>

        </Card>

      </motion.div>

    </div>
  )
}