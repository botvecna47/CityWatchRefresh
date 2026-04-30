import { apiClient } from "./apiClient";
import { Report, User, CoordinatorApplication, SpamReport, Notification, Comment } from "../types";

export const authService = {
  getMe: () => apiClient.get("/api/auth/me"),
  updateSettings: (settings: any) => apiClient.patch("/api/settings/me", settings)
};

export const masterDataService = {
  getAreas: () => apiClient.get("/api/areas"),
  getCategories: () => apiClient.get("/api/categories")
};

export const complaintService = {
  getAll: () => apiClient.get("/api/complaints"),
  getComments: (id: string) => apiClient.get(`/api/complaints/${id}/comments`),
  submit: (data: any) => apiClient.post("/api/complaints", data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/api/complaints/${id}/status`, { status }),
  submitProof: (id: string, data: any) => apiClient.post(`/api/complaints/${id}/proof`, data),
  upvote: (id: string) => apiClient.post(`/api/complaints/${id}/upvote`),
  delete: (id: string) => apiClient.delete(`/api/admin/complaints/${id}`),
  addComment: (id: string, content: string) => apiClient.post(`/api/complaints/${id}/comments`, { content }),
  assignCoordinator: (reportId: string, coordinatorId: string) => apiClient.patch(`/api/complaints/${reportId}/assign`, { coordinatorId }),
  getMessages: (id: string) => apiClient.get(`/api/complaints/${id}/messages`),
  sendMessage: (id: string, content: string) => apiClient.post(`/api/complaints/${id}/messages`, { content })
};

export const adminService = {
  getUsers: () => apiClient.get("/api/admin/users"),
  banUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/ban`),
  unbanUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/unban`)
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
