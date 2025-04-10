import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Table, Button, Alert, Spinner } from "react-bootstrap";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/tasks"),
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setError("");
    } catch (err) {
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignTask = async (taskId, userId) => {
    try {
      await api.put(`/tasks/${taskId}`, { user_id: userId });
      await fetchData(); // Recarga datos actualizados
    } catch (err) {
      setError("Error al asignar tarea: " + (err.response?.data?.error || ""));
    }
  };

  return (
    <div className="p-4">
      <h2>Panel de Administración</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Cargando...</span>
        </div>
      ) : (
        <>
          <h3 className="mt-4">Usuarios</h3>
          <div className="table-responsive">
            <Table striped bordered hover>

            </Table>
          </div>

          <h3 className="mt-4">Todas las Tareas</h3>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Usuario Asignado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>{users.find(u => u.id === task.user_id)?.email || "Sin asignar"}</td>
                    <td>
                      <select 
                        onChange={(e) => assignTask(task.id, e.target.value)}
                        value={task.user_id || ""}
                        className="form-select"
                      >
                        <option value="">Seleccionar usuario</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
