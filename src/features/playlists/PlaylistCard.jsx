import { Link } from "react-router-dom";

export default function PlaylistCard({ playlist }) {
  return (
    <Link to={`/playlist/${playlist._id}`} className="block p-2 border rounded">
      <h4 className="font-bold">{playlist.name}</h4>
      <p className="text-sm text-gray-500">{playlist.videos?.length || 0} videos</p>
    </Link>
  );
}
