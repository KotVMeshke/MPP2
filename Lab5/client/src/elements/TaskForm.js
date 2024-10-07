import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import toBase64 from '../utils/base64';
import "./TaskForm.css";

const ADD_TASK = gql`
  mutation AddTask($task: TaskRequestDTOInput!, $username: String!, $status: String!) {
    addTask(task: $task, username: $username, status: $status) {
      id
      title
      status
      dueDate
      file
    }
  }
`;

const TaskForm = ({ addTask, setStatusGlobal,setUnauthorised }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [selectedFile, setSelectedFile] = useState(null);

  const [addTaskMutation, { error }] = useMutation(ADD_TASK);

  const addNewTask = async () => {
    const task = {
      id: 0, 
      title: title || null, 
      status: status || null,
      dueDate: dueDate || null,
    };

    if (selectedFile)
    {
      const fileBase64 = await toBase64(selectedFile);
      task.file = {
        fileName: selectedFile.name,
        fileBase64: fileBase64
      }
      console.log(task);
      setSelectedFile(null);
    }

    try {
      const { data } = await addTaskMutation({
        variables: { task, username: localStorage.getItem('username'), status: "All" },
        context: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        },
      });
      addTask(data.addTask);
      setStatusGlobal("All");
      resetForm();
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.networkError && error.networkError.status === 401) {
        setUnauthorised(false);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setStatus('Pending');
    setSelectedFile(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addNewTask();
  };

 
  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button type="submit">Add Task</button>
      {error && <p>Error: {error.message}</p>} 
    </form>
  );
};

export default TaskForm;
