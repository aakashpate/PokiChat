import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, isConfigured, configError } from '../services/config';
import { CONNECTION_ERROR_MESSAGE } from '../services/api';

export const useSocket = (username) => {
  const socketRef = useRef(null);
  const usernameRef = useRef(username);
  const hasConnectedRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [messageError, setMessageError] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [messages, setMessages] = useState([]);

  usernameRef.current = username;

  const joinChat = useCallback((socket) => {
    const name = usernameRef.current;
    if (socket && name) {
      socket.emit('join_chat', name);
    }
  }, []);

  const connect = useCallback(() => {
    if (!isConfigured) {
      setConnectionError(configError || CONNECTION_ERROR_MESSAGE);
      return;
    }

    if (socketRef.current) {
      if (socketRef.current.connected) {
        joinChat(socketRef.current);
      }
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);

      if (hasConnectedRef.current) {
        setReconnectCount((count) => count + 1);
      }
      hasConnectedRef.current = true;

      joinChat(socket);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setTypingUsers(new Set());
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(CONNECTION_ERROR_MESSAGE);
    });

    socket.on('reconnect_attempt', () => {
      setIsConnecting(true);
    });

    socket.on('reconnect_failed', () => {
      setIsConnecting(false);
      setConnectionError(CONNECTION_ERROR_MESSAGE);
    });

    socket.on('online_users', (count) => {
      setOnlineUsers(count);
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => {
        if (message?._id && prev.some((item) => item._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
      setMessageError(null);
    });

    socket.on('typing_start', ({ username: user }) => {
      setTypingUsers((prev) => new Set([...prev, user]));
    });

    socket.on('typing_stop', ({ username: user }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(user);
        return next;
      });
    });

    socket.on('reaction_toggled', ({ _id, reactions }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item._id === _id ? { ...item, reactions: reactions || {} } : item
        )
      );
      setMessageError(null);
    });

    socket.on('message_error', ({ message }) => {
      setMessageError(message || CONNECTION_ERROR_MESSAGE);
    });
  }, [joinChat]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    hasConnectedRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    setMessageError(null);
    setTypingUsers(new Set());
    setOnlineUsers(0);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback(
    (text, extra = {}) => {
      const socket = socketRef.current;

      if (!socket || !socket.connected || !usernameRef.current) {
        setMessageError(CONNECTION_ERROR_MESSAGE);
        return false;
      }

      setMessageError(null);
      socket.emit('send_message', {
        username: usernameRef.current,
        text,
        ...extra,
      });
      return true;
    },
    []
  );

  const toggleReaction = useCallback((messageId, emoji) => {
    const socket = socketRef.current;

    if (!socket || !socket.connected || !usernameRef.current) {
      setMessageError(CONNECTION_ERROR_MESSAGE);
      return false;
    }

    setMessageError(null);
    socket.emit('toggle_reaction', {
      messageId,
      username: usernameRef.current,
      emoji,
    });
    return true;
  }, []);

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start');
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop');
    }
  }, []);

  const clearMessageError = useCallback(() => setMessageError(null), []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      if (message?._id && prev.some((item) => item._id === message._id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const setInitialMessages = useCallback((msgs) => {
    setMessages(Array.isArray(msgs) ? msgs : []);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    messageError,
    reconnectCount,
    onlineUsers,
    typingUsers,
    messages,
    connect,
    disconnect,
    retry,
    sendMessage,
    toggleReaction,
    startTyping,
    stopTyping,
    addMessage,
    clearMessageError,
    setInitialMessages,
  };
};
