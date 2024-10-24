import { gql } from "@apollo/client";

export const GET_USER_CHATBOTS = gql`
  query GetUserChatbots {
    chatbotsList {
      id
      clerk_user_id
      name
      chat_sessions {
        id
        created_at
        guests {
          name
          email
        }
      }
    }
  }
`;

export const GET_CHATBOT_BY_ID = gql`
  query GetChatbotById($id: Int!) {
    chatbots(id: $id) {
      id
      name
      created_at
      personality
      chatbot_characteristics {
        id
        content
        created_at
      }
      chat_sessions {
        id
        created_at
        guest_id
        messages {
          id
          content
          created_at
          sender
        }
        feedbacks {
          id
          content  
          sentiment
          created_at
          sender
        }
      }
    }
  }
`;

export const GET_CHATBOT_BY_USER = gql`
  query GetChatbotsByUser {
    chatbotsList {
      id
      clerk_user_id
      name
      created_at
      chatbot_characteristics {
        id
        content
        created_at
      }
      chat_sessions {
        id
        created_at
        guest_id
        messages {
          id
          content
          created_at
        }
        feedbacks {
          id
          content  
          sentiment
          created_at
        }
      }
    }
  }
`;

export const GET_CHAT_SESSION_MESSAGES = gql`
  query GetChatSessionMessages($id: Int!) {
    chat_sessions(id: $id) {
      id
      created_at
      messages {
        id
        content
        created_at
        sender
      }
      feedbacks { 
        id
        content  
        sentiment
        created_at
        sender
      }
      chatbots {
        name
      }
      guests {
        name
        email
      }
    }
  }
`;

export const GET_FEEDBACK_MESSAGES = gql`
  query GetFeedbackMessages {
    feedbackList {
      id
      chat_session_id
      content
      sentiment
      created_at
      sender
      chat_session {
        id
        created_at
        guests {
          name
          email
        }
        chatbots {
          id
          name
        }
      }
    }
  }
`;
