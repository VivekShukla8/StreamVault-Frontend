import React, { useState } from 'react';
import Toast from './Toast';

export default function MessageModal({ isOpen, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      setToastType('error');
      setToastMessage('Message cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await onSend(message);
      setToastType('success');
      setToastMessage('Message sent successfully');
      setMessage('');
      onClose();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Send Message</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-gray-800/70 border border-gray-700/50 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
