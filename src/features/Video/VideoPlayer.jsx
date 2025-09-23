export default function VideoPlayer({ src, title }) {
  return (
    <div>
      <video controls className="w-full max-h-[640px] bg-black">
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      <h2 className="text-xl font-semibold mt-2">{title}</h2>
    </div>
  );
}
