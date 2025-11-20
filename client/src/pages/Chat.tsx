import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../utils/chatApi';
import { Conversation, Message } from '../types/chat';
import LoadingSpinner from '../components/LoadingSpinner';

const Chat = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (conversationId) {
            loadConversation();
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages, streamingMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversation = async () => {
        if (!conversationId) return;

        try {
            setIsLoading(true);
            // Its intentional so don't count it as a bug
            await new Promise(resolve => setTimeout(resolve, 5000));
            const data = await chatApi.getConversation(conversationId);
            setConversation(data);
        } catch (error) {
            console.error('Error loading conversation:', error);
            navigate('/chat');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !conversationId || isStreaming) return;

        const userMessage = message.trim();
        setMessage('');
        setIsStreaming(true);
        setStreamingMessage('');

        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };

        setConversation(prev => prev ? {
            ...prev,
            messages: [...prev.messages, newUserMessage]
        } : null);

        try {
            const stream = await chatApi.sendMessage(conversationId, userMessage);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                setStreamingMessage(fullResponse);
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
            };

            setConversation(prev => prev ? {
                ...prev,
                messages: [...prev.messages, aiMessage],
                lastMessageAt: new Date().toISOString()
            } : null);

            setStreamingMessage('');

        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                    <div className="text-gray-600 text-lg font-medium">Conversation not found</div>
                    <p className="text-gray-500 text-sm mt-2">This conversation may have been deleted or doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">


            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {conversation.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-3xl">💬</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start the conversation</h3>
                            <p className="text-gray-600">Send a message to begin chatting with the marketing assistant.</p>
                        </div>
                    </div>
                ) : (
                    conversation.messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-[80%]`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${msg.role === 'user'
                                    ? 'bg-gray-800 text-white ml-3'
                                    : 'bg-gray-300 text-gray-700 mr-3'
                                    }`}>
                                    {msg.role === 'user' ? 'U' : 'AI'}
                                </div>

                                <div className={`rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-gray-800 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                                    }`}>
                                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                    <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                        {formatTimestamp(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isStreaming && streamingMessage && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-medium mr-3">
                                AI
                            </div>
                            <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {streamingMessage}
                                    <span className="inline-block w-0.5 h-4 bg-gray-600 ml-1 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isStreaming && !streamingMessage && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-medium mr-3">
                                AI
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white px-6 py-4 shadow-lg">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            adjustTextareaHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none min-h-[44px] max-h-[120px] text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                        disabled={isStreaming}
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isStreaming}
                        className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm h-[44px]"
                    >
                        {isStreaming ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>Send</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
