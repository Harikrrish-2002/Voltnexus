
import React, { useState } from 'react';
import { User, Menu, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, user, role, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const roleKey = role ? String(role).trim().toLowerCase() : 'user';
    const dashboardPath = roleKey === 'worker' 
        ? '/worker-dashboard' 
        : roleKey === 'dealer' 
            ? '/dealer-dashboard' 
            : roleKey === 'admin'
                ? '/admin-dashboard'
                : '/dashboard';

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center gap-2">
                                <Zap className="h-8 w-8 text-cyan-400" />
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                    VoltNexus
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                About Us
                            </a>
                            <a href="#services" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Services
                            </a>
                            <a href="#working" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                How it Works
                            </a>
                            <a href="#contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Contact Us
                            </a>
                        </div>
                    </div>

                    {/* Login Button (Desktop) */}
                    <div className="hidden md:block">
                        {isLoggedIn ? (
                                <div className="flex items-center gap-2">
                                    <Link to={dashboardPath} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">{user}</span>
                                    </Link>
                                <button
                                    onClick={onLogout}
                                    className="ml-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-medium border border-red-500/20 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">About Us</a>
                        <a href="#services" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Services</a>
                        <a href="#working" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">How it Works</a>
                        <a href="#contact" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contact Us</a>
                        <div className="pt-4 pb-2">
                            {isLoggedIn ? (
                                <div className="flex items-center gap-2 px-3">
                                    <Link to={dashboardPath} onClick={toggleMenu} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">{user}</span>
                                    </Link>
                                    <button
                                        onClick={onLogout}
                                        className="ml-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-medium border border-red-500/20 transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="w-full text-left bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md text-base font-medium block"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
