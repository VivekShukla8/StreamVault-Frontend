import React from "react";
import VideoCard from "./videoCard.jsx";

export default function VideoList({ videos }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {videos?.map((v) => <VideoCard key={v._id} video={v} />)}
    </div>
  );
}
