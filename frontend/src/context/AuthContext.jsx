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
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          
          const response = await api.get("/user");
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
          setToken(savedToken);

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
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;

      // Guardar en estado y localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);

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
