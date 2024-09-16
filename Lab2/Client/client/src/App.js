import React, { useState, useEffect } from 'react';
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/task')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const addTask = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('dueDate', dueDate);
    formData.append('status', status);
    if (selectedFile) formData.append('file', selectedFile);

    const res = await fetch('http://localhost:5000/task', {
      method: 'POST',
      body: formData,
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    resetForm();
  };

  const updateTask = async (id) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('dueDate', dueDate);
    formData.append('status', status);
    if (selectedFile) formData.append('file', selectedFile);

    const res = await fetch(`http://localhost:5000/task/${id}`, {
      method: 'PUT',
      body: formData,
    });
    const updatedTask = await res.json();
    setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
    resetForm();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/task/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleAddTask = (event) => {
    event.preventDefault();
    addTask();
  };

  const handleUpdateTask = (event) => {
    event.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setStatus('pending');
    setSelectedFile(null);
    setEditingTask(null);
  };

  const startEditing = (task) => {
    setTitle(task.title);
    setDueDate(task.dueDate);
    setStatus(task.status);
    setSelectedFile(null);
    setEditingTask(task);
  };

  const filteredTasks = tasks.filter(task =>
    statusFilter === '' || task.status === statusFilter
  );

  return (
    <div>
      <h1>Task List</h1>
      <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
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
          placeholder="Select file"
        />
        <button type="submit">{editingTask ? 'Update Task' : 'Add Task'}</button>
        {editingTask && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <select onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <ul>
        {filteredTasks.map(task => (
          <li key={task.id}>
            <span>{task.title}</span>
            <span>{task.dueDate}</span>
            <span>{task.status}</span>
            {task.file && <a href={`http://localhost:5000/uploads/${task.file}`} target="_blank" rel="noopener noreferrer">View File</a>}
            <button onClick={() => startEditing(task)}>Edit</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
