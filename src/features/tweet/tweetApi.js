import api from "../../api/axios";

// create a tweet
export const createTweet = async (data) => {
  const res = await api.post("/tweets", data);
  return res.data;
};

// get all tweets
export const fetchTweets = async () => {
  const res = await api.get("/tweets");
  return res.data;
};

// delete a tweet
export const deleteTweet = async (tweetId) => {
  const res = await api.delete(`/tweets/${tweetId}`);
  return res.data;
};
