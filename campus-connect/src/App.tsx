import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"

import { MainLayout } from "@/components/layout/MainLayout"

import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"


import Clubs from "./pages/Clubs"
import ClubProfile from "./pages/ClubProfile"
import CreateClub from "./pages/CreateClub"
import Events from "./pages/Events"
import EventDetails from "./pages/EventDetails"
import CreateEvent from "./pages/CreateEvent"

import Messages from "./pages/Messages"

import Requests from "./pages/Requests"
import CreateRequest from "./pages/CreateRequest"

import Profile from "./pages/Profile"

import AdminDashboard from "./pages/admin/AdminDashboard"

import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>

      <AuthProvider>

        <TooltipProvider>

          <Toaster />
          <Sonner />

          <BrowserRouter>

            <Routes>

              {/* PUBLIC ROUTES */}

              <Route path="/login" element={<Login />} />
              
              <Route path="/register" element={<Register />} />

              {/* PROTECTED ROUTES */}

              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >

                <Route path="/" element={<Index />} />

                <Route path="/clubs" element={<Clubs />} />
                <Route path="/clubs/:id" element={<ClubProfile />} />
                <Route path="/clubs/create" element={<CreateClub />} />

                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/create/:clubId" element={<CreateEvent />} />

                <Route path="/messages" element={<Messages />} />

                <Route path="/requests" element={<Requests />} />
                <Route path="/requests/create" element={<CreateRequest />} />

                <Route path="/profile" element={<Profile />} />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

              </Route>

              {/* FALLBACK */}

              <Route path="*" element={<NotFound />} />

            </Routes>

          </BrowserRouter>

        </TooltipProvider>

      </AuthProvider>

    </QueryClientProvider>
  )
}

export default App