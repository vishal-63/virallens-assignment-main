import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../utils/chatApi';
import { ConversationSummary } from '../types/chat';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes, FaPlus, FaTrashAlt } from 'react-icons/fa';

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            const data = await chatApi.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewConversation = async () => {
        try {
            setIsCreating(true);
            const newConversation = await chatApi.createConversation({
                title: 'New Conversation'
            });
            setConversations(prev => [newConversation, ...prev]);
            navigate(`/chat/${newConversation._id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await chatApi.deleteConversation(id);
            setConversations(prev => prev.filter(conv => conv._id !== id));

            if (conversationId === id) {
                navigate('/chat');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

        return date.toLocaleDateString();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-lg
                lg:relative lg:translate-x-0 lg:z-0 lg:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
                            <button
                                onClick={onToggle}
                                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-30"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleNewConversation}
                            disabled={isCreating}
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium shadow-sm"
                        >
                            {isCreating ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FaPlus className="w-4 h-4 mr-2" />
                                    New Chat
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <LoadingSpinner />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">No conversations yet</h3>
                                <p className="text-sm text-gray-500">Create your first chat to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <Link
                                        key={conv._id}
                                        to={`/chat/${conv._id}`}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) {
                                                onToggle();
                                            }
                                        }}
                                        className={`
                                            block p-4 rounded-xl transition-all duration-200 group relative
                                            ${conversationId === conv._id
                                                ? 'bg-gray-800 text-white shadow-md'
                                                : 'bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <h3 className={`
                                                    text-sm font-semibold truncate leading-5
                                                    ${conversationId === conv._id ? 'text-white' : 'text-gray-900'}
                                                `}>
                                                    {conv.title}
                                                </h3>
                                                <p className={`
                                                    text-xs mt-2 font-medium
                                                    ${conversationId === conv._id ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                    {formatDate(conv.lastMessageAt)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => handleDeleteConversation(conv._id, e)}
                                                className={`
                                                    opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200
                                                    ${conversationId === conv._id
                                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                                                    }
                                                `}
                                                title="Delete conversation"
                                            >
                                                <FaTrashAlt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
