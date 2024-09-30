import React, { useState } from 'react';
import './TaskItem.css';

const TaskItem = ({ task, deleteTask, sendMessage }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleFileClick = (fileName) => {

    const requestParams = {
      Method: 'GET',
      UserName: localStorage.getItem('user'),
      AccessToken: localStorage.getItem('accessToken'),
      TaskId: 0,
      TypeOfRequest: 'FILE',
      FileName: null,
    };

    const requestPayload = {
      param1: fileName,
      param2: null,
      param3: null
    }
    sendMessage(JSON.stringify(requestParams), JSON.stringify(requestPayload), null);
    console.log(`Запрос на файл ${fileName} отправлен через WebSocket.`);

  };
  return (
    <li className="task-item">
      {isEditing ? (
        <TaskEditForm
          task={task}
          onCancel={() => setIsEditing(false)}
          onUpdate={() => setIsEditing(false)}
          sendMessage={sendMessage}
        />
      ) : (
        <div className='task-info'>
          <span>{task.Title}</span>
          <span>{task.DueDate}</span>
          <span>{task.Status}</span>
          {task.File && (
            <a
              onClick={() => handleFileClick(task.File)}
            >
              View File
            </a>
          )}
          <button onClick={() => deleteTask(task.Id)}>Delete</button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </li>
  );
};

const TaskEditForm = ({ task, onUpdate, onCancel, sendMessage }) => {
  const [title, setTitle] = useState(task.Title);
  const [dueDate, setDueDate] = useState(task.DueDate);
  const [status, setStatus] = useState(task.Status);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requestParams = {
      Method: 'UPDATE',
      UserName: localStorage.getItem('user'),
      AccessToken: localStorage.getItem('accessToken'),
      TaskId: task.Id,
      TypeOfRequest: selectedFile ? 'FILE' : 'DATA',
      FileName: selectedFile ? selectedFile.name : '',
    };

    const requestPayload = {
      Param1: title,
      Param2: status,
      Param3: dueDate,
    };

    sendMessage(JSON.stringify(requestParams), JSON.stringify(requestPayload), selectedFile);

    setTitle('');
    setDueDate('');
    setStatus('pending');
    setSelectedFile(null);
    onUpdate();
  };

  return (
    <form className='task-edit-form' onSubmit={handleSubmit}>
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
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
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
