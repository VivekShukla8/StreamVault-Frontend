import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationsList from "../components/ConversationsList";
import MessageRequests from "../components/MessageRequestsPanel";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("conversations"); // "conversations" | "requests"
  const navigate = useNavigate();

  const handleSelectConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "conversations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Message Requests
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "conversations" ? (
          <div className="h-full flex">
            <ConversationsList onSelect={handleSelectConversation} />
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-blue-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-blue-200">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm text-blue-400">
                  Choose a conversation from the sidebar to start messaging.
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