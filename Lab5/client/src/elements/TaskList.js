import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { gql, useMutation, useQuery,ApolloClient, InMemoryCache } from '@apollo/client';
import './TaskList.css';

const taskClient = new ApolloClient({
  uri: 'https://localhost:7292/tasks',
  cache: new InMemoryCache(),
});
const GET_TASKS = gql`
  query Tasks($username: String!, $status: String!) {
    tasks(username: $username, status: $status) {
      title
      status
      dueDate
      file
      id
    }
  }
`;
const DELETE_TASK = gql`
  mutation DeleteTask($username: String!, $taskId: Int!, $status: String!) {
    deleteTask(username: $username, taskId: $taskId, status: $status) {
      title
      status
      dueDate
      file
      id
    }
  }
`;

const TaskList = ({tasks,setTasks,globalStatus,setGlobalStatus, setUnauthorised }) => {
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [filteredTasks, setFilteredTasks] = useState([]);
  const username = localStorage.getItem('username'); 

 
  const [deleteTask, {error: deleteError }] = useMutation(DELETE_TASK, {
    client: taskClient
  });

  const { loading, error: getError, data, refetch } = useQuery(GET_TASKS, {
    variables: { username, status: globalStatus },
    skip: !username,
    client: taskClient,
    context: {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      }
    },
    onCompleted: (data) => {
      console.log(data.tasks);
      setTasks(data?.tasks || []);
    }
  });
  const newSetTask = (tasks) =>{
    setTasks(tasks);
    setGlobalStatus("All");
    setStatusFilter("All");
  }
  const handleFilter = async (filter) => {
    setStatusFilter(filter);
    setGlobalStatus(filter);

    try {
      const res = await refetch({
        username: username,
        status: filter
      });
      setTasks(res.data?.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (getError) {
    const errorMessage = getError.graphQLErrors[0]?.message || 'An error occurred';
    const errorCode = getError.graphQLErrors[0]?.extensions?.code || 'UNKNOWN_ERROR';
    return <p>Error: {errorMessage} (Code: {errorCode})</p>;
  }

  const handleDelete = async (id) => {
    const res = await deleteTask({
      variables: { username: username, taskId: id, status: globalStatus}, 
      skip: !username, 
      context: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      }
      
    });

    if (deleteError) {
      const errorMessage = deleteError.graphQLErrors[0]?.message || 'An error occurred';
      const errorCode = deleteError.graphQLErrors[0]?.extensions?.code || 'UNKNOWN_ERROR';
    }
    console.log(res.data);
    setTasks(res.data?.deleteTask || []);

  };
  return (
    <div className="task-list">
      <select value={globalStatus} onChange={(e) => handleFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            deleteTask={handleDelete}
            updateTask={setTasks}
            setUnauthorised={setUnauthorised}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
