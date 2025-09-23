import { useEffect } from "react";
import useTweetStore from "../../store/tweetStore";
import TweetCard from "./TweetCard";

const TweetList = () => {
  const { tweets, loadTweets, removeTweet } = useTweetStore();

  useEffect(() => {
    loadTweets();
  }, [loadTweets]);

  return (
    <div className="mt-4">
      {tweets.length === 0 ? (
        <p className="text-center text-gray-500">No tweets yet.</p>
      ) : (
        tweets.map((tweet) => (
          <TweetCard key={tweet._id} tweet={tweet} onDelete={removeTweet} />
        ))
      )}
    </div>
  );
};

export default TweetList;
