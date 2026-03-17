import React, { Component } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from '../services/api';

class TaskDashboard extends Component {

    // ── CONSTRUCTOR ─────────────────────────────────────────────
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

    // ── LIFECYCLE METHOD ────────────────────────────────────────
    componentDidMount() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        this.fetchTasks();
        this.refreshInterval = setInterval(() => this.fetchTasks(), 60000);
    }

    // ── LIFECYCLE METHOD ────────────────────────────────────────
    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    // ── UTILITY METHOD ──────────────────────────────────────────
    // Returns urgency rank for sorting purposes.
    // 24hr override tasks rank highest (3) so they float to the top
    // regardless of their computed priority score.
    getUrgencyRank = (task) => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const hoursLeft = Math.max((deadline - now) / 3600 / 1000, 0);
        if (hoursLeft <= 24 && !task.is_done) return 3;
        if (task.priority_score >= 50) return 2;
        if (task.priority_score >= 25) return 1;
        return 0;
    }

    // ── DATA METHOD ─────────────────────────────────────────────
    // Fetches all tasks from the Django REST API.
    // Sorts by urgency rank first, then by priority score as tiebreaker.
    // This ensures 24hr override tasks always appear at the top.
    fetchTasks = () => {
        getTasks()
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

    // ── FORM METHOD ─────────────────────────────────────────────
    handleFieldChange = (field, value) => {
        const numericFields = ['credit_weight', 'difficulty_level', 'intensity', 'grade_impact'];
        const finalValue = numericFields.includes(field) ? parseInt(value) || 0 : value;
        this.setState(prev => ({
            formData: { ...prev.formData, [field]: finalValue }
        }));
    }

    // ── TASK METHOD ─────────────────────────────────────────────
    toggleMainTaskDone = async (task) => {
        const updatedStatus = !task.is_done;
        await updateTask(task.id, { ...task, is_done: updatedStatus });
        this.fetchTasks();
    }

    // ── TASK METHOD ─────────────────────────────────────────────
    handleDelete = (id) => {
        if (window.confirm("Are you sure?")) {
            deleteTask(id).then(() => this.fetchTasks());
        }
    }

    // ── EDIT METHODS ────────────────────────────────────────────
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
        const selectedDeadline = new Date(editForm.deadline);
        const now = new Date();
        if (selectedDeadline < now) {
            this.setState({ editError: 'Deadline cannot be in the past. Please check the date or enter the extended deadline.' });
            return;
        }
        try {
            await updateTask(editingTask.id, { ...editingTask, ...editForm });
            this.setState({ editingTask: null, editForm: {}, editError: '' });
            this.fetchTasks();
        } catch (err) {
            this.setState({ editError: 'Something went wrong. Please try again.' });
        }
    }

    // ── UTILITY METHOD ──────────────────────────────────────────
    // Returns urgency badge label and colour.
    // 24hr override applied first — grounded in Steel (2007).
    getUrgencyBadge = (score, hoursLeft) => {
        if (hoursLeft <= 24) return { label: 'URGENT ⚡', color: '#FF4B2B' };
        if (score >= 50) return { label: 'URGENT ⚡', color: '#FF4B2B' };
        if (score >= 25) return { label: 'MEDIUM ⚠️', color: '#FFB75E' };
        return { label: 'LOW ✅', color: '#00C9FF' };
    }

    // ── RENDER METHOD ───────────────────────────────────────────
    render() {
        const { tasks, completedCount, formData, editingTask, editForm, editError } = this.state;
        const dailyProgress = tasks.length > 0
            ? Math.round((completedCount / tasks.length) * 100)
            : 0;

        return (
            <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: 'auto', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <h1 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '30px' }}>🚀 Student Priority Hub</h1>

                {/* TOP SUMMARY SECTION */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 2, background: 'linear-gradient(135deg, #8E78FF, #B993FF)', color: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(142, 120, 255, 0.3)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>💡 Top Recommendation</h3>
                        <p style={{ fontSize: '1.4rem', marginTop: '15px' }}>Focus on: <strong>{tasks.find(t => !t.is_done)?.title || "All Caught Up!"}</strong></p>
                    </div>

                    <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#444' }}>Task Completion</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4CAF50', margin: '10px 0' }}>{dailyProgress}%</div>
                        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${dailyProgress}%`, height: '100%', background: '#4CAF50', transition: 'width 0.4s ease' }}></div>
                        </div>
                    </div>
                </div>

                {/* ADD TASK FORM */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Academic Task</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createTask(formData).then(() => {
                            this.fetchTasks();
                            this.setState({ formData: { ...this.initialForm } });
                        });
                    }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <input type="text" placeholder="Task Title" value={formData.title} onChange={(e) => this.handleFieldChange('title', e.target.value)} required style={{ flex: 2, padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '1rem' }} />
                            <input type="datetime-local" value={formData.deadline} onChange={(e) => this.handleFieldChange('deadline', e.target.value)} required style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Credits: {formData.credit_weight}</label><input type="range" min="1" max="30" value={formData.credit_weight} onChange={(e) => this.handleFieldChange('credit_weight', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                            <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Difficulty: {formData.difficulty_level}</label><input type="range" min="1" max="10" value={formData.difficulty_level} onChange={(e) => this.handleFieldChange('difficulty_level', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                            <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Intensity: {formData.intensity}</label><input type="range" min="1" max="10" value={formData.intensity} onChange={(e) => this.handleFieldChange('intensity', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                            <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Grade Impact: {formData.grade_impact}%</label><input type="range" min="1" max="100" value={formData.grade_impact} onChange={(e) => this.handleFieldChange('grade_impact', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                        </div>
                        <button type="submit" style={{ background: '#6e8efb', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Add Task to Priority Engine</button>
                    </form>
                </div>

                {/* TASK TABLE */}
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}>
                                <th style={{ padding: '20px' }}>Task Description</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>MCDM Priority Score</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>Deadline Status</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => {
                                const now = new Date();
                                const deadline = new Date(task.deadline);
                                const hoursLeft = Math.max(Math.round((deadline - now) / 3600 / 1000), 0);
                                const urgency = this.getUrgencyBadge(task.priority_score, hoursLeft);
                                const timeStatus = hoursLeft === 0 ? 'OVERDUE ⚠️' : `${hoursLeft}h left`;

                                return (
                                    <tr key={task.id} style={{ borderBottom: '1px solid #f0f0f0', opacity: task.is_done ? 0.5 : 1 }}>
                                        <td style={{ padding: '20px', fontWeight: '600' }}>
                                            <input type="checkbox" checked={task.is_done} onChange={() => this.toggleMainTaskDone(task)} style={{ marginRight: '12px' }} />
                                            <span style={{ textDecoration: task.is_done ? 'line-through' : 'none' }}>{task.title}</span>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <span style={{ background: task.is_done ? '#e0e0e0' : urgency.color, color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
                                                {task.priority_score?.toFixed(0)} - {urgency.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <div style={{ fontWeight: '600', color: hoursLeft <= 24 ? '#d32f2f' : '#666' }}>{timeStatus}</div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            <button onClick={() => this.handleEditClick(task)} style={{ background: 'none', border: 'none', color: '#6e8efb', cursor: 'pointer', fontWeight: 'bold', marginRight: '12px' }}>Edit</button>
                                            <button onClick={() => this.handleDelete(task.id)} style={{ background: 'none', border: 'none', color: '#ff4b2b', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* EDIT MODAL */}
                {editingTask && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '35px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ marginTop: 0, fontWeight: '800' }}>Edit Task</h3>

                            {editError && (
                                <p style={{ color: '#FF4B2B', fontSize: '0.85rem', marginBottom: '15px' }}>{editError}</p>
                            )}

                            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Title</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => this.handleEditFieldChange('title', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '15px', boxSizing: 'border-box' }}
                            />

                            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Deadline</label>
                            <p style={{ fontSize: '11px', color: '#999', marginTop: 0, marginBottom: '6px' }}>Update if lecturer extended deadline or wrong date was entered</p>
                            <input
                                type="datetime-local"
                                value={editForm.deadline}
                                onChange={(e) => this.handleEditFieldChange('deadline', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '15px', boxSizing: 'border-box' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Credits: {editForm.credit_weight}</label>
                                    <input type="range" min="1" max="30" value={editForm.credit_weight} onChange={(e) => this.handleEditFieldChange('credit_weight', parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Grade Impact: {editForm.grade_impact}%</label>
                                    <input type="range" min="1" max="100" value={editForm.grade_impact} onChange={(e) => this.handleEditFieldChange('grade_impact', parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Difficulty: {editForm.difficulty_level}</label>
                                    <input type="range" min="1" max="10" value={editForm.difficulty_level} onChange={(e) => this.handleEditFieldChange('difficulty_level', parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Intensity: {editForm.intensity}</label>
                                    <input type="range" min="1" max="10" value={editForm.intensity} onChange={(e) => this.handleEditFieldChange('intensity', parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={() => this.setState({ editingTask: null, editError: '' })}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={this.handleEditSave}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6e8efb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }
}

export default TaskDashboard;