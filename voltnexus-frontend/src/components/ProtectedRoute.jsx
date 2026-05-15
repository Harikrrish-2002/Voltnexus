import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn, children, requiredRole }) => {
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        let currentRole = null;
        const userInfo = localStorage.getItem('userInfo');
        
        if (userInfo) {
            try {
                currentRole = JSON.parse(userInfo).role;
            } catch (error) {
                console.error("Error parsing user info in ProtectedRoute:", error);
            }
        }

        const userRoleKey = currentRole ? String(currentRole).trim().toLowerCase() : 'user';
        const requiredRoleKey = String(requiredRole).trim().toLowerCase();

        if (userRoleKey !== requiredRoleKey) {
            // Unauthorised, redirect to home or their specific dashboard
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
