import { apiClient } from "./apiClient";
import { Report, User, CoordinatorApplication, SpamReport, Notification, Comment } from "../types";

export const authService = {
  getMe: () => apiClient.get("/api/auth/me"),
  updateSettings: (settings: any) => apiClient.patch("/api/settings/me", settings),
  sendOtp: (email: string) => apiClient.post("/api/auth/send-otp", { email }),
  verifyOtp: (email: string, otp: string) => apiClient.post("/api/auth/verify-otp", { email, otp }),
};

export const masterDataService = {
  getAreas: () => apiClient.get("/api/areas"),
  getCategories: () => apiClient.get("/api/categories")
};

export const complaintService = {
  getAll: (page = 0, size = 10, bbox?: string) => 
    apiClient.get(`/api/complaints?page=${page}&size=${size}${bbox ? `&${bbox}` : ''}`),
  getComments: (id: string) => apiClient.get(`/api/complaints/${id}/comments`),
  submit: (data: any) => apiClient.post("/api/complaints", data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/api/complaints/${id}/status`, { status }),
  submitProof: (id: string, data: any) => apiClient.post(`/api/complaints/${id}/proof`, data),
  upvote: (id: string) => apiClient.post(`/api/complaints/${id}/upvote`),
  softDelete: (id: string, messageForCitizen: string, reason: string) => 
    apiClient.post(`/api/complaints/${id}/delete`, { messageForCitizen, reason }),
  addComment: (id: string, content: string) => apiClient.post(`/api/complaints/${id}/comments`, { content }),
  getAssigned: (page = 0, size = 10) => apiClient.get(`/api/complaints/assigned?page=${page}&size=${size}`),
  assignCoordinator: (reportId: string, coordinatorId: string) => apiClient.patch(`/api/complaints/${reportId}/assign`, { coordinatorId }),
  getMessages: (id: string) => apiClient.get(`/api/complaints/${id}/messages`),
  sendMessage: (id: string, content: string) => apiClient.post(`/api/complaints/${id}/messages`, { content })
};

export const adminService = {
  getUsers: (page = 0, size = 10) => apiClient.get(`/api/admin/users?page=${page}&size=${size}`),
  getComplaints: (page = 0, size = 10) => apiClient.get(`/api/admin/complaints?page=${page}&size=${size}`),
  banUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/ban`),
  unbanUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/unban`),
  broadcast: (title: string, message: string) => apiClient.post("/api/admin/broadcast", { title, message }),
  seedNotifications: () => apiClient.post("/api/admin/seed-notifications")
};

export const applicationService = {
  getAll: () => apiClient.get("/api/applications"),
  submit: (data: any) => apiClient.post("/api/applications", data),
  updateStatus: (id: string, status: string, areaId?: number) => {
    let url = `/api/applications/${id}/status?status=${status.toUpperCase()}`;
    if (areaId) url += `&areaId=${areaId}`;
    return apiClient.patch(url);
  }
};

export const spamService = {
  getAll: () => apiClient.get("/api/spam-reports"),
  submit: (data: any) => apiClient.post("/api/spam-reports", data),
  resolve: (id: string) => apiClient.patch(`/api/spam-reports/${id}/status?status=RESOLVED`)
};

export const notificationService = {
  getAll: () => apiClient.get("/api/notifications"),
  markRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/api/notifications/read-all")
};

export const auditLogService = {
  getAll: () => apiClient.get("/api/admin/audit-logs"),
};

