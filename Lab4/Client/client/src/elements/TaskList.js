import React, { useState } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ tasks, setTasks, sendMessage}) => {
  const [statusFilter, setStatusFilter] = useState('All');

  const deleteTask = async (id) => {
    const requestParams = {
      Method: 'DEL', 
      UserName: localStorage.getItem('user'), 
      AccessToken: localStorage.getItem('accessToken'), 
      TaskId: id, 
      TypeOfRequest: 'DATA', 
      FileName: null, 
    };

    const params = {
      Param1: statusFilter,
      Param2: null,
      Param3: null,
      Param4: null
    }

    sendMessage(JSON.stringify(requestParams), JSON.stringify(params), null);
  };

const handleFilter = (filter) =>
{
  const requestParams = {
    Method: 'GET', 
    UserName: localStorage.getItem('user'), 
    AccessToken: localStorage.getItem('accessToken'), 
    TaskId: 0, 
    TypeOfRequest: 'DATA', 
    FileName: null, 
  };

  const requestPayload = {
    param1: filter,
    param2: null,
    param3: null,
    Param4: null
  }
  setStatusFilter(filter);
  sendMessage(JSON.stringify(requestParams), JSON.stringify(requestPayload), null);
}

  return (
    <div className="task-list">
      <select onChange={(e) => handleFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.Id}
            task={task}
            deleteTask={deleteTask}
            sendMessage={sendMessage}
            currentStatus={statusFilter}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
