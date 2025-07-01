// Utility functions for making API calls to our backend routes

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Profile API calls
export const profileApi = {
  getAll: () => apiCall<{ profiles: any[] }>('/api/profiles'),
  getById: (id: string) => apiCall<{ profile: any }>(`/api/profiles/${id}`),
  create: (data: any) =>
    apiCall<{ profile: any }>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: any) =>
    apiCall<{ profile: any }>('/api/profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<{ success: boolean }>(`/api/profiles?id=${id}`, {
      method: 'DELETE',
    }),
};

// Book API calls
export const bookApi = {
  getAll: () => apiCall<{ books: any[] }>('/api/books'),
  getById: (id: string) => apiCall<{ book: any }>(`/api/books/${id}`),
  getPages: (bookId: string) =>
    apiCall<{ pages: any[] }>(`/api/books/${bookId}/pages`),
  create: (data: any) =>
    apiCall<{ book: any }>('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: any) =>
    apiCall<{ book: any }>('/api/books', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<{ success: boolean }>(`/api/books?id=${id}`, {
      method: 'DELETE',
    }),
  generateStory: (bookId: string) =>
    apiCall<{ book: any }>(`/api/books/${bookId}/generate-story`, {
      method: 'POST',
    }),
};

// Book pages API
export const bookPageApi = {
  updateImage: (pageId: number, image_url: string) =>
    apiCall<{ success: boolean }>(`/api/book-pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify({ image_url }),
    }),

  uploadImage: async (pageId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`/api/book-pages/${pageId}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
};
