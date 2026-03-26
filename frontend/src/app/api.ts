// Central API utility — all fetch calls go through here.
// Automatically attaches the JWT from localStorage.

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error?.error || error?.message || "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    register: (data: { username: string; email: string; password: string; city: string }) =>
      request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    me: () => request<any>("/auth/me"),
  },

  // ── Complaints ────────────────────────────────────────────────────────────
  complaints: {
    list: (params?: { areaId?: number; lat?: number; lng?: number }) => {
      const q = new URLSearchParams();
      if (params?.areaId) q.set("areaId", String(params.areaId));
      if (params?.lat) q.set("lat", String(params.lat));
      if (params?.lng) q.set("lng", String(params.lng));
      return request<any[]>(`/complaints${q.toString() ? "?" + q : ""}`);
    },

    get: (id: string | number) => request<any>(`/complaints/${id}`),

    mine: () => request<any[]>("/complaints/mine"),

    assigned: () => request<any[]>("/complaints/assigned"),

    submit: (data: {
      category: string;
      description: string;
      imageUrls?: string[];
      latitude: number;
      longitude: number;
      locationText?: string;
    }) => request<any>("/complaints", { method: "POST", body: JSON.stringify(data) }),

    updateStatus: (id: string | number, status: string) =>
      request<any>(`/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

    submitProof: (id: string | number, data: { imageUrl: string; latitude: number; longitude: number }) =>
      request<any>(`/complaints/${id}/proof`, { method: "POST", body: JSON.stringify(data) }),

    resolve: (id: string | number, accepted: boolean) =>
      request<any>(`/complaints/${id}/resolve`, { method: "POST", body: JSON.stringify({ accepted }) }),

    upvote: (id: string | number) => 
      request<any>(`/complaints/${id}/upvote`, { method: "POST" }),
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  comments: {
    list: (complaintId: string | number) => request<any[]>(`/complaints/${complaintId}/comments`),

    add: (complaintId: string | number, content: string, parentId?: number) =>
      request<any>(`/complaints/${complaintId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      }),

    moderate: (complaintId: string | number, commentId: string | number) =>
      request<any>(`/complaints/${complaintId}/comments/${commentId}`, { method: "DELETE" }),
  },

  // ── Votes ─────────────────────────────────────────────────────────────────
  votes: {
    cast: (complaintId: string | number, decision: "VALID" | "INVALID" | "NEEDS_CLARIFICATION", comment?: string) =>
      request<any>(`/complaints/${complaintId}/votes`, {
        method: "POST",
        body: JSON.stringify({ decision, comment }),
      }),
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    list: () => request<any[]>("/notifications"),
    markRead: (id: string | number) => request<any>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request<any>("/notifications/read-all", { method: "PATCH" }),
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    users: () => request<any[]>("/admin/users"),
    complaints: () => request<any[]>("/admin/complaints"),
    escalations: () => request<any[]>("/admin/escalations"),
    banUser: (id: string | number) => request<any>(`/admin/users/${id}/ban`, { method: "PATCH" }),
    unbanUser: (id: string | number) => request<any>(`/admin/users/${id}/unban`, { method: "PATCH" }),
  },
};
