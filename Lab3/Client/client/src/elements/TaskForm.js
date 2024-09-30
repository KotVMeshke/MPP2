import React, { useState } from 'react';
import './TaskForm.css'; // Importing the CSS file

const TaskForm = ({ addTask, setUnauthorised }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [selectedFile, setSelectedFile] = useState(null);

  const addNewTask = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('dueDate', dueDate);
    formData.append('status', status);
    if (selectedFile) formData.append('file', selectedFile);

    const res = await fetch('https://localhost:7121/tasks', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (res.ok) {
      const newTask = await res.json();
      addTask(newTask); 
      resetForm(); 
    } else if (res.status === 401) {
        setUnauthorised(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setStatus('pending');
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
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
