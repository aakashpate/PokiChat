import { useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '../services/api';

const EMOJI_MAP = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  sad: '😢',
  angry: '😡',
};

const MessagesArea = ({ messages, currentUser, isLoading, error, onRetry, onReact }) => {
  const messagesEndRef = useRef(null);
  const [pickerFor, setPickerFor] = useState(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReactionsSummary = (reactions) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;
    const counts = {};
    Object.values(reactions).forEach((emoji) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
  };

  const handleReact = (messageId, emojiKey) => {
    if (onReact) {
      onReact(messageId, emojiKey);
    }
    setPickerFor(null);
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
          const reactionsSummary = getReactionsSummary(msg.reactions);
          const myReaction = msg.reactions?.[currentUser];
          const isImage = msg.type === 'image' && msg.imageUrl;
          const key = msg._id || msg.createdAt;

          return (
            <div key={key} className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
              {!isOwn && (
                <div className="message-avatar">
                  {msg.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="message-content">
                {!isOwn && <span className="message-username">{msg.username}</span>}
                <div
                  className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'} ${
                    isImage && !msg.text ? 'bubble-image' : ''
                  }`}
                >
                  {isImage && (
                    <img
                      className="message-image"
                      src={resolveImageUrl(msg.imageUrl)}
                      alt="Shared attachment"
                      loading="lazy"
                    />
                  )}
                  {msg.text && <p className="message-text">{msg.text}</p>}
                </div>

                <div className="message-meta">
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                  {onReact && (
                    <div className="react-wrap" ref={pickerFor === key ? pickerRef : null}>
                      <button
                        type="button"
                        className="reaction-add-btn"
                        onClick={() => setPickerFor(pickerFor === key ? null : key)}
                        title="Add reaction"
                        aria-label="Add reaction"
                      >
                        😀
                      </button>
                      {pickerFor === key && (
                        <div className="reaction-picker">
                          {Object.entries(EMOJI_MAP).map(([emojiKey, emoji]) => (
                            <button
                              key={emojiKey}
                              type="button"
                              className="reaction-picker-btn"
                              onClick={() => handleReact(msg._id, emojiKey)}
                              title={emojiKey}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {reactionsSummary && (
                  <div className="reactions-row">
                    {Object.entries(reactionsSummary).map(([emojiKey, count]) => (
                      <button
                        key={emojiKey}
                        type="button"
                        className={`reaction-badge ${myReaction === emojiKey ? 'reaction-active' : ''}`}
                        onClick={() => handleReact(msg._id, emojiKey)}
                        title={emojiKey}
                      >
                        <span className="reaction-emoji">{EMOJI_MAP[emojiKey] || emojiKey}</span>
                        {count > 1 && <span className="reaction-count">{count}</span>}
                      </button>
                    ))}
                  </div>
                )}
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
