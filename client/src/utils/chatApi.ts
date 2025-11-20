import api from './api';
import { Conversation, ConversationSummary, CreateConversationRequest } from '../types/chat';

export const chatApi = {
    async getConversations(): Promise<ConversationSummary[]> {
        return await api.get('/chat/conversations');
    },

    async getConversation(id: string): Promise<Conversation> {
        return await api.get(`/chat/conversations/${id}`);
    },

    async createConversation(data: CreateConversationRequest): Promise<Conversation> {
        return await api.post('/chat/conversations', data);
    },

    async updateConversation(id: string, title: string): Promise<Conversation> {
        return await api.put(`/chat/conversations/${id}`, { title });
    },

    async deleteConversation(id: string): Promise<void> {
        return await api.delete(`/chat/conversations/${id}`);
    },

    async sendMessage(conversationId: string, message: string): Promise<ReadableStream<Uint8Array>> {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
                throw new Error('Session expired');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        return response.body;
    }
};
