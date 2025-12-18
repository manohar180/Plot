import axios from 'axios';

// Automatically switches between Localhost and Production URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default API;