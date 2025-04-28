import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor para AGREGAR el token a cada solicitud
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  console.log("Interceptor token:", token, "Headers antes:", config.headers);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log("Headers después:", config.headers);
  }
  return config;
});

// Interceptor para MANEJAR errores 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Evitar redirección infinita si ya estamos en login
      if (window.location.pathname !== "/login") {
        localStorage.clear();
        window.location.href = "/login"; // Recarga forzada
      }
    }
    return Promise.reject(error);
  }
);

export default api;
