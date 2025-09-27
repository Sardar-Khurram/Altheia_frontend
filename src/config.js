// API configuration based on environment
const config = {
  // Use environment variable or fallback to localhost for development
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
};

export default config;