import { useEffect, useRef, useState } from 'react';
import './MessageList.css';

const EMOJI_MAP = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  sad: '😢',
  angry: '😡',
};

const ReactionPicker = ({ onSelect, onClose }) => (
  <div className="reaction-picker">
    {Object.entries(EMOJI_MAP).map(([key, emoji]) => (
      <button
        key={key}
        className="reaction-picker-btn"
        onClick={() => { onSelect(key); onClose(); }}
        title={key}
      >
        {emoji}
      </button>
    ))}
  </div>
);

const MessageList = ({
  messages,
  currentUser,
  loading,
  error,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) => {
  const bottomRef = useRef(null);
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuMsgId(null);
        setReactionPickerMsgId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditSubmit = (msgId) => {
    if (editText.trim()) {
      onEdit(msgId, editText);
    }
    setEditingId(null);
    setEditText('');
  };

  const getReactionsSummary = (reactions) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;
    const counts = {};
    Object.values(reactions).forEach((emoji) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
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
        const reactionsSummary = getReactionsSummary(msg.reactions);
        const myReaction = msg.reactions?.[currentUser];

        return (
          <div key={msg._id || index} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
            <div className="message-bubble">
              {!isOwn && <span className="message-username">{msg.username}</span>}

              {msg.replyTo && (
                <div className="reply-quote">
                  <span className="reply-quote-user">{msg.replyTo.username}</span>
                  <span className="reply-quote-text">
                    {msg.replyTo.type === 'image' ? '📷 Image' : msg.replyTo.text?.substring(0, 60)}
                  </span>
                </div>
              )}

              {msg.deleted ? (
                <p className="message-text deleted-text">This message was deleted</p>
              ) : (
                <>
                  {msg.type === 'image' && msg.imageUrl && (
                    <img src={msg.imageUrl} alt="shared" className="message-image" />
                  )}
                  {editingId === msg._id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSubmit(msg._id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="edit-save" onClick={() => handleEditSubmit(msg._id)}>Save</button>
                        <button className="edit-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    msg.text && <p className="message-text">{msg.text}</p>
                  )}
                </>
              )}

              {!msg.deleted && (
                <span className="message-time">
                  {formatTime(msg.createdAt)}
                  {msg.edited && <span className="edited-badge"> (edited)</span>}
                </span>
              )}

              {reactionsSummary && (
                <div className="reactions-row">
                  {Object.entries(reactionsSummary).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className={`reaction-badge ${myReaction === emoji ? 'reaction-active' : ''}`}
                      onClick={() => onReact(msg._id, emoji)}
                    >
                      {EMOJI_MAP[emoji]} {count > 1 && count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!msg.deleted && (
              <div className="message-actions-wrapper" ref={menuMsgId === msg._id ? menuRef : null}>
                <button
                  className="message-actions-btn"
                  onClick={() => {
                    setMenuMsgId(menuMsgId === msg._id ? null : msg._id);
                    setReactionPickerMsgId(null);
                  }}
                  aria-label="Message actions"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>

                {menuMsgId === msg._id && (
                  <div className="message-menu">
                    <button
                      className="menu-item"
                      onClick={() => {
                        onReply(msg);
                        setMenuMsgId(null);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                      </svg>
                      Reply
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setReactionPickerMsgId(reactionPickerMsgId === msg._id ? null : msg._id);
                        setMenuMsgId(null);
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>😀</span>
                      React
                    </button>
                    {isOwn && (
                      <>
                        <button
                          className="menu-item"
                          onClick={() => {
                            setEditingId(msg._id);
                            setEditText(msg.text);
                            setMenuMsgId(null);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="menu-item menu-item-danger"
                          onClick={() => {
                            onDelete(msg._id);
                            setMenuMsgId(null);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}

                {reactionPickerMsgId === msg._id && (
                  <ReactionPicker
                    onSelect={(emoji) => onReact(msg._id, emoji)}
                    onClose={() => setReactionPickerMsgId(null)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
