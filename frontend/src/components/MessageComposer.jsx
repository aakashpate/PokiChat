import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './MessageComposer.css';

const MessageComposer = ({
  onSend,
  onSendImage,
  onSendReply,
  onTyping,
  onStopTyping,
  disabled,
  replyTo,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    if (replyTo) {
      onSendReply(text, replyTo);
    } else {
      onSend(text);
    }
    setText('');
    onStopTyping();
    onCancelReply?.();
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (e.target.value.trim()) {
      onTyping();
    } else {
      onStopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onSendImage(file, replyTo);
      onCancelReply?.();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="composer-container">
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <span className="reply-bar-label">
              Replying to <strong>{replyTo.username}</strong>
            </span>
            <span className="reply-bar-text">
              {replyTo.type === 'image' ? '📷 Image' : replyTo.text?.substring(0, 50)}
            </span>
          </div>
          <button className="reply-bar-close" onClick={onCancelReply} aria-label="Cancel reply">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {showEmoji && (
        <div className="emoji-picker-container" ref={emojiRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            theme="light"
            searchPlaceholder="Search emoji..."
            skinTonesDisabled
          />
        </div>
      )}

      <form className="composer" onSubmit={handleSubmit}>
        <button
          type="button"
          className="composer-icon-btn"
          onClick={() => setShowEmoji((prev) => !prev)}
          disabled={disabled}
          aria-label="Emoji picker"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="button"
          className="composer-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          aria-label="Upload image"
        >
          {uploading ? (
            <div className="upload-spinner" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className="hidden-file-input"
        />

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="composer-input"
          maxLength={1000}
          aria-label="Message input"
        />

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="composer-button"
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
