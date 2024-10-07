import React, { useState } from 'react';
import { useMutation, gql,InMemoryCache, useQuery, useApolloClient, ApolloClient } from '@apollo/client';
import './TaskItem.css';
import toBase64 from '../utils/base64';

const fileClient = new ApolloClient({
  uri: 'https://localhost:7292/files',
  cache: new InMemoryCache()
});


const UPDATE_TASK = gql`
  mutation UpdateTask($task: TaskRequestDTOInput!, $username: String!, $status: String!) {
    updateTask(task: $task, username: $username, status: $status) {
      id
      title
      status
      dueDate
      file
    }
  }
`;

const GET_FILE = gql`
  mutation File($file: String!) {
    file(file: $file) {
      fileName
      fileBase64
    }
  }
`;
const TaskItem = ({ task, updateTask, deleteTask, setUnauthorised }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedTask) => {
    updateTask(updatedTask);
    setIsEditing(false);
  };

  const [getFile, {error: getError }] = useMutation(GET_FILE, {
    client: fileClient
  });
  const handleDownload = async () => {

   
    const { data } = await getFile({
      variables: { file: task.file },
      context: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      },
    });
    const { fileName, fileBase64 } = data.file;
    const blob = new Blob([new Uint8Array(atob(fileBase64).split("").map(c => c.charCodeAt(0)))], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName; 
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
    alert(task.file)
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
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
            >View File
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
  const [updateTaskMutation, { error }] = useMutation(UPDATE_TASK, {
    client: useApolloClient()
  });
  const updateTask = async (event, id) => {
    event.preventDefault(); 
    const task = {
      id: id,
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

    console.log(task);
    try {
      const { data } = await updateTaskMutation({
        variables: { task, taskId: id, username: localStorage.getItem('username'), status: "All" },
        context: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        },
      });
      onUpdate(data.updateTask); 
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };


  return (
    <form onSubmit={(event) => updateTask(event, task.id)}> 
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
}
export default TaskItem;
