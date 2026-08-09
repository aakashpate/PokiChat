import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import { getMessages } from '../services/api';

const useChat = (username) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!username) return;

    const socket = connectSocket(username);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', () => {
      setConnectionStatus('connecting');
    });

    socket.on('online_users', (count) => {
      setOnlineUsers(count);
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing_start', ({ username: user }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(user)) return [...prev, user];
        return prev;
      });
    });

    socket.on('typing_stop', ({ username: user }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [username]);

  const sendMessage = useCallback((text) => {
    const socket = getSocket();
    if (!socket?.connected || !text.trim()) return;

    socket.emit('send_message', { username, text: text.trim() });
  }, [username]);

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit('typing_start');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop');
    }, 2000);
  }, []);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit('typing_stop');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  return {
    messages,
    onlineUsers,
    connectionStatus,
    typingUsers,
    loading,
    error,
    sendMessage,
    startTyping,
    stopTyping,
  };
};

export default useChat;
