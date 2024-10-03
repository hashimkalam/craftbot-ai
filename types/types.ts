export interface Chatbot {
  id: number;
  clerk_user_id: string;
  name: string;
  created_at: string;
  chatbot_characteristics: ChatbotCharacteristic[];
  chat_sessions: ChatSession[];
}

export interface ChatbotCharacteristic {
  id: number;
  chatbot_id: number;
  content: string;
  created_at: string;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  chatbot_id: number;  // Added chatbot_id for reference
  guest_id: number | null;
  created_at: string;
  messages: Message[];
  feedbacks: Feedback[];
  guests: Guest; // Consider changing to guests: Guest[] if multiple guests are possible
}

export interface Message {
  id: number;
  chat_session_id: number;
  content: string;
  created_at: string;
  sender: "ai" | "user";
}

export interface Feedback {
  id: number;
  chat_session_id: number;
  content: string;
  sentiment: string;
  created_at: string;
}

export interface GetChatbotByIdResponse {
  chatbots: Chatbot; // Changed to singular if only one chatbot is expected
}

export interface GetChatbotByIdVariables {
  id: string;
}

export interface GetChatbotsByUserData {
  chatbotsList: Chatbot[];
}

export interface GetChatbotsByUserDataVariables {
  clerk_user_id: string;
}

export interface GetUserChatbotsResponse {
  chatbotsList: Chatbot[];
}

export interface GetUserChatbotsVariables {
  userId: string;
}

export interface GetChatSessionMessagesResponse {
  chat_sessions: {
    id: number;
    created_at: string;
    messages: Message[];
    feedback: Feedback[]; // Use plural if expecting multiple feedback items
    chatbots: {
      name: string;
    };
    guests: {
      name: string;
      email: string;
    };
  };
}

export interface GetChatSessionMessagesVariables {
  id: number;
}

export interface MessagesByChatSessionIdResponse {
  chat_sessions: ChatSession; // Should match ChatSession interface
}

export interface MessageByChatSessionIdVariables {
  chat_session_id: number;
}

export interface FeedbackByChatSessionIdResponse {
  chat_sessions: ChatSession; // Should match ChatSession interface
}

export interface FeedbackByChatSessionIdVariables {
  chat_session_id: number;
}
