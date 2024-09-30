import React, { useState, useEffect, useRef } from 'react';
import Auth from "./elements/Auth.js";
import TaskForm from "./elements/TaskForm.js"
import TaskList from './elements/TaskList.js';
import "./App.css";

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const socket = useRef(null);
  const reconnectTimeout = useRef(null);
  const [receivedChunks, setReceivedChunks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('accessToken') !== null;
  });

  const connectWebSocket = () => {
    socket.current = new WebSocket('wss://localhost:7147/ws');

    socket.current.onopen = () => {
      console.log('WebSocket connection established.');
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };

    socket.current.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        console.log();
        receivedChunks.push(event.data);
      } else {
        const newMessage = JSON.parse(event.data);
        if (!newMessage) return;

        if (newMessage.accessToken) {
          localStorage.setItem('accessToken', newMessage.accessToken);
          setIsAuthenticated(true);
        }
        else if (newMessage && newMessage === "401") {
          localStorage.removeItem('accessToken');
        } else if (newMessage.deliveredFile) {
          console.log('Передача файла завершена.');

          const blob = new Blob(receivedChunks);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = newMessage.deliveredFile;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          setReceivedChunks([]);
        }
        else {
          console.log('Текущие задачи до обновления:', tasks);
          setTasks(newMessage);
          console.log('Новые задачи после обновления:', newMessage);
        }
      }

      console.log('Задачи после обработки сообщения:', tasks);

    };

    socket.current.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      reconnect();
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const reconnect = () => {
    reconnectTimeout.current = setTimeout(() => {
      console.log('Reconnecting...');
      connectWebSocket();
    }, 5000);
  };
  useEffect(() => {
    if (isAuthenticated) {
      getTasks();
    }
  }, []);
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  const sendMessage = (requestParams, requestPayload, file) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open.");
      return;
    }

    let newMessage = requestParams;
    if (requestPayload) {
      newMessage += "/" + requestPayload;
    }
    if (file) {
      const reader = new FileReader();


      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1];
        const fileMessage = `${newMessage}/${base64File}`;
        socket.current.send(fileMessage);
      };

      reader.readAsDataURL(file);
    } else {
      socket.current.send(newMessage);
    }
  };

  const getTasks = () => {
    const requestParams = {
      Method: 'GET',
      UserName: localStorage.getItem('user'),
      AccessToken: localStorage.getItem('accessToken'),
      TaskId: 0,
      TypeOfRequest: 'DATA',
      FileName: null,
    };
    console.log(requestParams);
    // sendMessage(JSON.stringify(requestParams),null, null);
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
  }
  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <Auth setIsAuthenticated={setIsAuthenticated} sendMessage={sendMessage} />
      ) : (
        <>
          <header>
            <button onClick={handleLogout}>LogOut</button>
          </header>
          <h1>Task Manager</h1>
          <TaskForm sendMessage={sendMessage} />
          <TaskList setTasks={setTasks} tasks={tasks} sendMessage={sendMessage} />
        </>

      )}
    </div>
  );
};

export default App;

