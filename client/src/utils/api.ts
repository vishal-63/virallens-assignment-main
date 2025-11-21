const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const config = {
      ...options,
      headers,
      credentials: "include" as RequestCredentials,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default api;
