import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import TaskDetails from '../components/TaskDetails';

const TaskPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${taskId}`);
        setTask(response.data);
      } catch (error) {
        console.error("Error obteniendo tarea:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (!task) return <div className="text-center py-8">Tarea no encontrada</div>;

  return (
    <div className="container mx-auto p-4">
      <TaskDetails task={task} />
    </div>
  );
};

export default TaskPage;
