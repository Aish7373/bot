import React, { useState } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";

// GraphQL queries/mutations/subscriptions using standard Hasura tables (no _connection)
const GET_CHATS = gql`
  query GetChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }) {
      id
      title
    }
  }
`;

const GET_MESSAGES = gql`
  subscription GetMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }) {
      id
      content
      role
      created_at
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(
      object: { chat_id: $chat_id, content: $content, role: "user" }
    ) {
      id
      content
      created_at
    }
  }
`;

const USER_ID = "5f43ea02-561e-46af-b6cc-08a4a111729d"; // Your user ID here

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const { data: chatsData, loading: chatsLoading, error: chatsError } = useQuery(GET_CHATS, {
    variables: { user_id: USER_ID },
  });

  const chatId = selectedChat?.id;

  const { data: messagesData, loading: messagesLoading, error: messagesError } = useSubscription(GET_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId,
  });

  const [insertMessage] = useMutation(INSERT_MESSAGE);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatId) return;
    try {
      await insertMessage({
        variables: { chat_id: chatId, content: messageInput.trim() },
      });
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Chat list */}
      <div style={styles.chatsContainer}>
        <h3 style={styles.title}>Chats</h3>
        {chatsLoading && <div style={styles.infoText}>Loading chats...</div>}
        {chatsError && <div style={styles.errorText}>Error loading chats: {chatsError.message}</div>}
        {!chatsLoading && !chatsError && (!chatsData?.chats.length) && (
          <div style={styles.infoText}>No chats found.</div>
        )}
        {chatsData?.chats.map((node) => (
          <div
            key={node.id}
            style={{
              ...styles.chatItem,
              backgroundColor: selectedChat?.id === node.id ? "#444" : "#333",
              color: selectedChat?.id === node.id ? "#fff" : "#ddd",
            }}
            onClick={() => setSelectedChat(node)}
          >
            {node.title}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        <h3 style={styles.title}>{selectedChat?.title || "Select a chat"}</h3>
        <div style={styles.messagesList}>
          {messagesLoading && <div style={styles.infoText}>Loading messages...</div>}
          {messagesError && <div style={styles.errorText}>Error loading messages: {messagesError.message}</div>}
          {!messagesLoading && !messagesError && (!messagesData || !messagesData.messages.length) && (
            <div style={styles.infoText}>No messages yet.</div>
          )}
          {messagesData?.messages.map((node) => (
            <div
              key={node.id}
              style={{
                ...styles.messageItem,
                alignSelf: node.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: node.role === "user" ? "#0078d7" : "#555",
                color: "#fff",
              }}
            >
              <div style={styles.messageContent}>{node.content}</div>
              <div style={styles.messageTimestamp}>{new Date(node.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
        {/* Input area */}
        {selectedChat && (
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={styles.input}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#222",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#ddd",
  },
  chatsContainer: {
    width: "280px",
    borderRight: "1px solid #444",
    backgroundColor: "#333",
    padding: "16px",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  messagesContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 16px 0",
    fontWeight: "bold",
    fontSize: "1.25rem",
  },
  chatItem: {
    padding: "12px 16px",
    marginBottom: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s, color 0.3s",
  },
  messagesList: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #444",
    backgroundColor: "#2a2a2a",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageItem: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "0.9rem",
    wordBreak: "break-word",
  },
  messageContent: {
    marginBottom: "4px",
  },
  messageTimestamp: {
    fontSize: "0.7rem",
    color: "#bbb",
    textAlign: "right",
  },
  inputContainer: {
    marginTop: "12px",
    display: "flex",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "20px",
    border: "none",
    fontSize: "1rem",
    outline: "none",
    marginRight: "12px",
    backgroundColor: "#444",
    color: "#fff",
  },
  sendButton: {
    backgroundColor: "#0078d7",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  },
};
