import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // 👈 Estado de carga inicial
  const navigate = useNavigate();

  // Verificar token al inicio
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem("token");
      
      if (savedToken) {
        try {
          // Verificar token con el backend
          await api.get("/api/auth/validate", {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          
          // Cargar usuario desde localStorage si el token es válido
          const savedUser = localStorage.getItem("user");
          setUser(savedUser ? JSON.parse(savedUser) : null);
          
        } catch (error) {
          // Token inválido: limpiar datos
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user: userData } = response.data;

      // Guardar en estado y localStorage
      setUser(userData);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirigir después de guardar todo
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/tasks");

    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      await api.post("/register", { email, password });
      
      navigate("/login", {
        state: { message: "¡Registro exitoso! Inicia sesión" },
        replace: true
      });

    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading,
        login, 
        logout, 
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
