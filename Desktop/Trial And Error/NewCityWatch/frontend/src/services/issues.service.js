import api from './api';

export const issuesService = {
  // Get all issues with filters
  getIssues: async (params = {}) => {
    return api.get('/issues', { params });
  },

  // Get single issue by ID
  getIssue: async (id) => {
    return api.get(`/issues/${id}`);
  },

  // Create new issue
  createIssue: async (data) => {
    return api.post('/issues', data);
  },

  // Update own issue
  updateIssue: async (id, data) => {
    return api.patch(`/issues/${id}`, data);
  },

  // Delete own issue
  deleteIssue: async (id) => {
    return api.delete(`/issues/${id}`);
  },

  // Upvote issue
  upvoteIssue: async (id) => {
    return api.post(`/issues/${id}/upvote`);
  },

  // Remove upvote
  removeUpvote: async (id) => {
    return api.delete(`/issues/${id}/upvote`);
  },

  // Get issue timeline
  getTimeline: async (id) => {
    return api.get(`/issues/${id}/timeline`);
  },

  // Get my issues
  getMyIssues: async () => {
    return api.get('/issues/my');
  },

  // Get categories
  getCategories: async () => {
    return api.get('/categories');
  },

  // Get cities
  getCities: async () => {
    return api.get('/cities');
  },

  // Get wards by city
  getWards: async (cityId) => {
    return api.get(`/cities/${cityId}/wards`);
  },

  // Get departments by city
  getDepartments: async (cityId) => {
    return api.get(`/cities/${cityId}/departments`);
  },
};
