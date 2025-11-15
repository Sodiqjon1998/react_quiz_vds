import { useState, useEffect } from 'react';

function KunlikVazifalar() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statistics, setStatistics] = useState(null);
    const [savingTaskId, setSavingTaskId] = useState(null);
    
    // Yangi vazifa qo'shish uchun
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTask, setNewTask] = useState({
        name: '',
        emoji: '📝',
        description: ''
    });
    const [addingTask, setAddingTask] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Emoji ro'yxati
    const emojiList = [
        '🌅', '🏃', '🍳', '🧹', '🤲', '💪', '📚', '🏠', '📝', '👟',
        '⚽', '🎨', '🎵', '🎮', '📱', '💻', '🎯', '🏆', '🌟', '✨',
        '🍎', '🥗', '🥤', '☕', '🍕', '🍔', '🍰', '🎂', '🧃', '🥛',
        '👕', '👔', '👗', '👠', '🧦', '🎒', '👓', '⌚', '💼', '👜',
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '❤️', '💚', '💙', '💜', '🧡', '💛', '🖤', '🤍', '🤎', '💖'
    ];

    useEffect(() => {
        fetchTasks();
    }, [selectedDate]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(
                `http://localhost:8000/api/tasks?date=${selectedDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setTasks(data.data.tasks);
                setStatistics(data.data.statistics);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskStatus = async (taskId, currentStatus) => {
        try {
            setSavingTaskId(taskId);
            const token = localStorage.getItem('token');
            
            const response = await fetch(
                `http://localhost:8000/api/tasks/${taskId}/toggle`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: selectedDate
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId
                            ? { ...task, is_completed: !currentStatus }
                            : task
                    )
                );
                fetchTasks();
            }
        } catch (err) {
            console.error('Toggle error:', err);
            alert('Xatolik yuz berdi!');
        } finally {
            setSavingTaskId(null);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        
        if (!newTask.name.trim()) {
            alert('Vazifa nomini kiriting!');
            return;
        }

        try {
            setAddingTask(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:8000/api/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Vazifa muvaffaqiyatli qo\'shildi!');
                setShowAddModal(false);
                setNewTask({ name: '', emoji: '📝', description: '' });
                fetchTasks();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Add task error:', err);
            alert('❌ Xatolik: ' + err.message);
        } finally {
            setAddingTask(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Haqiqatan ham bu vazifani o\'chirmoqchimisiz?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Vazifa o\'chirildi!');
                fetchTasks();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Xatolik: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return date.toLocaleDateString('uz-UZ', options);
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const isPast = new Date(selectedDate) < new Date(new Date().toISOString().split('T')[0]);

    // Search filter
    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Yuklanmoqda...</span>
                    </div>
                    <h5 className="text-muted">Ma'lumotlar yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="card border-0 shadow-lg mb-4" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px'
            }}>
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="text-white mb-2">
                                <i className="ri-task-line me-2"></i>
                                Kunlik Vazifalar
                            </h2>
                            <p className="text-white-50 mb-0">
                                {formatDate(selectedDate)}
                            </p>
                        </div>
                        <div className="col-md-4 text-end">
                            <button
                                className="btn btn-light btn-lg shadow-sm"
                                onClick={() => setShowAddModal(true)}
                                style={{ borderRadius: '15px', fontWeight: '600' }}
                            >
                                <i className="ri-add-circle-line me-2"></i>
                                Yangi vazifa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Name Input */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text border-0 bg-light" style={{ borderRadius: '10px 0 0 10px' }}>
                            <i className="ri-user-3-line text-primary"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-0 bg-light"
                            placeholder="Ismingizni kiriting..."
                            style={{ borderRadius: '0 10px 10px 0' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <small className="text-muted ms-2">
                        <i className="ri-information-line me-1"></i>
                        Bugungi vazifalar bajarishini belgilang
                    </small>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="row g-3 mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-outline-primary"
                                    style={{ borderRadius: '10px' }}
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setDate(newDate.getDate() - 1);
                                        setSelectedDate(newDate.toISOString().split('T')[0]);
                                    }}
                                >
                                    <i className="ri-arrow-left-s-line"></i>
                                </button>
                                
                                <input
                                    type="date"
                                    className="form-control form-control-lg text-center"
                                    style={{ borderRadius: '10px' }}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                
                                <button
                                    className="btn btn-outline-primary"
                                    style={{ borderRadius: '10px' }}
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setDate(newDate.getDate() + 1);
                                        if (newDate <= new Date()) {
                                            setSelectedDate(newDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                    disabled={isToday}
                                >
                                    <i className="ri-arrow-right-s-line"></i>
                                </button>

                                <button
                                    className="btn btn-primary"
                                    style={{ borderRadius: '10px' }}
                                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                    disabled={isToday}
                                >
                                    <i className="ri-calendar-check-line me-1"></i>
                                    Bugun
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div className="card-body p-4 text-center text-white">
                                <div className="display-4 mb-2">
                                    <i className="ri-checkbox-circle-fill"></i>
                                </div>
                                <h3 className="mb-1">{statistics.completed}</h3>
                                <p className="mb-0 opacity-75">Bajarilgan</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <div className="card-body p-4 text-center text-white">
                                <div className="display-4 mb-2">
                                    <i className="ri-time-line"></i>
                                </div>
                                <h3 className="mb-1">{statistics.pending}</h3>
                                <p className="mb-0 opacity-75">Kutilmoqda</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <div className="card-body p-4 text-center text-white">
                                <div className="display-4 mb-2">
                                    <i className="ri-percent-line"></i>
                                </div>
                                <h3 className="mb-1">{statistics.completion_rate}%</h3>
                                <p className="mb-0 opacity-75">Bajarilish foizi</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tasks Grid */}
            {filteredTasks.length === 0 ? (
                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <div className="card-body text-center py-5">
                        <i className="ri-inbox-line text-muted" style={{ fontSize: '80px', opacity: 0.3 }}></i>
                        <h5 className="text-muted mt-3">
                            {searchQuery ? 'Vazifa topilmadi' : 'Hozircha vazifalar yo\'q'}
                        </h5>
                        {!searchQuery && (
                            <button
                                className="btn btn-primary mt-3"
                                style={{ borderRadius: '10px' }}
                                onClick={() => setShowAddModal(true)}
                            >
                                <i className="ri-add-line me-2"></i>
                                Birinchi vazifani qo'shish
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {filteredTasks.map((task, index) => (
                        <div key={task.id} className="col-md-6 col-lg-4">
                            <div 
                                className={`card border-0 shadow-sm h-100 position-relative ${
                                    task.is_completed ? 'bg-light' : ''
                                }`}
                                style={{ 
                                    borderRadius: '15px',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    border: task.is_completed ? '2px solid #28a745' : '2px solid transparent'
                                }}
                            >
                                {/* Badge Number */}
                                <div 
                                    className={`position-absolute badge ${
                                        task.is_completed ? 'bg-success' : 'bg-primary'
                                    } rounded-circle`}
                                    style={{ 
                                        top: '-10px', 
                                        left: '-10px',
                                        width: '45px',
                                        height: '45px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    {index + 1}
                                </div>

                                {/* Delete Button */}
                                <button
                                    className="btn btn-sm btn-danger position-absolute"
                                    style={{ 
                                        top: '10px', 
                                        right: '10px',
                                        borderRadius: '8px',
                                        padding: '5px 10px'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                    }}
                                    title="O'chirish"
                                >
                                    <i className="ri-delete-bin-line"></i>
                                </button>

                                <div className="card-body p-4 text-center">
                                    {/* Emoji */}
                                    <div 
                                        className="mb-3"
                                        style={{ fontSize: '60px' }}
                                    >
                                        {task.emoji}
                                    </div>

                                    {/* Task Name */}
                                    <h5 
                                        className={`mb-2 ${
                                            task.is_completed ? 'text-decoration-line-through text-muted' : ''
                                        }`}
                                        style={{ fontWeight: '600' }}
                                    >
                                        {task.name}
                                    </h5>

                                    {/* Description */}
                                    {task.description && (
                                        <p className="text-muted small mb-3">{task.description}</p>
                                    )}

                                    {/* Action Buttons - Radio style */}
                                    <div className="d-flex gap-3 justify-content-center mt-4">
                                        {/* Bajarildi - Green Check */}
                                        <label 
                                            className={`btn btn-success btn-lg rounded-circle ${
                                                task.is_completed ? '' : 'btn-outline-success'
                                            }`}
                                            style={{ 
                                                width: '70px', 
                                                height: '70px',
                                                cursor: isPast ? 'not-allowed' : 'pointer',
                                                boxShadow: task.is_completed ? '0 6px 20px rgba(40, 167, 69, 0.4)' : 'none',
                                                border: task.is_completed ? '3px solid #28a745' : '3px solid #28a745',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                opacity: isPast ? 0.6 : 1
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`task-${task.id}`}
                                                checked={task.is_completed}
                                                onChange={() => !task.is_completed && toggleTaskStatus(task.id, task.is_completed)}
                                                disabled={savingTaskId === task.id || isPast}
                                                style={{ display: 'none' }}
                                            />
                                            {savingTaskId === task.id && task.is_completed ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="ri-check-line" style={{ fontSize: '32px' }}></i>
                                            )}
                                        </label>

                                        {/* Bajarilmadi - Red X */}
                                        <label 
                                            className={`btn btn-danger btn-lg rounded-circle ${
                                                !task.is_completed ? '' : 'btn-outline-danger'
                                            }`}
                                            style={{ 
                                                width: '70px', 
                                                height: '70px',
                                                cursor: isPast ? 'not-allowed' : 'pointer',
                                                boxShadow: !task.is_completed ? '0 6px 20px rgba(220, 53, 69, 0.4)' : 'none',
                                                border: !task.is_completed ? '3px solid #dc3545' : '3px solid #dc3545',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                opacity: isPast ? 0.6 : 1
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`task-${task.id}`}
                                                checked={!task.is_completed}
                                                onChange={() => task.is_completed && toggleTaskStatus(task.id, task.is_completed)}
                                                disabled={savingTaskId === task.id || isPast}
                                                style={{ display: 'none' }}
                                            />
                                            {savingTaskId === task.id && !task.is_completed ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="ri-close-line" style={{ fontSize: '32px' }}></i>
                                            )}
                                        </label>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-3">
                                        {task.is_completed ? (
                                            <span className="badge bg-success" style={{ borderRadius: '10px', padding: '8px 16px' }}>
                                                <i className="ri-checkbox-circle-fill me-1"></i>
                                                Bajarildi
                                            </span>
                                        ) : (
                                            <span className="badge bg-warning" style={{ borderRadius: '10px', padding: '8px 16px' }}>
                                                <i className="ri-time-line me-1"></i>
                                                Kutilmoqda
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Past Date Warning */}
            {isPast && (
                <div className="alert alert-warning mt-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <i className="ri-information-line me-2"></i>
                    <strong>Diqqat!</strong> O'tgan kunlar uchun vazifalarni o'zgartirish mumkin emas.
                </div>
            )}

            {/* Add Task Modal */}
            {showAddModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px 20px 0 0' }}>
                                <h5 className="modal-title text-white">
                                    <i className="ri-add-circle-line me-2"></i>
                                    Yangi vazifa qo'shish
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowAddModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleAddTask}>
                                <div className="modal-body p-4">
                                    {/* Emoji Selection */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="ri-emotion-line me-2"></i>
                                            Emoji tanlang
                                        </label>
                                        <div className="p-3 border rounded" style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '15px' }}>
                                            <div className="d-flex flex-wrap gap-2">
                                                {emojiList.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        className={`btn ${
                                                            newTask.emoji === emoji ? 'btn-primary' : 'btn-outline-secondary'
                                                        }`}
                                                        style={{ 
                                                            fontSize: '28px', 
                                                            width: '60px', 
                                                            height: '60px',
                                                            borderRadius: '12px'
                                                        }}
                                                        onClick={() => setNewTask({ ...newTask, emoji })}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task Name */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="ri-text me-2"></i>
                                            Vazifa nomi *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            style={{ borderRadius: '12px' }}
                                            placeholder="Masalan: Kitob o'qish"
                                            value={newTask.name}
                                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="ri-file-text-line me-2"></i>
                                            Tavsif (ixtiyoriy)
                                        </label>
                                        <textarea
                                            className="form-control"
                                            style={{ borderRadius: '12px' }}
                                            rows="3"
                                            placeholder="Vazifa haqida qo'shimcha ma'lumot..."
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    {/* Preview */}
                                    <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
                                        <strong>Ko'rinishi:</strong>
                                        <div className="mt-2 p-3 bg-white rounded text-center">
                                            <div style={{ fontSize: '48px' }}>{newTask.emoji}</div>
                                            <h6 className="mt-2">{newTask.name || '(Vazifa nomi)'}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4">
                                    <button
                                        type="button"
                                        className="btn btn-lg btn-secondary"
                                        style={{ borderRadius: '12px' }}
                                        onClick={() => setShowAddModal(false)}
                                        disabled={addingTask}
                                    >
                                        <i className="ri-close-line me-2"></i>
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-lg btn-primary"
                                        style={{ borderRadius: '12px' }}
                                        disabled={addingTask}
                                    >
                                        {addingTask ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saqlanmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-save-line me-2"></i>
                                                Saqlash
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KunlikVazifalar;