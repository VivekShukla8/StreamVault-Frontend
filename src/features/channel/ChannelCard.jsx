import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";

export default function ChannelCard({ channel }) {
  if (!channel) return null;
  return (
    <Link to={`/channel/${channel._id}`} className="flex items-center gap-3">
      <Avatar src={channel.avatar} />
      <div>
        <div className="font-semibold">{channel.username}</div>
        <div className="text-xs text-gray-500">{channel.fullname}</div>
      </div>
    </Link>
  );
}
