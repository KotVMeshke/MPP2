import React, { useState } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ tasks, setTasks, setUnauthorised }) => {
  const [statusFilter, setStatusFilter] = useState('');

  const deleteTask = async (id) => {
    const res = await fetch(`https://localhost:7121/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== id));
    }else if (res.status === 401) {
      setUnauthorised(false);
    }
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const filteredTasks = tasks.filter(
    (task) => statusFilter === '' || task.status === statusFilter
  );

  return (
    <div className="task-list">
      <select onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <ul>
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            deleteTask={deleteTask}
            updateTask={updateTask}
            setUnauthorised={setUnauthorised}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
