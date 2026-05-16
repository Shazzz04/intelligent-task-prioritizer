import axios from 'axios';

// Change this to your local Django address
const API_URL = 'http://127.0.0.1:8000/api/tasks/';

export const getTasks = (studentName = 'default') =>
    axios.get(`${API_URL}?user=${studentName}`);

export const createTask = (data, studentName = 'default') =>
    axios.post(`${API_URL}?user=${studentName}`, data);

export const deleteTask = (id, studentName = 'default') =>
    axios.delete(`${API_URL}${id}/?user=${studentName}`);

export const updateTask = (id, data, studentName = 'default') =>
    axios.put(`${API_URL}${id}/?user=${studentName}`, data);