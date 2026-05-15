
import React, { useState } from 'react';
import { Camera, Calendar, Save } from 'lucide-react';

const ComplaintForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        deviceType: initialData.deviceType || 'Smartphone',
        model: initialData.model || '',
        issue: initialData.issue || '',
        preferredDate: initialData.preferredDate || '',
        description: initialData.description || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700 space-y-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
                Register New Complaint
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Device Type</label>
                    <select
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    >
                        <option>Smartphone</option>
                        <option>Laptop</option>
                        <option>Tablet</option>
                        <option>Smart Watch</option>
                        <option>Game Console</option>
                        <option>TV</option>
                        <option>Home Theatre</option>
                        <option>Speakers</option>
                        <option>Mixi</option>
                        <option>Grinder</option>
                        <option>Blender</option>
                        <option>Lights</option>
                        <option>UPS</option>
                        <option>Custom Inverter</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Model Name/Number</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        placeholder="e.g. iPhone 14 Pro"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Issue Summary</label>
                <input
                    type="text"
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    placeholder="e.g. Screen Cracked"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    placeholder="Describe the problem in detail..."
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Service Date (Optional)</label>
                <div className="relative">
                    <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                    <Save className="h-5 w-5" /> Submit Complaint
                </button>
            </div>
        </form>
    );
};

export default ComplaintForm;
