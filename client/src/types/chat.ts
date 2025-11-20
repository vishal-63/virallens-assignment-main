export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface Conversation {
    _id: string;
    title: string;
    messages: Message[];
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationSummary {
    _id: string;
    title: string;
    lastMessageAt: string;
    createdAt: string;
}

export interface CreateConversationRequest {
    title: string;
}

export interface SendMessageRequest {
    message: string;
}

export interface ChatState {
    conversations: ConversationSummary[];
    currentConversation: Conversation | null;
    isLoading: boolean;
    isStreaming: boolean;
    streamingMessage: string;
}
