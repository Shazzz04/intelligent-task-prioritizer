import axios from 'axios';

const API_URL = 'https://intelligent-task-prioritizer-production.up.railway.app/api/tasks/';

export const getTasks = (studentName = 'default') =>
    axios.get(`${API_URL}?user=${studentName}`);

export const createTask = (data, studentName = 'default') =>
    axios.post(`${API_URL}?user=${studentName}`, data);

export const deleteTask = (id, studentName = 'default') =>
    axios.delete(`${API_URL}${id}/?user=${studentName}`);

export const updateTask = (id, data, studentName = 'default') =>
    axios.put(`${API_URL}${id}/?user=${studentName}`, data);
