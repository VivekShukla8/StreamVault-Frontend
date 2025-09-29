import React, { useState, useContext, useEffect } from "react";
import {
  createMessageRequest,
  checkMessageRequest,
} from "../api/messages";
import { AuthContext } from "../features/auth/AuthContext";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

export default function MessageButton({ receiverId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("none"); // "none" | "pending" | "accepted"
  const [conversationId, setConversationId] = useState(null);

  // ✅ Fetch request status from backend when component mounts
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || !receiverId) return;

      try {
        const res = await checkMessageRequest(receiverId);
        console.log("Status check response:", res);

        setStatus(res.status || "none");
        if (res.conversationId) {
          setConversationId(res.conversationId);
        }
      } catch (err) {
        console.error("Error checking message request:", err);
        setStatus("none"); // Default to none on error
      }
    };

    fetchStatus();
  }, [receiverId, user]);

  // ✅ Open modal / redirect logic
  const openModal = () => {
    if (!user) {
      setToastType("error");
      setToastMessage("Login to message the creator");
      return;
    }

    if (status === "accepted") {
      // Redirect to chat page
      if (conversationId) {
        navigate(`/messages/conversations/${conversationId}`);
      } else {
        setToastType("error");
        setToastMessage("Conversation not found");
      }
      return;
    }

    if (status === "pending") {
      setToastType("info");
      setToastMessage("Message request already pending");
      return;
    }

    // status === 'none' -> open modal
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setMessage("");
  };

  // ✅ Send new request
  const sendRequest = async () => {
    if (!message.trim()) {
      setToastType("error");
      setToastMessage("Message cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await createMessageRequest(receiverId, message);
      console.log("Create request response:", res);

      // Success → treat as pending
      setStatus("pending");
      setToastType("success");
      setToastMessage("Message request sent successfully");
      closeModal();
    } catch (err) {
      console.error("Error sending request:", err);

      const backendMsg = err?.response?.data?.message;

      if (backendMsg === "Request already sent") {
        setStatus("pending");
        setToastType("info");
        setToastMessage("Message request already sent");
        closeModal();
      } else if (backendMsg === "Conversation already exists") {
        setStatus("accepted");
        setToastType("info");
        setToastMessage("Chat already exists — opening chat");
        closeModal();

        if (conversationId) {
          navigate(`/messages/conversations/${conversationId}`);
        }
      } else if (backendMsg === "Too many requests to this user. Try later.") {
        setToastType("error");
        setToastMessage("Too many requests to this user. Try later.");
        closeModal();
      } else {
        setToastType("error");
        setToastMessage(backendMsg || "Failed to send request");
        // Don't close modal so user can retry
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Button config based on status
  const getButtonConfig = () => {
    switch (status) {
      case "pending":
        return {
          text: "Request Pending",
          classes: "bg-yellow-500 text-white cursor-not-allowed",
          disabled: true,
        };
      case "accepted":
        return {
          text: "Go to Chat",
          classes: "bg-green-600 text-white hover:bg-green-700",
          disabled: false,
        };
      default: // "none"
        return {
          text: loading ? "Sending..." : "Message",
          classes: "bg-blue-500 text-white hover:bg-blue-600",
          disabled: loading,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      {/* ✅ Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* ✅ Main Button */}
      <button
        onClick={openModal}
        disabled={buttonConfig.disabled}
        className={`px-4 py-2 rounded-2xl transition font-medium ${buttonConfig.classes}`}
      >
        {buttonConfig.text}
      </button>

      {/* ✅ Modal */}
      {showModal && (
        <Modal onClose={closeModal} title="Send a Message" maxWidth="max-w-md">
          <textarea
            className="w-full p-4 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={closeModal}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-700/80 backdrop-blur-sm hover:bg-gray-600 text-white transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={sendRequest}
              disabled={loading || !message.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
