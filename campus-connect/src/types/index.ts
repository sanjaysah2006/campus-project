import { ReactNode } from "react";

// ---------------- ROLES ----------------
export type UserRole = "STUDENT" | "ORGANIZER" | "ADMIN";


// ---------------- USER ----------------
export interface User {
  id?: string;
  username: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  
}


// ---------------- CLUB ----------------
export interface Club {
  id: string;
  name: string;
  description: string;
  image?: string;

  organizer_name?: string;
  organizer_rollno?: string;

  category?: string;
}


// ---------------- EVENT ----------------
export interface Event {
  id: number;

  title: string;
  description: string;

  // ✅ FIXED FIELDS
  date: string;
  location: string;

  // ✅ IMAGE FIX
  image?: string;

  // ✅ STATUS
  approved: boolean;

  // ✅ CLUB INFO (clean)
  club: {
    id: number;
    name: string;
  } | number;
}

// ---------------- MESSAGE ----------------
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}


// ---------------- REQUEST ----------------
export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "COMPLETED"
  | "REJECTED";

export type RequestPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export interface AssistanceRequest {
  id: string;
  title: string;
  description: string;

  official_name: string;
  official_department: string;

  event_date: string;

  priority: RequestPriority;
  status: RequestStatus;

  created_at?: string;
}


// ---------------- NAVIGATION ----------------
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}
