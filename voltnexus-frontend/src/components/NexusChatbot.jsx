import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const NexusChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I am Nexus. How can I help you with your electrical components and gadgets today?", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMsg = inputText.trim();
        setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
        setInputText("");
        setIsLoading(true);

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            
            if (data.response) {
                setMessages(prev => [...prev, { text: data.response, sender: "bot" }]);
            } else {
                setMessages(prev => [...prev, { text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.", sender: "bot" }]);
            }
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, { text: "I'm sorry, my servers are currently unreachable. Please try again later.", sender: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-bounce"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                            <Bot className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Nexus</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-800/50 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-cyan-600 text-white rounded-tr-sm'
                                        : 'bg-slate-700 text-gray-100 rounded-tl-sm border border-slate-600'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-slate-700 text-gray-100 rounded-tl-sm border border-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your issue..."
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-gray-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NexusChatbot;
