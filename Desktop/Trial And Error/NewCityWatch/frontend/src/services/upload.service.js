import api from './api';

export const uploadService = {
  // Upload single file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete uploaded file
  deleteFile: async (id) => {
    return api.delete(`/upload/${id}`);
  },
};
