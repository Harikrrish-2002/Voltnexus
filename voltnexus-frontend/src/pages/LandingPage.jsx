
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Shield } from 'lucide-react';

const LandingPage = ({ isLoggedIn, role }) => {
    const navigate = useNavigate();

    const handleProtectedAction = () => {
        if (isLoggedIn) {
            const roleKey = role ? String(role).trim().toLowerCase() : 'user';
            if (roleKey === 'worker') {
                navigate('/worker-dashboard');
            } else if (roleKey === 'dealer') {
                navigate('/dealer-dashboard');
            } else if (roleKey === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/login');
        }
    };


    return (
        <div className="text-white">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
                        <span className="block">Expert Care for Your</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Digital World
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        From smartphone repairs to custom-built inverters, VoltNexus brings professional electronics service right to your doorstep.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleProtectedAction} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                            Book a Repair <ArrowRight className="inline-block ml-2 h-5 w-5" />
                        </button>
                        <button onClick={handleProtectedAction} className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-600 px-8 py-4 rounded-full font-bold text-lg transition-all">
                            Build Inverter
                        </button>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]"></div>
                    <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"></div>
                </div>
            </div>

            {/* About Us Section */}
            <section id="about" className="py-12">
                <div className="max-w-7xl mx-auto px-8 py-20 bg-slate-900/40 rounded-[4rem] border border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
                                About VoltNexus
                            </h2>
                            <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                                <p>
                                    VoltNexus is your premier destination for comprehensive electronics solutions. Born from a passion for technology and a distinct need for reliable repair services, we bridge the gap between complex electronic problems and expert solutions.
                                </p>
                                <p>
                                    Our team consists of certified technicians and engineers dedicated to restoring your devices to their optimal performance. Whether it's a micro-soldering job on a motherboard or designing a custom power backup system for your home, we bring precision, expertise, and transparency to every job.
                                </p>
                                <p>
                                    We believe in extending the lifespan of your electronics, reducing e-waste, and empowering you with technology that works when you need it most.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
                            <div className="relative bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                                            <Shield className="h-6 w-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Trusted Expertise</h4>
                                            <p className="text-gray-400">Years of experience in handling sensitive electronics with care and precision.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                                            <Cpu className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Advanced Lab</h4>
                                            <p className="text-gray-400">Equipped with state-of-the-art diagnostic and repair tools.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                            <Globe className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Eco-Conscious</h4>
                                            <p className="text-gray-400">Committed to reducing electronic waste through effective repairs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-12">
                <div className="max-w-7xl mx-auto px-8 py-20 bg-slate-800/50 rounded-[4rem] border border-slate-700/50 backdrop-blur-sm">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Our Services
                        </h2>
                        <p className="mt-4 text-gray-400">Comprehensive solutions for all your electronic needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-colors backdrop-blur-md">
                            <Cpu className="h-12 w-12 text-cyan-400 mb-6" />
                            <h3 className="text-xl font-bold mb-4">Gadget Repair</h3>
                            <p className="text-gray-400">Expert diagnosis and repair for smartphones, laptops, and tablets. We use genuine parts.</p>
                        </div>
                        <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-colors backdrop-blur-md">
                            <Shield className="h-12 w-12 text-purple-400 mb-6" />
                            <h3 className="text-xl font-bold mb-4">Custom Inverters</h3>
                            <p className="text-gray-400">Tailor-made power backup solutions designed for your specific home or office load.</p>
                        </div>
                        <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors backdrop-blur-md">
                            <Globe className="h-12 w-12 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold mb-4">Home Service</h3>
                            <p className="text-gray-400">Convenient doorstep repair for immobile devices and onsite installations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Working Section */}
            <section id="working" className="py-12">
                <div className="max-w-7xl mx-auto px-8 py-20 bg-slate-900/40 rounded-[4rem] border border-slate-800">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-500">
                            How It Works
                        </h2>
                        <p className="mt-4 text-gray-400">From complaint to delivery in 3 simple steps.</p>
                    </div>

                    <div className="relative">
                        {/* Timeline / Steps */}
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-full md:w-1/2 p-6 bg-slate-900/80 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <h3 className="text-2xl font-bold mb-2 text-cyan-400">1. Register Complaint</h3>
                                    <p className="text-gray-400">Log in and describe your issue or request a custom build. Get an instant ticket number.</p>
                                </div>
                                <div className="hidden md:block w-12 h-1 bg-cyan-500/30"></div>
                            </div>
                            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                                <div className="w-full md:w-1/2 p-6 bg-slate-900/80 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <h3 className="text-2xl font-bold mb-2 text-purple-400">2. Expert Repair</h3>
                                    <p className="text-gray-400">Our skilled workers diagnose and fix your device. Track progress in real-time.</p>
                                </div>
                                <div className="hidden md:block w-12 h-1 bg-purple-500/30"></div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-full md:w-1/2 p-6 bg-slate-900/80 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <h3 className="text-2xl font-bold mb-2 text-green-400">3. Pay & Deliver</h3>
                                    <p className="text-gray-400">Receive service report and bill. Pay securely online and get your device delivered.</p>
                                </div>
                                <div className="hidden md:block w-12 h-1 bg-green-500/30"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-12">
                <div className="max-w-4xl mx-auto px-8 py-20 bg-slate-800/30 rounded-[4rem] border border-slate-700/30">
                    <div className="text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Get In Touch</h2>
                        <form className="space-y-6 text-left bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                                <textarea rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-black text-center text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} VoltNexus. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
