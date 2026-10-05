import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { getFriendlyError } from '../services/api';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

const MessageComposer = ({ onSend, onSendImage, onTypingStart, onTypingStop, disabled }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTyping = () => {
    onTypingStart();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setUploadError(null);
    handleTyping();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    onSend(trimmed);
    setText('');
    setUploadError(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTypingStop();
    setIsSending(false);

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setUploadError(null);
    inputRef.current?.focus();
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    const caption = text.trim();

    try {
      await onSendImage(file, caption);
      if (caption) {
        setText('');
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        onTypingStop();
      }
    } catch (err) {
      setUploadError(err?.response ? getFriendlyError(err) : err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      inputRef.current?.focus();
    }
  };

  return (
    <div className="composer-shell">
      {showEmoji && (
        <div className="emoji-picker-wrap" ref={emojiRef}>
          <Suspense fallback={<div className="emoji-picker-loading">Loading emoji…</div>}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={380}
              theme="light"
              searchPlaceholder="Search emoji..."
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </Suspense>
        </div>
      )}

      {uploadError && (
        <p className="composer-error" role="alert">
          {uploadError}
        </p>
      )}

      <form className="message-composer" onSubmit={handleSubmit}>
        <button
          type="button"
          className="btn-icon"
          onClick={() => setShowEmoji((prev) => !prev)}
          disabled={disabled}
          title="Emoji"
          aria-label="Emoji picker"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="button"
          className="btn-icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          title="Send image"
          aria-label="Send image"
        >
          {uploading ? (
            <span className="upload-spinner"></span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          onChange={handleImageSelect}
          className="file-input-hidden"
        />

        <div className="composer-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Reconnecting to server...' : 'Type a message...'}
            maxLength={1000}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="btn-send"
          disabled={!text.trim() || isSending || disabled}
          title="Send message"
        >
          {isSending ? (
            <span className="sending-spinner"></span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
