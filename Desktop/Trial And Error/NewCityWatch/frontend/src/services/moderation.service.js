import api from './api';

export const moderationService = {
  // Get moderation queue
  getQueue: async (params = {}) => {
    return api.get('/moderation/queue', { params });
  },

  // Get queue statistics
  getStats: async () => {
    return api.get('/moderation/queue/stats');
  },

  // Verify issue
  verifyIssue: async (id, data) => {
    return api.post(`/moderation/${id}/verify`, data);
  },

  // Reject issue
  rejectIssue: async (id, data) => {
    return api.post(`/moderation/${id}/reject`, data);
  },

  // Escalate issue
  escalateIssue: async (id, data) => {
    return api.post(`/moderation/${id}/escalate`, data);
  },

  // Assign department
  assignDepartment: async (id, departmentId) => {
    return api.post(`/moderation/${id}/assign-department`, { departmentId });
  },
};
