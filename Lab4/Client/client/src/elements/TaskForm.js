import React, { useState } from 'react';
import "./TaskForm.css";

const TaskForm = ({ sendMessage }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();


    const requestParams = {
      Method: 'ADD', 
      UserName: localStorage.getItem('user'), 
      AccessToken: localStorage.getItem('accessToken'), 
      TaskId: 0, 
      TypeOfRequest: selectedFile ? 'FILE' : 'DATA', 
      FileName: selectedFile ? selectedFile.name : '', 
    };

    const requestPayload = {
      Param1: title,
      Param2: status,
      Param3: dueDate,
    };

    sendMessage(JSON.stringify(requestParams),JSON.stringify(requestPayload), selectedFile);
    
    setTitle('');
    setDueDate('');
    setStatus('pending');
    setSelectedFile(null);
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
    </form>
  );
};

export default TaskForm;
