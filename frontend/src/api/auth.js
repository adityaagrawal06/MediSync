import api from './axios';

export const authAPI = {

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.username,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/patients/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch user profile' };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },


  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },


  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuthData: (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default authAPI;