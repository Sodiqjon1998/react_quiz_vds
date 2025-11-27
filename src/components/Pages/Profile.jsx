import { useState, useEffect } from 'react';
import { 
    User, Mail, Phone, Lock, Camera, Save, X, 
    GraduationCap, Loader2, ShieldCheck, Edit3 
} from 'lucide-react';
const API_BASE_URL = 'http://localhost:8000';


// ==========================================
// ⚙️ SOZLAMALAR (CONFIG)
// ==========================================

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
            
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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

            const response = await fetch(`${API_BASE_URL}/api/user/profile/update`, {
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
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-orange-500 mx-auto animate-spin" />
                    <h5 className="mt-5 text-gray-800 font-semibold text-lg">Profil yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border-t-4 border-orange-500">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-orange-100 shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {previewImage || user?.img ? (
                                        <img 
                                            src={previewImage || `${API_BASE_URL}/storage/${user.img}`} 
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=User'}}
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-400">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <label 
                                        htmlFor="imageUpload" 
                                        className="absolute bottom-1 right-1 bg-orange-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-orange-600 transition-colors transform hover:scale-105"
                                        title="Rasm yuklash"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <input 
                                            type="file" 
                                            id="imageUpload" 
                                            accept="image/*" 
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {formData.first_name} {formData.last_name}
                                </h1>
                                <p className="text-gray-500 font-medium mb-3">@{formData.name}</p>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                        <GraduationCap className="w-4 h-4" />
                                        {user?.class?.name || 'Sinf yo\'q'}
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                        <User className="w-4 h-4" />
                                        {user?.role || 'O\'quvchi'}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="self-start">
                                {!isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Tahrirlash
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <User className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-800">Shaxsiy ma'lumotlar</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                Ism
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                Familiya
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" /> Username (Login)
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" /> Telefon
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                placeholder="+998..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Password Section (Only visible in edit mode) */}
                    {isEditing && (
                        <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="w-6 h-6 text-orange-500" />
                                <h3 className="text-lg font-bold text-gray-800">Xavfsizlik</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-gray-400" /> Joriy Parol
                                    </label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleInputChange}
                                        placeholder="O'zgartirish uchun joriy parolni kiriting"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Yangi Parol</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleInputChange}
                                        placeholder="Kamida 8 ta belgi"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Parolni Tasdiqlash</label>
                                    <input
                                        type="password"
                                        name="new_password_confirmation"
                                        value={formData.new_password_confirmation}
                                        onChange={handleInputChange}
                                        placeholder="Yangi parolni qayta kiriting"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-200"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default Profile;