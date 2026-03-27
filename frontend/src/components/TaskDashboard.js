import React, { Component } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from '../services/api';

class TaskDashboard extends Component {

    constructor(props) {
        super(props);
        this.initialForm = {
            title: '',
            deadline: '',
            credit_weight: 15,
            difficulty_level: 5,
            intensity: 5,
            grade_impact: 10,
            is_done: false
        };
        this.state = {
            tasks: [],
            completedCount: 0,
            formData: { ...this.initialForm },
            editingTask: null,
            editForm: {},
            editError: '',
        };
    }

    // ── UNIQUE STUDENT IDENTIFIER ───────────────────────────────
    getStudentId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('user') || 'default_student';
    }

    componentDidMount() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        this.fetchTasks();
        this.refreshInterval = setInterval(() => this.fetchTasks(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    fetchTasks = () => {
        const studentId = this.getStudentId();
        getTasks(studentId)
            .then(response => {
                const sortedTasks = response.data.sort((a, b) => {
                    const rankDiff = this.getUrgencyRank(b) - this.getUrgencyRank(a);
                    if (rankDiff !== 0) return rankDiff;
                    return b.priority_score - a.priority_score;
                });
                this.setState({
                    tasks: sortedTasks,
                    completedCount: sortedTasks.filter(t => t.is_done).length
                });
            })
            .catch(err => console.error("Fetch failed:", err));
    }

    getUrgencyRank = (task) => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const hoursLeft = Math.max((deadline - now) / 3600 / 1000, 0);
        if (hoursLeft <= 24 && !task.is_done) return 3;
        if (task.priority_score >= 50) return 2;
        if (task.priority_score >= 25) return 1;
        return 0;
    }

    getUrgencyBadge = (score, hoursLeft) => {
        if (hoursLeft <= 24) return { label: 'URGENT ⚡', color: '#FF4B2B' };
        if (score >= 50) return { label: 'URGENT ⚡', color: '#FF4B2B' };
        if (score >= 25) return { label: 'MEDIUM ⚠️', color: '#FFB75E' };
        return { label: 'LOW ✅', color: '#00C9FF' };
    }

    handleFieldChange = (field, value) => {
        const numericFields = ['credit_weight', 'difficulty_level', 'intensity', 'grade_impact'];
        const finalValue = numericFields.includes(field) ? parseInt(value) || 0 : value;
        this.setState(prev => ({
            formData: { ...prev.formData, [field]: finalValue }
        }));
    }

    toggleMainTaskDone = async (task) => {
        const studentId = this.getStudentId();
        try {
            await updateTask(task.id, { ...task, is_done: !task.is_done }, studentId);
            this.fetchTasks();
        } catch (err) { console.error(err); }
    }

    // ── FIX: studentId now passed to deleteTask ─────────────────
    handleDelete = (id) => {
        const studentId = this.getStudentId();
        if (window.confirm("Remove this task?")) {
            deleteTask(id, studentId).then(() => this.fetchTasks());
        }
    }

    handleEditClick = (task) => {
        this.setState({
            editingTask: task,
            editError: '',
            editForm: {
                title: task.title,
                deadline: task.deadline.slice(0, 16),
                credit_weight: task.credit_weight,
                difficulty_level: task.difficulty_level,
                intensity: task.intensity,
                grade_impact: task.grade_impact,
            }
        });
    }

    handleEditFieldChange = (field, value) => {
        const numericFields = ['credit_weight', 'difficulty_level', 'intensity', 'grade_impact'];
        const finalValue = numericFields.includes(field) ? parseInt(value) || 0 : value;
        this.setState(prev => ({
            editForm: { ...prev.editForm, [field]: finalValue }
        }));
    }

    handleEditSave = async () => {
        const { editForm, editingTask } = this.state;
        const studentId = this.getStudentId();
        if (new Date(editForm.deadline) < new Date()) {
            this.setState({ editError: 'Deadline cannot be in the past.' });
            return;
        }
        try {
            await updateTask(editingTask.id, { ...editingTask, ...editForm }, studentId);
            this.setState({ editingTask: null, editForm: {}, editError: '' });
            this.fetchTasks();
        } catch (err) { this.setState({ editError: 'Update failed.' }); }
    }

    render() {
        const { tasks, completedCount, formData, editingTask, editForm, editError } = this.state;
        const dailyProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        const studentId = this.getStudentId();

        return (
            <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: 'auto', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <div style={{ textAlign: 'right', marginBottom: '10px', color: '#888', fontSize: '0.85rem' }}>
                    User Session: <strong>{studentId}</strong>
                </div>

                <h1 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '30px' }}>🚀 Student Priority Hub</h1>

                {/* SUMMARY CARDS */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 2, background: 'linear-gradient(135deg, #8E78FF, #B993FF)', color: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(142, 120, 255, 0.2)' }}>
                        <h3 style={{ margin: 0 }}>💡 Top Recommendation</h3>
                        <p style={{ fontSize: '1.4rem', marginTop: '10px' }}>Focus on: <strong>{tasks.find(t => !t.is_done)?.title || "All Caught Up!"}</strong></p>
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Progress</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4CAF50', margin: '10px 0' }}>{dailyProgress}%</div>
                        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${dailyProgress}%`, height: '100%', background: '#4CAF50', transition: 'width 0.5s' }} />
                        </div>
                    </div>
                </div>

                {/* ADD TASK FORM */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                    <h3 style={{ marginTop: 0 }}>Add New Academic Task</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createTask(formData, studentId).then(() => {
                            this.fetchTasks();
                            this.setState({ formData: { ...this.initialForm } });
                        });
                    }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <input type="text" placeholder="Task Title" value={formData.title} onChange={(e) => this.handleFieldChange('title', e.target.value)} required style={{ flex: 2, padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} />
                            <input type="datetime-local" value={formData.deadline} onChange={(e) => this.handleFieldChange('deadline', e.target.value)} required style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
                            {['credit_weight', 'difficulty_level', 'intensity', 'grade_impact'].map(field => (
                                <div key={field}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                                        {field.replace('_', ' ').toUpperCase()}: {formData[field]}{field === 'grade_impact' ? '%' : ''}
                                    </label>
                                    <input type="range" min="1" max={field === 'grade_impact' ? 100 : (field === 'credit_weight' ? 30 : 10)} value={formData[field]} onChange={(e) => this.handleFieldChange(field, e.target.value)} style={{ width: '100%' }} />
                                </div>
                            ))}
                        </div>
                        <button type="submit" style={{ background: '#6e8efb', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>Add to Priority Engine</button>
                    </form>
                </div>

                {/* TASK TABLE */}
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', textAlign: 'left', fontSize: '0.85rem', color: '#888' }}>
                                <th style={{ padding: '20px' }}>Task</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>Priority Score</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>Deadline</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => {
                                const hoursLeft = Math.max(Math.round((new Date(task.deadline) - new Date()) / 3600000), 0);
                                const urgency = this.getUrgencyBadge(task.priority_score, hoursLeft);
                                return (
                                    <tr key={task.id} style={{ borderBottom: '1px solid #eee', opacity: task.is_done ? 0.6 : 1 }}>
                                        <td style={{ padding: '20px', fontWeight: '600' }}>
                                            <input type="checkbox" checked={task.is_done} onChange={() => this.toggleMainTaskDone(task)} style={{ marginRight: '15px' }} />
                                            <span style={{ textDecoration: task.is_done ? 'line-through' : 'none' }}>{task.title}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ background: urgency.color, color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {task.priority_score?.toFixed(1)} - {urgency.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', color: hoursLeft <= 24 ? '#ff4b2b' : '#666', fontWeight: 'bold' }}>
                                            {hoursLeft}h left
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '20px' }}>
                                            <button onClick={() => this.handleEditClick(task)} style={{ color: '#6e8efb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>Edit</button>
                                            <button onClick={() => this.handleDelete(task.id)} style={{ color: '#ff4b2b', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* EDIT MODAL */}
                {editingTask && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '500px', boxSizing: 'border-box' }}>
                            <h3 style={{ marginTop: 0 }}>Adjust Task Parameters</h3>
                            {editError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{editError}</p>}

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Title</label>
                                <input type="text" value={editForm.title} onChange={(e) => this.handleEditFieldChange('title', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Deadline</label>
                                <input type="datetime-local" value={editForm.deadline} onChange={(e) => this.handleEditFieldChange('deadline', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                {['credit_weight', 'grade_impact', 'difficulty_level', 'intensity'].map(field => (
                                    <div key={field}>
                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{field.replace('_', ' ').toUpperCase()}: {editForm[field]}</label>
                                        <input type="range" min="1" max={field === 'grade_impact' ? 100 : (field === 'credit_weight' ? 30 : 10)} value={editForm[field]} onChange={(e) => this.handleEditFieldChange(field, e.target.value)} style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => this.setState({ editingTask: null })} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={this.handleEditSave} style={{ padding: '10px 20px', borderRadius: '8px', background: '#6e8efb', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default TaskDashboard;