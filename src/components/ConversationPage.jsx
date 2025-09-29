import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import SocketChatWindow from "./ChatWindow"

export default function ConversationPage() {
  const { conversationId } = useParams();
  const {currentUserId} = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header with back button */}
      <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl shadow-lg border-b border-gray-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              to="/messages/conversations"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-900/40 hover:bg-gray-900/60 rounded-lg transition-all duration-300 border border-gray-800/50 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform duration-300" />
              <span className="font-medium">Back to Messages</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden relative z-10">
        <SocketChatWindow conversationId={conversationId}/>
      </div>
    </div>
  );
}