export interface Chatbot {
  id: number;
  clerk_user_id: string;
  name: string;
  created_at: string;
  personality: string;
  message_count: number;
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
  chatbot_id: number; // Added chatbot_id for reference
  guest_id: number | null;
  created_at: string;
  messages: Message[];
  feedbacks: Feedback[];
  guests: Guest; // Consider changing to guests: Guest[] if multiple guests are possible
}

export interface User { 
  clerk_user_id?: string
  subscription_plan?: string
  created_at?: string
}

export interface Message {
  id: number;
  chat_session_id: number;
  content: string;
  sender: "ai" | "user";
  created_at: string;
}

export interface Feedback {
  id: number;
  chat_session_id: number;
  content: string;
  sender: "ai" | "user";
  sentiment: string;
  created_at: string;
}

export interface GetChatbotByIdResponse {
  chatbots: Chatbot;
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
    feedbacks: Feedback[];
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
  chat_sessions: ChatSession;
}

export interface MessageByChatSessionIdVariables {
  chat_session_id: number;
}

export interface FeedbackByChatSessionIdResponse {
  chat_sessions: ChatSession;
}

export interface FeedbacksByChatSessionIdVariables {
  chat_session_id: number;
}

export interface ClusteredFeedback {
  cluster: string;
  feedbacks: string[];
  feedbackSummarize?: string;
}

export interface CommonFeedbackResponse {
  clusteredQueries: ClusteredFeedback[];
}

export interface KMeansResult {
  clusters: number[];
  centroids: number[][];
  iterations: number;
  converged: boolean;
}

export interface RequestBody {
  feedbacks: string[];
}

export interface TotalGuestsProps {
  text: string;
  count: number;
  loadingCount: boolean;
}

export interface PieChartProps {
  messageCount: number; // Current number of sessions 
  subscriptionPlan: string | undefined
}

export interface SentimentPieChartProps {
  neutral: number;
  positive: number;
  negative: number;
}

// Type definitions
export interface ScrapeResult {
  title: string;
  headings: string[];
  paragraphs: string[];
  mainContent: string;
}

export interface ScrapedResponse {
  title: string;
  headings: string[];
  paragraphs: string[];
  scrapedDataSummary: string;
  metadata: ResponseMetadata;
}

export interface ResponseMetadata {
  processingTimeMs: number;
  totalParagraphs: number;
  contentLength: number;
}

export interface ScrapeConfig {
  maxRetries: number;
  timeout: number;
  minContentLength: number;
  maxParagraphs: number;
}
