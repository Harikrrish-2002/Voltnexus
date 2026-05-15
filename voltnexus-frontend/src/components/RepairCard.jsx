
import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

const RepairCard = ({ ticket }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-400 border-green-500/30 bg-green-500/10';
            case 'In Progress': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
            case 'Pending': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="h-5 w-5" />;
            case 'In Progress': return <Wrench className="h-5 w-5" />;
            case 'Pending': return <Clock className="h-5 w-5" />;
            default: return <AlertTriangle className="h-5 w-5" />;
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{ticket.device}</h3>
                    <p className="text-sm text-gray-400">{ticket.model}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status}</span>
                </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{ticket.issue}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t border-slate-700/50 pt-4">
                <span>Ticket ID: {ticket.id}</span>
                <span>Est. Delivery: <span className="text-white">{ticket.estimatedDelivery || "TBD"}</span></span>
            </div>
        </div>
    );
};

export default RepairCard;
