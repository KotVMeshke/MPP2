import React, { useState, useEffect } from 'react';
import Auth from './elements/Auth';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import TaskList from './elements/TaskList';
import TaskForm from './elements/TaskForm';
import './App.css';

const taskClient = new ApolloClient({
  uri: 'https://localhost:7292/tasks',
  cache: new InMemoryCache(),
});


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [status, setStatus] = useState('All');
  const [tasks, setTasks] = useState([]);

  const handleLogout = () =>{
    localStorage.setItem('isAuthenticated', false);
    localStorage.removeItem('jwtToken');
  };

  const updateTasks = (tasks) =>{
    setTasks(tasks);
    console.log(tasks);
  } ;

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <Auth setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
      ) : (
        <>
          <header>
            <button onClick={handleLogout}>Logout</button>
          </header>
          <h1>Task Manager</h1>
          <TaskForm addTask={updateTasks} setStatusGlobal={setStatus} setUnauthorised={setIsAuthenticated} />
          <TaskList tasks={tasks} setGlobalStatus={setStatus} globalStatus={status} setTasks={updateTasks} setUnauthorised={setIsAuthenticated} />
        </>
      )}
    </div>
  );
};

const MainApp = () => (
  <ApolloProvider client={taskClient}>
    <App />
  </ApolloProvider>
);

export default MainApp;
