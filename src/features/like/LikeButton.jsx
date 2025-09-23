import React, { useState } from "react";

export default function LikeButton({ videoId, initial = false, onToggle }) {
  const [liked, setLiked] = useState(initial);
  const toggle = async () => {
    setLiked((s) => !s);
    onToggle?.(!liked);
  };
  return (
    <button onClick={toggle} className="px-2 py-1 border rounded">
      {liked ? "Liked" : "Like"}
    </button>
  );
}
