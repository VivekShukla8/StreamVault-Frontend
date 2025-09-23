import API from "./axios";

// Tweet APIs
export const getAllTweets = (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortType) queryParams.append('sortType', params.sortType);
    if (params.userId) queryParams.append('userId', params.userId);
    
    return API.get(`/tweets?${queryParams.toString()}`);
};

export const createTweet = (data) => API.post("/tweets", data);

export const getUserTweets = (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    return API.get(`/tweets/user/${userId}?${queryParams.toString()}`);
};

export const updateTweet = (tweetId, data) => API.patch(`/tweets/${tweetId}`, data);

export const deleteTweet = (tweetId) => API.delete(`/tweets/${tweetId}`);

// Tweet interaction APIs
export const toggleTweetLike = (tweetId) => API.post(`/likes/tweet/${tweetId}/toggle`);