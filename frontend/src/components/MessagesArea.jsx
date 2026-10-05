import { useEffect, useRef } from 'react';

const MessagesArea = ({ messages, currentUser, isLoading, error, onRetry }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="messages-area">
        <div className="messages-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-area">
        <div className="messages-empty">
          <div className="empty-icon error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="error-text">{error}</p>
          {onRetry && (
            <button type="button" className="btn-retry" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="messages-area">
        <div className="messages-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>No messages yet</h3>
          <p>Be the first to say something!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-area">
      <div className="messages-list">
        {messages.map((msg) => {
          const isOwn = msg.username === currentUser;
          return (
            <div key={msg._id || msg.createdAt} className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
              {!isOwn && (
                <div className="message-avatar">
                  {msg.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="message-content">
                {!isOwn && <span className="message-username">{msg.username}</span>}
                <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                  <p className="message-text">{msg.text}</p>
                </div>
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesArea;
