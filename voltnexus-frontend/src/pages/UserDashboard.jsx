import React, { useState, useEffect } from 'react';
import { User, FileText, CreditCard, MessageSquare, Receipt, PlusCircle, Star, Edit, Trash2, X, Send, Zap } from 'lucide-react';
import ComplaintForm from '../components/ComplaintForm';
import StarRating from '../components/StarRating';
import NexusChatbot from '../components/NexusChatbot';
import api from '../api';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Data State
    const [repairs, setRepairs] = useState([]);
    const [payments, setPayments] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    // Derived State for Bill vs Payment
    const pendingBills = payments.filter(p => p.status === 'Pending');
    const completedPayments = payments.filter(p => p.status === 'Completed');

    // Feedback State
    const [isWritingFeedback, setIsWritingFeedback] = useState(false);
    const [editingFeedbackId, setEditingFeedbackId] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({
        rating: 5,
        message: ''
    });

    // ... (rest of the state remains same if needed, but I'll update the whole file approach for consistency)
    // Actually I'll just replace the specific sections to be safer and avoid losing other logic.

    // User Profile State
    const [userProfile, setUserProfile] = useState(() => {
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
        return { name: '', email: '', phone: '' };
    });

    // Fetch User Profile
    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data) {
                setUserProfile(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                }));
            }
        } catch (error) {
            console.error("UserDashboard: Failed to fetch user profile", error);
        }
    };

    // Fetch Complaints
    const fetchComplaints = async () => {
        try {
            const { data } = await api.get('/complaints');
            setRepairs(data);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        }
    };

    // Fetch Payments
    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payments');
            setPayments(data);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        }
    };

    // Fetch Feedbacks
    const fetchFeedbacks = async () => {
        try {
            const { data } = await api.get('/feedback');
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchComplaints();
        fetchPayments();
        fetchFeedbacks();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(userProfile);
    const [showNewComplaintForm, setShowNewComplaintForm] = useState(false);
    const [complaintInitialData, setComplaintInitialData] = useState({});
    const [showPowerSetup, setShowPowerSetup] = useState(false);
    const [customSpecs, setCustomSpecs] = useState({ loadRequirement: '', backupTime: '', additionalNotes: '' });

    const handleEditToggle = () => {
        if (isEditing) {
            setTempProfile(userProfile);
        } else {
            setTempProfile(userProfile);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = () => {
        setUserProfile(tempProfile);
        setIsEditing(false);
        // Backend update logic would go here (requires updateUserProfile endpoint)
        alert("Profile update feature coming soon!");
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setTempProfile({
            ...tempProfile,
            [name]: value
        });
    };

    const handleComplaintSubmit = async (data) => {
        try {
            const response = await api.post('/complaints', {
                deviceType: data.deviceType,
                model: data.model,
                issue: data.issue,
                description: data.description,
                preferredDate: data.preferredDate
            });

            setRepairs([response.data, ...repairs]);
            setShowNewComplaintForm(false);
            alert("Complaint registered successfully!");
        } catch (error) {
            console.error("Failed to register complaint", error);
            const errorMessage = error.response?.data?.message || "Failed to register complaint. Please try again.";
            alert(errorMessage);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayBill = async (paymentId) => {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const { data } = await api.post('/payments/create-razorpay-order', { paymentId });
            
            if (!data || !data.order) {
                alert("Server error. Please try again.");
                return;
            }

            const options = {
                key: "rzp_test_SXIODGUEqFgs9H",
                amount: data.order.amount,
                currency: data.order.currency,
                name: "VoltNexus",
                description: "Bill Payment",
                order_id: data.order.id,
                prefill: {
                    name: userProfile.name,
                    email: userProfile.email,
                    contact: userProfile.phone
                },
                theme: {
                    color: "#06b6d4"
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    {
                                        method: "upi",
                                        flows: ["collect", "qr"]
                                    }
                                ]
                            }
                        },
                        sequence: ["block.upi"],
                        preferences: {
                            show_default_blocks: true,
                        }
                    }
                },
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentId: paymentId
                        };
                        const verifyRes = await api.post('/payments/verify-razorpay-payment', verifyData);
                        if (verifyRes.data.success) {
                            alert("Payment Successful!");
                            fetchPayments();
                        }
                    } catch (error) {
                         console.error("Payment Verification Failed", error);
                         alert(error.response?.data?.message || "Payment Verification Failed. Please contact support.");
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Failed to initiate payment", error);
            alert(error.response?.data?.message || "Payment Initiation Failed. Please try again.");
        }
    };

    // Feedback Handlers
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFeedbackId) {
                const { data } = await api.put(`/feedback/${editingFeedbackId}`, feedbackForm);
                setFeedbacks(feedbacks.map(f => f._id === editingFeedbackId ? data : f));
                alert("Feedback updated successfully!");
            } else {
                const { data } = await api.post('/feedback', feedbackForm);
                setFeedbacks([data, ...feedbacks]);
                alert("Thank you for your feedback!");
            }
            resetFeedbackForm();
        } catch (error) {
            console.error("Failed to submit feedback", error);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    const handleFeedbackDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                await api.delete(`/feedback/${id}`);
                setFeedbacks(feedbacks.filter(f => f._id !== id));
                alert("Feedback deleted.");
            } catch (error) {
                console.error("Failed to delete feedback", error);
                alert("Failed to delete feedback.");
            }
        }
    };

    const handleFeedbackEdit = (feedback) => {
        setFeedbackForm({
            rating: feedback.rating,
            message: feedback.message
        });
        setEditingFeedbackId(feedback._id);
        setIsWritingFeedback(true);
    };

    const resetFeedbackForm = () => {
        setFeedbackForm({ rating: 5, message: '' });
        setIsWritingFeedback(false);
        setEditingFeedbackId(null);
    };


    const sidebarItems = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'complaints', label: 'My Complaints', icon: FileText },
        { id: 'custom-powerbackup', label: 'Custom Powerbackup', icon: Zap },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'feedback', label: 'Feedback', icon: MessageSquare },
        { id: 'bills', label: 'My Bills', icon: Receipt },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">My Profile</h2>
                            <button
                                onClick={isEditing ? handleSaveProfile : handleEditToggle}
                                className={`${isEditing ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                {userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{userProfile.name}</h3>
                                <p className="text-gray-400">{userProfile.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={tempProfile.name}
                                            onChange={handleProfileChange}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                                        />
                                    ) : (
                                        <p className="text-white font-medium">{userProfile.name}</p>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={tempProfile.phone}
                                            onChange={handleProfileChange}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                                        />
                                    ) : (
                                        <p className="text-white font-medium">{userProfile.phone}</p>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <label className="text-sm text-gray-400 block mb-1">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={tempProfile.email}
                                            onChange={handleProfileChange}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                                        />
                                    ) : (
                                        <p className="text-white font-medium">{userProfile.email}</p>
                                    )}
                                </div>

                            </div>
                            {isEditing && (
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleEditToggle}
                                        className="text-gray-400 hover:text-white mr-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'custom-powerbackup':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Custom Powerbackup</h2>
                            {showPowerSetup && (
                                <button
                                    onClick={() => setShowPowerSetup(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Back to Options
                                </button>
                            )}
                        </div>

                        {!showPowerSetup ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8 hover:border-cyan-500/50 transition-all cursor-pointer group"
                                    onClick={() => {
                                        setShowPowerSetup(true);
                                    }}
                                >
                                    <Zap className="h-12 w-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold text-white mb-2">Create a Custom Powerbackup (Inverter)</h3>
                                    <p className="text-gray-400">Design and request a power backup solution tailored to your specific home or office requirements.</p>
                                    <div className="mt-6 flex items-center text-cyan-400 font-medium group-hover:translate-x-2 transition-transform">
                                        Get Started <PlusCircle className="ml-2 h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Select a Default Setup</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { name: 'Basic Setup', inv: '1 KVA Inverter', bat: '1x 150Ah Battery', load: '2 Fans, 3 Lights, 1 TV' },
                                            { name: 'Standard Setup', inv: '2 KVA Inverter', bat: '2x 150Ah Batteries', load: '4 Fans, 5 Lights, 1 TV, 1 PC' },
                                            { name: 'Premium Setup', inv: '5 KVA Inverter', bat: '4x 200Ah Batteries', load: 'Covers Heavy Load / 1 AC' }
                                        ].map((plan, idx) => (
                                            <div key={idx} className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl hover:border-cyan-500/50 transition-all flex flex-col h-full group">
                                                <h4 className="font-bold text-lg text-cyan-400 mb-4 group-hover:scale-105 transition-transform origin-left">{plan.name}</h4>
                                                <ul className="text-sm text-gray-300 space-y-3 mb-6 flex-grow">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>{plan.inv}</li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>{plan.bat}</li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>Suitable for: {plan.load}</li>
                                                </ul>
                                                <button
                                                    onClick={() => {
                                                        alert(`You have selected the ${plan.name}. Our team will contact you shortly.`);
                                                        setShowPowerSetup(false);
                                                    }}
                                                    className="w-full bg-slate-700 hover:bg-cyan-600 text-white py-2.5 rounded-lg transition-colors mt-auto font-medium"
                                                >
                                                    Choose {plan.name}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Or Suggest Your Custom Specifications</h3>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            alert("Your custom specifications have been submitted successfully!");
                                            setCustomSpecs({ loadRequirement: '', backupTime: '', additionalNotes: '' });
                                            setShowPowerSetup(false);
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Required Load (in Watts or KVA)</label>
                                                <input
                                                    type="text"
                                                    value={customSpecs.loadRequirement}
                                                    onChange={e => setCustomSpecs({ ...customSpecs, loadRequirement: e.target.value })}
                                                    placeholder="e.g. 3000W or 3KVA"
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Expected Backup Time (Hours)</label>
                                                <input
                                                    type="text"
                                                    value={customSpecs.backupTime}
                                                    onChange={e => setCustomSpecs({ ...customSpecs, backupTime: e.target.value })}
                                                    placeholder="e.g. 4 Hours"
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Additional Specifications / Appliance List</label>
                                            <textarea
                                                value={customSpecs.additionalNotes}
                                                onChange={e => setCustomSpecs({ ...customSpecs, additionalNotes: e.target.value })}
                                                placeholder="List the appliances you want to run (e.g. 2 ACs, 1 Refrigerator, etc.)"
                                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-[120px]"
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
                                                <Send className="h-4 w-4" /> Submit Request
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'complaints':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">My Complaints</h2>
                            {!showNewComplaintForm && (
                                <button
                                    onClick={() => setShowNewComplaintForm(true)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <PlusCircle className="h-5 w-5" /> Register Complaint
                                </button>
                            )}
                        </div>

                        {showNewComplaintForm ? (
                            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">New Complaint</h3>
                                    <button onClick={() => {
                                        setShowNewComplaintForm(false);
                                        setComplaintInitialData({});
                                    }} className="text-gray-400 hover:text-white">Cancel</button>
                                </div>
                                <ComplaintForm onSubmit={handleComplaintSubmit} initialData={complaintInitialData} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {repairs.length === 0 ? (
                                    <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                                        <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No complaints registered</h3>
                                        <p className="text-gray-400">You haven't registered any complaints yet.</p>
                                    </div>
                                ) : (
                                    repairs.map((ticket) => (
                                        <div key={ticket._id}>
                                            {/* Temporary RepairCard replacement since prop structure might differ from mock */}
                                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                                <h4 className="font-bold text-white">{ticket.ticketId}</h4>
                                                <p className="text-cyan-400">{ticket.deviceType} - {ticket.model}</p>
                                                <p className="text-gray-400">{ticket.issue}</p>
                                                <div className="mt-2 flex justify-between items-center">
                                                    <span className={`text-sm px-2 py-1 rounded font-medium
                                                        ${ticket.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                            ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                                                                ticket.status === 'Waiting for parts' ? 'bg-orange-500/20 text-orange-400' :
                                                                    ticket.status === 'Not repairable' ? 'bg-red-500/20 text-red-400' :
                                                                        'bg-yellow-500/20 text-yellow-400'}`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'payments':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8 text-center">
                        <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Payment History</h2>
                        {completedPayments.length === 0 ? (
                            <p className="text-gray-400">No payment history found.</p>
                        ) : (
                            <div className="space-y-4 text-left">
                                {completedPayments.map(payment => (
                                    <div key={payment._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between">
                                        <div>
                                            <p className="font-bold text-white">{payment.description || 'Payment'}</p>
                                            <p className="text-sm text-gray-400">Transaction ID: {payment.transactionId || 'N/A'}</p>
                                            <p className="text-sm text-gray-400">Payment Method: {payment.paymentMethod || 'N/A'}</p>
                                            <p className="text-sm text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">₹{payment.amount}</p>
                                            <p className="text-xs text-gray-400">{payment.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'feedback':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Feedback</h2>
                            {!isWritingFeedback && (
                                <button
                                    onClick={() => setIsWritingFeedback(true)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <PlusCircle className="h-5 w-5" /> Write Feedback
                                </button>
                            )}
                        </div>

                        {isWritingFeedback ? (
                            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">
                                        {editingFeedbackId ? 'Edit Your Feedback' : 'Share Your Experience'}
                                    </h3>
                                    <button onClick={resetFeedbackForm} className="text-gray-400 hover:text-white">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                        <label className="block text-sm font-medium text-gray-400 mb-3">How would you rate our service?</label>
                                        <StarRating
                                            rating={feedbackForm.rating}
                                            setRating={(r) => setFeedbackForm({ ...feedbackForm, rating: r })}
                                            size={40}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Your Comments</label>
                                        <textarea
                                            value={feedbackForm.message}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none min-h-[120px]"
                                            placeholder="Tell us what you think..."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={resetFeedbackForm}
                                            className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" /> {editingFeedbackId ? 'Update' : 'Submit'} Feedback
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {feedbacks.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                                        <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No feedback given yet</h3>
                                        <p className="text-gray-400 mb-6">You haven't shared your experience with us yet.</p>
                                        <button
                                            onClick={() => setIsWritingFeedback(true)}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Write Feedback
                                        </button>
                                    </div>
                                ) : (
                                    feedbacks.map((f) => (
                                        <div key={f._id} className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <StarRating rating={f.rating} interactive={false} size={18} />
                                                    </div>
                                                    <p className="text-gray-300 text-lg leading-relaxed">{f.message}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleFeedbackEdit(f)}
                                                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors bg-slate-800 rounded-lg border border-slate-700"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedbackDelete(f._id)}
                                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-slate-800 rounded-lg border border-slate-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(f.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'bills':
                return (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-8 text-center">
                        <Receipt className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">My Pending Bills</h2>
                        {pendingBills.length === 0 ? (
                            <p className="text-gray-400">You have no pending bills to pay.</p>
                        ) : (
                            <div className="space-y-4 text-left">
                                {pendingBills.map(bill => (
                                    <div key={bill._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <p className="font-bold text-white">{bill.description || `Bill #${bill._id.substring(bill._id.length - 6)}`}</p>
                                            <p className="text-sm text-gray-400">Generated: {new Date(bill.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between md:justify-end border-t border-slate-700 md:border-none pt-4 md:pt-0">
                                            <p className="font-bold text-white text-xl">₹{bill.amount}</p>
                                            <button
                                                onClick={() => handlePayBill(bill._id)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Pay Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400">Welcome, {userProfile.name || 'User'}!</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 p-4 space-y-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setShowNewComplaintForm(false);
                                            setShowPowerSetup(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" /> {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Chatbot Integration */}
            <NexusChatbot />
        </div >
    );
};

export default UserDashboard;
