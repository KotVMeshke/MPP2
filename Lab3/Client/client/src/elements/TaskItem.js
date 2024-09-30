import React, { useState } from 'react';
import './TaskItem.css';

const TaskItem = ({ task, updateTask, deleteTask, setUnauthorised }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedTask) => {
    updateTask(updatedTask);
    setIsEditing(false);
  };

  return (
    <li className="task-item">
      {isEditing ? (
        <TaskEditForm 
          task={task} 
          onUpdate={handleUpdate} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <div>
          <span>{task.title}</span>
          <span>{new Date(task.dueDate).toISOString().split('T')[0]}</span>
          <span>{task.status}</span>
          {task.file && (
            <a
              href={`https://localhost:7121/files/${task.file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View File
            </a>
          )}
          <button onClick={() => deleteTask(task.id)}>Delete</button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </li>
  );
};

const TaskEditForm = ({ task, onUpdate, onCancel, setUnauthorised }) => {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [status, setStatus] = useState(task.status);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('dueDate', dueDate);
    formData.append('status', status);
    if (selectedFile) formData.append('file', selectedFile);

    const res = await fetch(`https://localhost:7121/tasks/${task.id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });

    if (res.ok) {
      const newData = await res.json();
      onUpdate(newData);
    }else if (res.status === 401) {
        setUnauthorised(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
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
      <select value={status} onChange={(e) => setStatus(e.target.value)} required>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button type="submit">Update Task</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default TaskItem;
