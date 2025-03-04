import React, { useState } from "react";
import axios from "axios";
import "../style/chatbot.css";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    let updatedHistory = [...chatHistory];

    if (editIndex !== null) {
      // Find AI response index (should be right after user message)
      const aiResponseIndex = editIndex + 1;

      // Update user message
      updatedHistory[editIndex] = { text: message, sender: "user" };

      // Remove the previous AI response if it exists
      if (aiResponseIndex < updatedHistory.length && updatedHistory[aiResponseIndex].sender === "ai") {
        updatedHistory.splice(aiResponseIndex, 1);
      }

      setChatHistory(updatedHistory);
      setEditIndex(null);
    } else {
      updatedHistory.push({ text: message, sender: "user" });
      setChatHistory(updatedHistory);
    }

    try {
      const result = await axios.post("http://localhost:5000/api/query", { message });

      setChatHistory((prevHistory) => [
        ...prevHistory.slice(0, updatedHistory.length), // Keep the updated messages
        { text: result.data.text, sender: "ai" } // New AI response
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory.slice(0, updatedHistory.length),
        { text: "AI is unavailable. Try again later.", sender: "ai" }
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  const handleEdit = (index) => {
    setMessage(chatHistory[index].text);
    setEditIndex(index);
  };

  return (
    <div className="chatgpt-container">
      <div className="chat-header">ChatBot AI Assistant</div>
      <div className="chatbox">
        <div className="messages">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}-message`}>
              {msg.sender === "ai" ? (
                <ReactMarkdown className="message-text">{msg.text}</ReactMarkdown>
              ) : (
                <span className="message-text">{msg.text}</span>
              )}
              {msg.sender === "user" && (
                <span className="edit-icon" onClick={() => handleEdit(index)} style={{ cursor: "pointer", marginLeft: "8px" }}>
                  ✏️
                </span>
              )}
            </div>
          ))}
          {loading && <div className="typing-indicator">AI is typing...</div>}
        </div>
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="message-input"
            required
          />
          <button type="submit" disabled={loading} className="send-button">
            {loading ? "..." : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
