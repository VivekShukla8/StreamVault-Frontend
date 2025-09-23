import React from "react";
import Avatar from "../../components/Avatar";

export default function CommentList({ comments = [] }) {
  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c._id} className="flex gap-3">
          <Avatar src={c.owner?.avatar} />
          <div>
            <div className="font-semibold">{c.owner?.username}</div>
            <div className="text-sm">{c.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
