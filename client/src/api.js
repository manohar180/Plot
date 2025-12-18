import axios from 'axios';

// We are now forcing the app to ALWAYS talk to the live Render server.
const API = axios.create({
  baseURL: 'https://plot-ux2o.onrender.com/api', 
});

export default API;