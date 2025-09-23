import { useState } from "react";
import useTweetStore from "../../store/tweetStore";

const TweetForm = () => {
  const [content, setContent] = useState("");
  const { addTweet } = useTweetStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    addTweet({ content });
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded-lg resize-none"
        rows={3}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tweet
      </button>
    </form>
  );
};

export default TweetForm;
