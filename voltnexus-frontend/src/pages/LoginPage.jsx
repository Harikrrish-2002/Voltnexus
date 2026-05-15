
import React, { useState, useEffect } from 'react';
import { User, Shield, Wrench, Briefcase, ArrowRight, Lock, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = ({ onLogin, isLoggedIn, role }) => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetIdentifier, setResetIdentifier] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // First check props, then fallback to localStorage if needed
        let currentRole = role;
        let loggedIn = isLoggedIn;

        if (!loggedIn) {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const user = JSON.parse(userInfo);
                    currentRole = user.role;
                    loggedIn = true;
                } catch {
                    // Ignore parse errors
                }
            }
        }

        if (loggedIn) {
            const roleKey = currentRole ? String(currentRole).trim().toLowerCase() : 'user';
            if (roleKey === 'worker') {
                navigate('/worker-dashboard');
            } else if (roleKey === 'dealer') {
                navigate('/dealer-dashboard');
            } else if (roleKey === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isLoggedIn, role, navigate]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    // Handle URL parameters for verification (Removed as no longer used)

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegistering) {
            if (!/^\d{1,10}$/.test(phoneNumber)) {
                alert('Phone number should not exceed 10 digits.');
                return;
            }
            if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
                alert('Email must be a valid Gmail address (e.g. user@gmail.com).');
                return;
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
                alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                const { data } = await api.post(
                    '/auth/register',
                    { name, email, password, phone: phoneNumber, role: selectedRole },
                    config
                );

                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data));
                onLogin(data.role, data.email, data.name);
            } catch (error) {
                alert(error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message);
            }
        } else {
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                const { data } = await api.post(
                    '/auth/login',
                    { email, password, role: selectedRole },
                    config
                );

                console.log('API Login Response Data:', data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data));
                onLogin(data.role, data.email, data.name);

            } catch (error) {
                alert(error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message);
            }
        }
    };

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/forgot-password', { identifier: resetIdentifier });
            alert("OTP sent successfully to your registered contact.");
            setResetStep(2);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/reset-password', {
                identifier: resetIdentifier,
                otp: resetOtp,
                newPassword: newPassword
            });
            alert('Password successfully reset! Please login.');
            setIsForgotPassword(false);
            setResetStep(1);
            setResetIdentifier('');
            setResetOtp('');
            setNewPassword('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const roles = [
        { id: 'User', icon: User, color: 'cyan', description: 'Register complaints & track repairs' },
        { id: 'Worker', icon: Wrench, color: 'green', description: 'Manage assigned tasks' },
        { id: 'Dealer', icon: Briefcase, color: 'purple', description: 'Supply chain & inventory' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-5xl w-full">
                {!selectedRole ? (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                            Welcome to VoltNexus
                        </h1>
                        <p className="text-gray-400 text-xl mb-12">Select your portal to continue</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={`group relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-700 p-8 rounded-2xl hover:border-${role.color}-500/50 transition-all hover:scale-105 text-left`}
                                >
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${role.color}-500`}>
                                        <role.icon className="h-24 w-24" />
                                    </div>
                                    <div className={`h-12 w-12 rounded-full bg-${role.color}-500/20 flex items-center justify-center mb-6 text-${role.color}-400 group-hover:bg-${role.color}-500/30 transition-colors`}>
                                        <role.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{role.id}</h3>
                                    <p className="text-gray-400 text-sm">{role.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : isForgotPassword ? (
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={() => {
                                setIsForgotPassword(false);
                                setResetStep(1);
                            }}
                            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                        >
                            ← Back to login
                        </button>

                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {resetStep === 1 ? 'Enter your registered email or phone number' : 'Enter the OTP sent to your contact'}
                                </p>
                            </div>

                            {resetStep === 1 ? (
                                <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email or Phone</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={resetIdentifier}
                                                onChange={(e) => setResetIdentifier(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                                placeholder="user@example.com / 9876543210"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                                        Send OTP <ArrowRight className="h-5 w-5" />
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">OTP</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={resetOtp}
                                                onChange={(e) => setResetOtp(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all tracking-widest text-center"
                                                placeholder="123456"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {newPassword && (
                                            <ul className="text-xs mt-2 space-y-1 pl-2">
                                                <li className={newPassword.length >= 8 ? "text-green-400 font-medium" : "text-gray-400"}>• Minimum 8 characters</li>
                                                <li className={/[A-Z]/.test(newPassword) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 uppercase letter</li>
                                                <li className={/[a-z]/.test(newPassword) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 lowercase letter</li>
                                                <li className={/\d/.test(newPassword) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 number</li>
                                                <li className={/[@$!%*?&]/.test(newPassword) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 special character (@$!%*?&)</li>
                                            </ul>
                                        )}
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                                        Update Password
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={() => {
                                setSelectedRole(null);
                            }}
                            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                        >
                            ← Back to role selection
                        </button>

                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl">
                            <div className="text-center mb-8">
                                <div className={`mx-auto h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-${roles.find(r => r.id === selectedRole).color}-400`}>
                                    {React.createElement(roles.find(r => r.id === selectedRole).icon, { className: 'h-8 w-8' })}
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {`${selectedRole} ${isRegistering ? 'Registration' : 'Login'}`}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {isRegistering ? 'Create your account to get started' : 'Enter your credentials to access the dashboard'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {isRegistering && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                                    placeholder="+91 1234567890"
                                                    required
                                                />
                                            </div>
                                            {isRegistering && phoneNumber && !/^\d{1,10}$/.test(phoneNumber) && (
                                                <p className="text-red-400 text-xs mt-1">Phone number must be up to 10 digits.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                    {isRegistering && email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) && (
                                        <p className="text-red-400 text-xs mt-1">Must be a valid @gmail.com address.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {isRegistering && password && (
                                        <ul className="text-xs mt-2 space-y-1 pl-2">
                                            <li className={password.length >= 8 ? "text-green-400 font-medium" : "text-gray-400"}>• Minimum 8 characters</li>
                                            <li className={/[A-Z]/.test(password) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 uppercase letter</li>
                                            <li className={/[a-z]/.test(password) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 lowercase letter</li>
                                            <li className={/\d/.test(password) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 number</li>
                                            <li className={/[@$!%*?&]/.test(password) ? "text-green-400 font-medium" : "text-gray-400"}>• At least 1 special character (@$!%*?&)</li>
                                        </ul>
                                    )}
                                </div>

                                {isRegistering && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {confirmPassword && password !== confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                                        )}
                                    </div>
                                )}

                                {!isRegistering && (
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 group">
                                    {isRegistering ? 'Create Account' : 'Login'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                                >
                                    {isRegistering ? 'Already have an account? Login' : 'New to VoltNexus? Create an account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
