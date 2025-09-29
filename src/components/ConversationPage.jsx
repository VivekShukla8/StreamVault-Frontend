import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import SocketChatWindow from "./ChatWindow"

export default function ConversationPage() {
  const { conversationId } = useParams();
  const {currentUserId} = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with back button */}
      <div className=" bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              to="/messages/conversations"
              className="flex items-center text-white hover:text-blue-29 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              Back to Messages
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <SocketChatWindow conversationId={conversationId}/>
      </div>
    </div>
  );
}