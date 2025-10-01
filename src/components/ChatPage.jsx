import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationsList from "../components/ConversationsList";
import MessageRequests from "../components/MessageRequestsPanel";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("conversations");
  const navigate = useNavigate();

  const handleSelectConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text">
                Messages
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === "conversations"
                  ? "border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
                <span className="hidden xs:inline">Conversations</span>
                <span className="xs:hidden">Chats</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span className="hidden xs:inline">Message Requests</span>
                <span className="xs:hidden">Requests</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {activeTab === "conversations" ? (
          <div className="h-full flex flex-col sm:flex-row">
            <ConversationsList onSelect={handleSelectConversation} />
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950/50 to-gray-900/30 backdrop-blur-sm">
              <div className="text-center p-4 sm:p-6 md:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg hover:shadow-blue-600/20 transition-all duration-300">
                  <svg
                    className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-1.5 sm:mb-2 px-3">
                  Select a conversation
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto px-3">
                  Choose a conversation from the {activeTab === "conversations" ? "list" : "sidebar"} to start messaging.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <MessageRequests />
        )}
      </div>
    </div>
  );
}