import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

export const getTasks = () => axios.get(API_URL);
export const createTask = (data) => axios.post(API_URL, data);
export const deleteTask = (id) => axios.delete(`${API_URL}${id}/`);
// THIS IS THE MISSING PIECE:
export const updateTask = (id, data) => axios.put(`${API_URL}${id}/`, data);