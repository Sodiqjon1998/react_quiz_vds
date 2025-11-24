import React, { useState, useEffect } from 'react';

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:8000/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                setFormData({
                    name: data.user.name || '',
                    first_name: data.user.first_name || '',
                    last_name: data.user.last_name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                
                // localStorage'ni yangilash
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            alert('Profil ma\'lumotlarini yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('Rasm hajmi 2MB dan kichik bo\'lishi kerak!');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.email.trim()) {
            alert('Username va Email majburiy!');
            return;
        }

        if (formData.new_password) {
            if (!formData.current_password) {
                alert('Yangi parol o\'rnatish uchun joriy parolni kiriting!');
                return;
            }
            if (formData.new_password !== formData.new_password_confirmation) {
                alert('Yangi parollar mos kelmadi!');
                return;
            }
            if (formData.new_password.length < 8) {
                alert('Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak!');
                return;
            }
        }

        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('last_name', formData.last_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);

            if (formData.new_password) {
                formDataToSend.append('current_password', formData.current_password);
                formDataToSend.append('new_password', formData.new_password);
                formDataToSend.append('new_password_confirmation', formData.new_password_confirmation);
            }

            if (imageFile) {
                formDataToSend.append('img', imageFile);
            }

            const response = await fetch('http://localhost:8000/api/user/profile/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('✅ Profil muvaffaqiyatli yangilandi!');
                setIsEditing(false);
                fetchUserProfile();
                
                // Parol maydonlarini tozalash
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                }));
                setImageFile(null);
                setPreviewImage(null);
            } else {
                alert('❌ Xatolik: ' + (data.message || 'Ma\'lumotlarni saqlashda xatolik!'));
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('❌ Serverga ulanishda xatolik!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user.name || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        });
        setPreviewImage(null);
        setImageFile(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-6">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center justify-content-between mb-4 flex-column flex-sm-row gap-3">
                            <h4 className="mb-0">
                                <i className="ri-user-3-line me-2"></i>
                                Profil Ma'lumotlari
                            </h4>
                            {!isEditing && (
                                <button 
                                    className="btn btn-primary w-100 w-sm-auto"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="ri-edit-line me-1"></i>
                                    Tahrirlash
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Avatar Section */}
                            <div className="row mb-4">
                                <div className="col-12 text-center">
                                    <div className="position-relative d-inline-block">
                                        <div className="avatar avatar-xl mb-3 position-relative">
                                            {previewImage || user?.img ? (
                                                <img 
                                                    src={previewImage || `http://localhost:8000/storage/${user.img}`} 
                                                    alt="Avatar"
                                                    className="rounded-circle border border-3 border-white shadow"
                                                    style={{ width: '250px', objectFit: 'cover', border: '3px double orage' }}
                                                />
                                            ) : (
                                                <span 
                                                    className="avatar-initial rounded-circle bg-label-primary border border-3 border-white shadow"
                                                    style={{ width: '120px', height: '120px', fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            )}
                                            
                                            {isEditing && (
                                                <label 
                                                    htmlFor="imageUpload" 
                                                    className="btn btn-light position-absolute rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                    style={{ 
                                                        bottom: '5px', 
                                                        right: '5px', 
                                                        width: '26px', 
                                                        height: '26px',
                                                        cursor: 'pointer',
                                                        padding: '0'
                                                    }}
                                                    title="Rasm yuklash"
                                                >
                                                    +
                                                </label>
                                            )}
                                            <input 
                                                type="file" 
                                                id="imageUpload" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <h5 className="mb-1 mt-2">{user?.name}</h5>
                                    <p className="text-muted mb-0">
                                        <i className="ri-graduation-cap-line me-1"></i>
                                        {user?.class?.name || 'Sinf ma\'lumoti yo\'q'}
                                    </p>
                                </div>
                            </div>

                            <div className="row g-3">
                                {/* Username */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-user-line me-1"></i>
                                        Username (Login uchun)
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-mail-line me-1"></i>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* First Name */}
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-account-circle-line me-1"></i>
                                        Ism
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-account-circle-line me-1"></i>
                                        Familiya
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-phone-line me-1"></i>
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="+998901234567"
                                    />
                                </div>

                                {/* Class (Read-only) */}
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-graduation-cap-line me-1"></i>
                                        Sinf
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user?.class?.name || 'Sinf ma\'lumoti yo\'q'}
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
                            {isEditing && (
                                <>
                                    <hr className="my-4" />
                                    <h5 className="mb-3">
                                        <i className="ri-lock-password-line me-2"></i>
                                        Parolni O'zgartirish
                                    </h5>
                                    <p className="text-muted small mb-3">
                                        Parolni o'zgartirish ixtiyoriy. Agar parolni o'zgartirmoqchi bo'lmasangiz, bu maydonlarni bo'sh qoldiring.
                                    </p>

                                    <div className="row g-3">
                                        {/* Current Password */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                <i className="ri-lock-line me-1"></i>
                                                Joriy Parol
                                            </label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                className="form-control"
                                                value={formData.current_password}
                                                onChange={handleInputChange}
                                                placeholder="Joriy parolingizni kiriting"
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div className="col-12 col-sm-6">
                                            <label className="form-label fw-semibold">
                                                <i className="ri-lock-password-line me-1"></i>
                                                Yangi Parol
                                            </label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                className="form-control"
                                                value={formData.new_password}
                                                onChange={handleInputChange}
                                                placeholder="Kamida 8 ta belgi"
                                            />
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="col-12 col-sm-6">
                                            <label className="form-label fw-semibold">
                                                <i className="ri-shield-check-line me-1"></i>
                                                Parolni Tasdiqlang
                                            </label>
                                            <input
                                                type="password"
                                                name="new_password_confirmation"
                                                className="form-control"
                                                value={formData.new_password_confirmation}
                                                onChange={handleInputChange}
                                                placeholder="Parolni qayta kiriting"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="mt-4 d-flex flex-column flex-sm-row gap-2 justify-content-end">
                                    <button 
                                        type="button"
                                        className="btn btn-outline-secondary order-2 order-sm-1"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        <i className="ri-close-line me-1"></i>
                                        Bekor qilish
                                    </button>
                                    <button 
                                        type="submit"
                                        className="btn btn-primary order-1 order-sm-2"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Saqlanmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-save-line me-1"></i>
                                                Saqlash
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;