const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  get: async (endpoint: string) => {
    const res = await fetch(endpoint, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
    return res.json();
  },

  post: async (endpoint: string, body?: any) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
    return res.json().catch(() => ({})); // some POSTs might return 200 OK without JSON
  },

  patch: async (endpoint: string, body?: any) => {
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${res.status}`);
    return res.json().catch(() => ({}));
  },

  delete: async (endpoint: string) => {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`);
    return res.json().catch(() => ({}));
  }
};
