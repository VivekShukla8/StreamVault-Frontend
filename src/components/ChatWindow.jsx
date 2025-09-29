// Enhanced SocketChatWindow with beautiful gradient UI
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../features/auth/AuthContext";
import {
  getConversationMessages,
  postConversationMessage,
} from "../api/messages";
import initSocket, { getSocket } from "../socket";
import { Send, Wifi, WifiOff, RotateCcw } from "lucide-react";

export default function SocketChatWindow({ conversationId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [socketReady, setSocketReady] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto init socket once
  useEffect(() => {
    try {
      initSocket(); // uses localStorage token if present
    } catch (err) {
      console.error("socket init failed:", err);
      setSocketError(err?.message || "Socket init failed");
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages and derive other participant from messages
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    const load = async () => {
      setLoadingMessages(true);
      try {
        const res = await getConversationMessages(conversationId);
        // backend wrapper uses statusCode
        const data = res?.data;
        if (data?.statusCode === 200) {
          const msgs = Array.isArray(data.data) ? data.data : [];
          if (!cancelled) {
            setMessages(msgs);
            // derive other participant: check most recent messages for a sender !== current user
            const other =
              msgs.find((m) => m.sender && String(m.sender._id) !== String(user._id))?.sender ||
              msgs.find((m) => m.recipient && String(m.recipient) !== String(user._id))?.recipient ||
              null;
            setOtherUser(other);
          }
        } else {
          console.warn("Unexpected messages response:", data);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId, user]);

  // Setup socket listeners for this conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    let socket;
    try {
      socket = getSocket();
    } catch (err) {
      console.error("Socket not ready:", err);
      setSocketError(err?.message || "Socket not initialized");
      setSocketReady(false);
      return;
    }

    setSocketError(null);

    // connection status
    if (socket.connected) {
      setSocketReady(true);
    } else {
      const onConnect = () => setSocketReady(true);
      const onConnectError = (err) => {
        console.error("socket connect_error:", err);
        setSocketError(err?.message || "Socket connect_error");
      };
      socket.on("connect", onConnect);
      socket.on("connect_error", onConnectError);
      // cleanup connection handlers later
    }

    // Join room
    try {
      socket.emit("join_conversation", conversationId);
    } catch (err) {
      console.error("emit join_conversation failed:", err);
    }

    // Handler for new messages
    const onNewMessage = (payload) => {
      // payload shape may be either: full message object, or { conversationId, message }
      let incoming = payload;
      if (payload && payload.message) incoming = payload.message;

      // If the incoming message belongs to this conversation, append
      if (!incoming) return;
      if (incoming.conversationId && String(incoming.conversationId) !== String(conversationId)) return;

      // CRITICAL FIX: Don't add messages from the current user (to avoid duplicates)
      const senderId = incoming?.sender?._id || incoming?.sender || incoming?.senderId;
      if (String(senderId) === String(user._id)) return;

      setMessages((prev) => {
        // avoid duplicates by _id / createdAt fallback
        const exists = prev.some((m) => (m._id && incoming._id && m._id === incoming._id) || (m.createdAt && incoming.createdAt && m.createdAt === incoming.createdAt));
        if (exists) return prev;
        return [...prev, incoming];
      });

      // derive otherUser if not set
      if (!otherUser && incoming.sender && String(incoming.sender._id) !== String(user._id)) {
        setOtherUser(incoming.sender);
      }
    };

    socket.on("new_message", onNewMessage);

    // cleanup
    return () => {
      try {
        socket.emit("leave_conversation", conversationId);
      } catch (e) {}
      socket.off("new_message", onNewMessage);
      // do not disconnect the global socket here (we initialized it globally)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user]); // otherUser intentionally omitted

  // send message: save via REST then emit
  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const optimistic = {
      _id: `temp-${Date.now()}`,
      conversationId,
      sender: { _id: user._id, username: user.username },
      content: trimmed,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
    setSending(true);

    try {
      const res = await postConversationMessage(conversationId, { content: trimmed });
      if (res?.data?.statusCode === 201 || res?.status === 201 || res?.data?.success) {
        const saved = res.data.data;
        // replace optimistic with saved (match by createdAt or temp id)
        setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));
        // emit to socket so others get it
        try {
          const s = getSocket();
          s.emit("send_message", saved);
        } catch (err) {
          console.warn("Could not emit send_message:", err);
        }
      } else {
        // fallback: use returned data if present
        const saved = res?.data?.data;
        if (saved) {
          setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));
          try { getSocket().emit("send_message", saved); } catch (e) {}
        } else {
          throw new Error("Message save failed");
        }
      }
    } catch (err) {
      console.error("Error saving message:", err);
      // remove optimistic
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      // restore input
      setNewMessage(trimmed);
      alert("Failed to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Allow retrying socket init
  const retryInitSocket = () => {
    try {
      initSocket();
      // small delay then try to get the socket
      setTimeout(() => {
        try {
          const s = getSocket();
          if (s.connected) setSocketReady(true);
          setSocketError(null);
        } catch (err) {
          console.error("retry getSocket failed:", err);
          setSocketError(err?.message || "Retry failed");
        }
      }, 300);
    } catch (err) {
      console.error("retry initSocket failed:", err);
      setSocketError(err?.message || "Retry failed");
    }
  };

  // Utility functions
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (ts) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateSeparator = (currentIndex) => {
    if (currentIndex === 0) return true; // Always show for first message
    
    const currentMsg = messages[currentIndex];
    const prevMsg = messages[currentIndex - 1];
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    
    return currentDate !== prevDate;
  };

  const getAvatarUrl = (userObj, fallbackName) => {
    if (userObj?.avatar) return userObj.avatar;
    const name = userObj?.username || userObj?.name || fallbackName || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=40`;
  };

  const shouldShowAvatar = (currentIndex) => {
    if (currentIndex === messages.length - 1) return true; // Always show for last message
    
    const currentMsg = messages[currentIndex];
    const nextMsg = messages[currentIndex + 1];
    
    if (!nextMsg) return true;
    
    const currentSender = currentMsg?.sender?._id || currentMsg?.sender || currentMsg?.senderId;
    const nextSender = nextMsg?.sender?._id || nextMsg?.sender || nextMsg?.senderId;
    
    return String(currentSender) !== String(nextSender);
  };

  const getMessageMargin = (currentIndex) => {
    if (currentIndex === 0) return "mt-0"; // First message
    
    const currentMsg = messages[currentIndex];
    const prevMsg = messages[currentIndex - 1];
    
    const currentSender = currentMsg?.sender?._id || currentMsg?.sender || currentMsg?.senderId;
    const prevSender = prevMsg?.sender?._id || prevMsg?.sender || prevMsg?.senderId;
    
    return String(currentSender) === String(prevSender) ? "mt-1" : "mt-4";
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-gray-100 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-700/10 to-slate-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-700/10 to-gray-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header with Gradient */}
      <div className="flex items-center p-4 border-b border-white/5 bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-black/95 backdrop-blur-xl shadow-2xl relative z-10 mt-12">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/5 to-slate-600/5"></div>
        
        {otherUser ? (
          <div 
            className="flex items-center flex-1 cursor-pointer hover:bg-gradient-to-r hover:from-white/3 hover:to-slate-600/8 rounded-xl p-3 -m-1 transition-all duration-300 group relative z-10"
            onClick={() => navigate(`/channel/${otherUser._id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <img
                src={getAvatarUrl(otherUser)}
                alt={otherUser.username || "User"}
                className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-600/50 group-hover:border-slate-500 shadow-lg relative z-10 transition-all duration-300"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-gray-200 group-hover:to-slate-300 transition-all duration-300">
                {otherUser.username || "User"}
              </h2>
              <p className="text-sm font-medium bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                Active now
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-slate-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative z-10">
            <h2 className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Conversation
            </h2>
            <p className="text-sm text-slate-400">Loading participant...</p>
          </div>
        )}

        {/* Enhanced connection status with gradients */}
        <div className="flex items-center space-x-2 relative z-10">
          {socketReady ? (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Live</span>
            </div>
          ) : socketError ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full border border-red-400/30">
                <WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Disconnected</span>
              </div>
              <button
                onClick={retryInitSocket}
                className="flex items-center space-x-1 text-sm px-3 py-1 bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-600 hover:to-slate-600 rounded-full transition-all duration-300 border border-gray-600/30"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-400/30">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Messages Container with Glass Effect */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 relative z-10">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-white/3 to-gray-700/8 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
              <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="font-medium bg-gradient-to-r from-gray-300 to-slate-400 bg-clip-text text-transparent">
                Loading messages...
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-8 bg-gradient-to-br from-white/3 to-gray-700/8 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Send className="h-10 w-10 text-white" />
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                No messages yet
              </p>
              <p className="text-slate-400">Start the conversation with a friendly message!</p>
            </div>
          </div>
        ) : null}

        {messages.map((msg, index) => {
          const senderId = msg?.sender?._id || msg?.sender || msg?.senderId;
          const isCurrentUser = String(senderId) === String(user._id);
          const showAvatar = shouldShowAvatar(index);
          const messageMargin = getMessageMargin(index);
          const senderInfo = isCurrentUser ? user : (msg.sender || otherUser);
          const showDateSeparator = shouldShowDateSeparator(index);

          return (
            <div key={msg._id || msg.createdAt}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-6">
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
                  <div className="px-4 py-2 mx-4 bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-sm rounded-full border border-gray-600/20 shadow-lg">
                    <span className="text-xs font-medium bg-gradient-to-r from-gray-300 to-slate-400 bg-clip-text text-transparent">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
                </div>
              )}

              {/* Message */}
              <div
                className={`flex items-end space-x-3 ${messageMargin} ${
                  isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {/* Enhanced Avatar with Gradient Ring */}
                <div className="flex-shrink-0 w-10 h-10">
                  {showAvatar && senderInfo ? (
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full p-0.5 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-gray-600 to-slate-600' 
                          : 'bg-gradient-to-r from-slate-600 to-gray-700'
                      }`}>
                        <img
                          src={getAvatarUrl(senderInfo)}
                          alt={senderInfo.username || "User"}
                          className="w-full h-full rounded-full object-cover bg-slate-800"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Enhanced Message Bubble with Gradients */}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl backdrop-blur-sm border ${
                      isCurrentUser
                        ? "bg-gradient-to-br from-gray-700/90 to-slate-700/90 text-white rounded-br-md border-gray-600/30 shadow-gray-600/25"
                        : "bg-gradient-to-br from-slate-800/90 to-gray-800/90 text-slate-100 rounded-bl-md border-slate-600/30 shadow-slate-600/25"
                    } ${msg.isOptimistic ? "opacity-70 scale-95" : "scale-100"}`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      <p className={`text-xs font-medium ${
                        isCurrentUser ? "text-gray-300" : "text-slate-400"
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                      {msg.isOptimistic && (
                        <div className="flex items-center space-x-1 ml-3">
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-60"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-40 delay-150"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-20 delay-300"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area with Gradient */}
      <div className="p-6 border-t border-white/5 bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-black/95 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/3 to-slate-600/3"></div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-slate-600/10 rounded-full blur opacity-50"></div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-800/80 to-slate-800/80 text-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500/50 border border-gray-700/30 placeholder-slate-400 transition-all duration-300 backdrop-blur-sm relative z-10 font-medium"
              disabled={!socketReady}
            />
            {!socketReady && (
              <div className="absolute inset-0 bg-slate-900/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm text-slate-400 font-medium">Disconnected</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !socketReady}
            className="p-4 bg-gradient-to-r from-gray-600 to-slate-700 rounded-full hover:from-gray-700 hover:to-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-110 disabled:transform-none disabled:hover:scale-100 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            {sending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
            ) : (
              <Send className="h-6 w-6 text-white relative z-10 transform group-hover:translate-x-0.5 transition-transform duration-300" />
            )}
          </button>
        </div>
        
        {!socketReady && (
          <div className="mt-4 text-center relative z-10">
            <p className="text-sm bg-gradient-to-r from-slate-400 to-gray-500 bg-clip-text text-transparent font-medium">
              Reconnecting to enable messaging...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}