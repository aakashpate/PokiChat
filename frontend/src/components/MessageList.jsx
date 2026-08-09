import { useEffect, useRef } from 'react';
import './MessageList.css';

const MessageList = ({ messages, currentUser, loading, error }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <div className="empty-icon loading-spinner" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-list-empty">
        <div className="empty-state error-state">
          <div className="empty-icon error-icon">!</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <div className="empty-icon chat-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="empty-title">No messages yet</p>
          <p className="empty-subtitle">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isOwn = msg.username === currentUser;
        return (
          <div
            key={msg._id || index}
            className={`message-wrapper ${isOwn ? 'own' : 'other'}`}
          >
            <div className="message-bubble">
              {!isOwn && <span className="message-username">{msg.username}</span>}
              <p className="message-text">{msg.text}</p>
              <span className="message-time">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
