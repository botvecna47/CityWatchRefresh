import api from './api';

export const adminService = {
  // Get system stats
  getStats: async () => {
    return api.get('/admin/stats');
  },

  // Get recent activity
  getActivity: async () => {
    return api.get('/admin/activity');
  },

  // Get issue trends (for chart)
  getTrends: async () => {
    return api.get('/admin/trends');
  },

  // Get users
  getUsers: async () => {
    return api.get('/admin/users');
  }
};
