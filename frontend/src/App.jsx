import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./routes/PrivateRoute";
import Tasks from "./pages/Tasks";
import NewTask from "./pages/NewTask";
import TaskDetails from "./pages/TaskDetails";
import EditTask from "./pages/EditTask";
import AdminsPage from "./pages/AdminsPage";
import TaskPage from "./pages/TaskPage";
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4 text-center">Cargando aplicación...</div>;
  }

  return (

      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/" replace />} 
        />

        {/* Ruta raíz con redirección inteligente */}
        <Route 
          path="/" 
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/tasks" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Rutas protegidas */}
        <Route path="/tasks" element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        }/>

        <Route path="/tasks/new" element={
          <PrivateRoute>
            <NewTask />
          </PrivateRoute>
        }/>

        <Route path="/tasks/:id" element={
          <PrivateRoute>
            <TaskDetails />
          </PrivateRoute>
        }/>

        <Route path="/tasks/:id/edit" element={
          <PrivateRoute>
            <EditTask />
          </PrivateRoute>
        }/>

        <Route path="/admin/dashboard" element={
          <PrivateRoute requiredRole="admin">
            <AdminsPage />
          </PrivateRoute>
        }/>

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

  );
}

export default App;
