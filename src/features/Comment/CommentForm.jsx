import React, { useState } from "react";

export default function CommentForm({ onSubmit }) {
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ content: text });
    setText("");
  };
  return (
    <form onSubmit={submit} className="flex gap-2 mt-2">
      <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 border p-2" placeholder="Add a comment..." />
      <button className="px-3 py-2 bg-blue-600 text-white rounded">Post</button>
    </form>
  );
}
