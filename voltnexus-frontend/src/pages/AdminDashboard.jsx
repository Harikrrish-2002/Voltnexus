import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Admin Profile State
    const [adminProfile, setAdminProfile] = useState(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                return {
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    phone: parsedUser.phone || '',
                    role: parsedUser.role || ''
                };
            } catch (e) { console.error("Error parsing local storage", e); }
        }
        return { name: '', email: '', phone: '', role: '' };
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(adminProfile);

    // Fetch Admin Profile
    const fetchAdminProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data) {
                setAdminProfile(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                    role: data.role || prev.role
                }));
            }
        } catch (error) {
            console.error("AdminDashboard: Failed to fetch admin profile", error);
        }
    };

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    // Profile Handlers
    const handleProfileEdit = () => {
        if (isEditingProfile) {
            setAdminProfile(tempProfile);
            setIsEditingProfile(false);
        } else {
            setTempProfile(adminProfile);
            setIsEditingProfile(true);
        }
    };

    const handleProfileChange = (e) => {
        setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Admin Profile</h2>
                            <button
                                onClick={handleProfileEdit}
                                className={`${isEditingProfile ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                            >
                                {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="space-y-4 max-w-xl">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Name</label>
                                {isEditingProfile ? (
                                    <input name="name" value={tempProfile.name} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{adminProfile.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Email</label>
                                {isEditingProfile ? (
                                    <input name="email" value={tempProfile.email} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{adminProfile.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Phone</label>
                                {isEditingProfile ? (
                                    <input name="phone" value={tempProfile.phone} onChange={handleProfileChange} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                                ) : <p className="text-white font-medium">{adminProfile.phone}</p>}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400">Welcome, {adminProfile.name || 'Admin'}!</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-4 space-y-2">
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                                <UserIcon className="h-5 w-5" /> My Profile
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
