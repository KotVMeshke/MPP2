import React, { useState, useEffect } from 'react';
import Auth from './elements/Auth';
import TaskList from './elements/TaskList';
import TaskForm from './elements/TaskForm';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const fetchTasks = async () => {
    const res = await fetch('https://localhost:7121/tasks', {
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else if (res.status === 401) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const addTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <Auth setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <>
          <header>
            <button onClick={handleLogout}>Logout</button>
          </header>
          <h1>Task Manager</h1>
          <TaskForm addTask={addTask} setUnauthorised={setIsAuthenticated} />
          <TaskList tasks={tasks} setTasks={setTasks} setUnauthorised={setIsAuthenticated} />
        </>
      )}
    </div>
  );
};

export default App;
