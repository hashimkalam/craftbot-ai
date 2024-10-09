import { gql } from "@apollo/client";

export const CREATE_CHATBOT = gql`
  mutation CreateChatbot(
    $clerk_user_id: String!
    $name: String!
    $created_at: DateTime!
    $personality: String!
  ) {
    insertChatbots(
      clerk_user_id: $clerk_user_id
      name: $name
      created_at: $created_at
      personality: $personality
    ) {
      id
      name
    }
  }
`;

export const REMOVE_CHARACTERISTIC = gql`
  mutation RemoveCharacteristic($characteristicId: Int!) {
    deleteChatbot_characteristics(id: $characteristicId) {
      id
    }
  }
`;

export const DELETE_CHATBOT = gql`
  mutation DeleteChatbot($id: Int!) {
    deleteChatbots(id: $id) {
      id
    }
  }
`;

export const DELETE_CHATSESSION = gql`
  mutation DeleteChatSession($id: Int!) {
    deleteChat_sessions(id: $id) {
      id
    }
  }
`;

export const ADD_CHARACTERISTIC = gql`
  mutation AddCharacteristic(
    $chatbotId: Int!
    $content: String!
    $created_at: DateTime!
  ) {
    insertChatbot_characteristics(
      chatbot_id: $chatbotId
      content: $content
      created_at: $created_at
    ) {
      id
      content
    }
  }
`;

export const UPDATE_CHATBOT = gql`
  mutation UpdateChatbot($id: Int!, $name: String!, $personality: String!) {
    updateChatbots(id: $id, name: $name, personality: $personality) {
      id
      name
      created_at
      personality
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation InsertMessage(
    $chat_session_id: Int!
    $content: String!
    $sender: String!
    $created_at: DateTime!
  ) {
    insertMessages(
      chat_session_id: $chat_session_id
      content: $content
      sender: $sender
      created_at: $created_at
    ) {
      id
      content
      sender
    }
  }
`;

export const INSERT_FEEDBACK = gql`
  mutation InsertFeedback(
    $chat_session_id: Int!
    $content: String!
    $sender: String!
    $sentiment: String!
    $created_at: DateTime!
  ) {
    insertFeedbacks(
      chat_session_id: $chat_session_id
      content: $content
      sender: $sender
      sentiment: $sentiment
      created_at: $created_at
    ) {
      id
      content
      sender
      sentiment
    }
  }
`;

export const INSERT_GUEST = gql`
  mutation InsertGuest(
    $name: String!
    $email: String!
    $created_at: DateTime!
  ) {
    insertGuests(name: $name, email: $email, created_at: $created_at) {
      id
    }
  }
`;

export const INSERT_CHAT_SESSION = gql`
  mutation InsertChatSession(
    $chatbot_id: Int!
    $guest_id: Int!
    $created_at: DateTime!
  ) {
    insertChat_sessions(
      chatbot_id: $chatbot_id
      guest_id: $guest_id
      created_at: $created_at
    ) {
      id
    }
  }
`;

export const GET_MESSAGES_BY_CHAT_SESSION_ID = gql`
  query GetMessagesByChatSessionId($chat_session_id: Int!) {
    chat_sessions(id: $chat_session_id) {
      id
      messages {
        id
        content
        sender
        created_at
      }
    }
  }
`;

export const GET_FEEDBACKS_BY_CHAT_SESSION_ID = gql`
  query GetFeedbacksByChatSessionId($chat_session_id: Int!) {
    chat_sessions(id: $chat_session_id) {
      id
      feedbacks {
        id
        content
        sender
        sentiment
        created_at
      }
    }
  }
`;
