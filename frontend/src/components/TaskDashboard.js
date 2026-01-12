import React, { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from '../services/api';

const TaskDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [focusTask, setFocusTask] = useState(null);
    const [newSubtask, setNewSubtask] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const initialForm = {
        title: '',
        deadline: '',
        credit_weight: 15,
        difficulty_level: 5,
        intensity: 4,
        grade_impact: 10, // NEW: Aligned with MCDM Proposal
        subtasks: [],
        is_done: false
    };
    const [formData, setFormData] = useState(initialForm);

    // MOTIVATIONAL QUOTES
    const quotes = [
        "Success is the sum of small efforts, repeated day in and day out.",
        "The secret of getting ahead is getting started.",
        "Focus on being productive instead of busy.",
        "Your future self will thank you for the work you do today.",
        "Don't stop until you're proud."
    ];
    const [activeQuote, setActiveQuote] = useState("");

    const fetchTasks = useCallback(() => {
        getTasks().then(response => {
            const normalizedTasks = response.data.map(t => ({
                ...t,
                subtasks: Array.isArray(t.subtasks) ? t.subtasks : []
            }));
            const sortedTasks = normalizedTasks.sort((a, b) => b.priority_score - a.priority_score);
            setTasks(sortedTasks);
            setCompletedCount(normalizedTasks.filter(t => t.is_done).length);
        }).catch(err => console.error("Fetch failed:", err));
    }, []);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        fetchTasks();
    }, [fetchTasks]);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleMainTaskDone = async (task) => {
        const updatedStatus = !task.is_done;
        await updateTask(task.id, { ...task, is_done: updatedStatus });
        fetchTasks();
    };

    const toggleSubtask = (id) => {
        const updatedSubtasks = formData.subtasks.map(st =>
            st.id === id ? { ...st, completed: !st.completed } : st
        );
        setFormData(prev => ({ ...prev, subtasks: updatedSubtasks }));
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const newItem = { id: Date.now(), text: newSubtask, completed: false };
        setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, newItem] }));
        setNewSubtask("");
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure?")) {
            deleteTask(id).then(() => fetchTasks());
        }
    };

    const openEditMode = (task) => {
        setFocusTask(task);
        setFormData({
            ...task,
            subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
        });
        setActiveQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getUrgencyBadge = (score) => {
        if (score > 50) return { label: 'URGENT', color: '#FF4B2B' };
        if (score > 25) return { label: 'MEDIUM', color: '#FFB75E' };
        return { label: 'LOW', color: '#00C9FF' };
    };

    const dailyProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    if (focusTask) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: '800px', margin: 'auto', fontFamily: "'Inter', sans-serif" }}>
                <button onClick={() => setFocusTask(null)} style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>← Back</button>
                <div style={{ background: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>

                    <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>{formData.title}</h2>

                    <div style={{ background: '#f0f4ff', padding: '15px 25px', borderRadius: '15px', borderLeft: '5px solid #6e8efb', margin: '20px 0', textAlign: 'center' }}>
                        <p style={{ fontStyle: 'italic', color: '#555', margin: 0, fontSize: '1rem' }}>"{activeQuote}"</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                        <div><label style={{ fontSize: '9px', fontWeight: '800' }}>CREDITS</label><input type="number" value={formData.credit_weight} onChange={(e) => handleFieldChange('credit_weight', e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                        <div><label style={{ fontSize: '9px', fontWeight: '800' }}>DIFF</label><input type="number" value={formData.difficulty_level} onChange={(e) => handleFieldChange('difficulty_level', e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                        <div><label style={{ fontSize: '9px', fontWeight: '800' }}>INT</label><input type="number" value={formData.intensity} onChange={(e) => handleFieldChange('intensity', e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                        <div><label style={{ fontSize: '9px', fontWeight: '800' }}>GRADE %</label><input type="number" value={formData.grade_impact} onChange={(e) => handleFieldChange('grade_impact', e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                    </div>

                    <h3 style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>📋 Steps to Success</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input type="text" placeholder="Add a mini-step..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                        <button onClick={addSubtask} style={{ padding: '12px 20px', borderRadius: '10px', background: '#6e8efb', color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        {formData.subtasks.map((st) => (
                            <div key={st.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '10px', marginBottom: '8px', transition: '0.3s' }}>
                                <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id)} style={{ cursor: 'pointer' }} />
                                <span style={{ marginLeft: '10px', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? '#aaa' : '#333' }}>{st.text}</span>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => { setIsSaving(true); updateTask(focusTask.id, formData).then(() => { fetchTasks(); setFocusTask(null); setIsSaving(false); }); }} style={{ width: '100%', padding: '20px', borderRadius: '15px', background: '#28a745', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.2)' }}>
                        {isSaving ? "Saving..." : "SAVE ALL CHANGES"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: 'auto', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '30px' }}>🚀 Student Priority Hub</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 2, background: 'linear-gradient(135deg, #8E78FF, #B993FF)', color: 'white', padding: '30px', borderRadius: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>💡 Top Recommendation</h3>
                    <p style={{ fontSize: '1.4rem', marginTop: '15px' }}>Focus on: <strong>{tasks.find(t => !t.is_done)?.title || "All Caught Up!"}</strong></p>
                </div>

                <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#444' }}>Daily Progress</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4CAF50', margin: '10px 0' }}>{dailyProgress}%</div>
                    <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${dailyProgress}%`, height: '100%', background: '#4CAF50', transition: 'width 0.4s ease' }}></div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                <form onSubmit={(e) => { e.preventDefault(); createTask(formData).then(() => { fetchTasks(); setFormData(initialForm); }); }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <input type="text" placeholder="Task Title" value={formData.title} onChange={(e) => handleFieldChange('title', e.target.value)} required style={{ flex: 2, padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '1rem' }} />
                        <input type="datetime-local" value={formData.deadline} onChange={(e) => handleFieldChange('deadline', e.target.value)} required style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0' }} />
                    </div>
                    {/* UPDATED GRID FOR 4 SLIDERS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Credits: {formData.credit_weight}</label><input type="range" min="1" max="30" value={formData.credit_weight} onChange={(e) => handleFieldChange('credit_weight', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                        <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Difficulty: {formData.difficulty_level}</label><input type="range" min="1" max="10" value={formData.difficulty_level} onChange={(e) => handleFieldChange('difficulty_level', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                        <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Intensity: {formData.intensity}</label><input type="range" min="1" max="10" value={formData.intensity} onChange={(e) => handleFieldChange('intensity', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                        <div><label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Grade Impact: {formData.grade_impact}%</label><input type="range" min="1" max="100" value={formData.grade_impact} onChange={(e) => handleFieldChange('grade_impact', parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                    </div>
                    <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Add Task</button>
                </form>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}>
                            <th style={{ padding: '20px' }}>Task</th>
                            <th style={{ padding: '20px', textAlign: 'center' }}>Urgency</th>
                            <th style={{ padding: '20px', textAlign: 'center' }}>Deadline</th>
                            <th style={{ padding: '20px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => {
                            const urgency = getUrgencyBadge(task.priority_score);
                            return (
                                <tr key={task.id} style={{ borderBottom: '1px solid #f0f0f0', opacity: task.is_done ? 0.6 : 1 }}>
                                    <td style={{ padding: '20px', fontWeight: '600' }}>
                                        <input type="checkbox" checked={task.is_done} onChange={() => toggleMainTaskDone(task)} style={{ width: '18px', height: '18px', cursor: 'pointer', marginRight: '12px', verticalAlign: 'middle' }} />
                                        <span style={{ textDecoration: task.is_done ? 'line-through' : 'none' }}>{task.title}</span>
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'center' }}>
                                        <span style={{ background: task.is_done ? '#eee' : urgency.color, color: task.is_done ? '#888' : 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
                                            {task.is_done ? 'DONE' : urgency.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openEditMode(task)} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                                            <button onClick={() => handleDelete(task.id)} style={{ background: '#ffebee', color: '#ff4d4d', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskDashboard;