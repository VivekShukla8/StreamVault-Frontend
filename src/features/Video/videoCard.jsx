import { Link } from "react-router-dom";

export default function VideoCard({ video }) {
  return (
    <div className="rounded overflow-hidden">
      <Link to={`/video/${video._id}`}>
        <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-contain bg-gray-900" />
        <div className="p-2">
          <div className="font-semibold text-sm">{video.title}</div>
          <div className="text-xs text-gray-500">{video.views} views</div>
        </div>
      </Link>
    </div>
  );
}
