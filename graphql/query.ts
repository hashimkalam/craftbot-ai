import { gql } from "@apollo/client";

export const GET_USER_CHATBOTS = gql`
  query GetUserChatbots {
    chatbotsList {
      id
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
      }
    }
  }
`;

export const GET_CHATBOT_BY_USER = gql`
  query GetChatbotsList {
    chatbotsList {
      id
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
      }
    }
  }
`;

export const GET_CHAT_SESSION_MESSAGES = gql`
  query GetChatSessionMessages($id: Int!)  {
    chat_sessions(id: $id)  {
      id
      created_at
      messages {
        id
        content
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
