/* eslint-disable react/prop-types */
import { X } from "lucide-react";

const TweetCard = ({ tweet, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow mb-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {tweet.owner?.username}
        </h4>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => onDelete(tweet._id)}
        >
          <X size={18} />
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mt-2">{tweet.content}</p>
      <span className="text-xs text-gray-500">
        {new Date(tweet.createdAt).toLocaleString()}
      </span>
    </div>
  );
};

export default TweetCard;
