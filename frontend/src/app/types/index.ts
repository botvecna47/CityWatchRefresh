export type Role = "citizen" | "coordinator" | "admin";
export type Status = "Reported" | "In Progress" | "Completed";
export type Area = string;

export interface AreaEntity {
  id: number;
  name: string;
  city: string;
  centerLat: number;
  centerLng: number;
  boundaryLatMin?: number;
  boundaryLatMax?: number;
  boundaryLngMin?: number;
  boundaryLngMax?: number;
}

export interface CategoryEntity {
  id: number;
  name: string;
  description: string;
  defaultSlaHours: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  area?: Area;
  status: "active" | "banned";
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    theme: "light" | "dark" | "system";
  };
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  image: string;
  locationText: string;
  lat: number;
  lng: number;
  area: Area;
  status: Status;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  upvotes: number;
  downvotes: number;
  upvotedCitizenIds?: string[];
  category?: string;
  comments: Comment[];
  messages: Message[];
  createdAt: string;
  urgency: "Low" | "Medium" | "High";
  coordinatorId?: string;
  proofImage?: string;
  resolutionLocation?: { lat: number; lng: number };
  additionalImages?: string[];
}

export interface CoordinatorApplication {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SpamReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: "user" | "report" | "comment";
  targetId: string;
  reason: string;
  status: "pending" | "resolved";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "system" | "report" | "application";
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
  };
}

