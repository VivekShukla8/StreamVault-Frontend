export default function Avatar({ src, alt = "avatar", size = 40 }) {
  return (
    <img
      src={src || "/vite.svg"}
      alt={alt}
      style={{ width: size, height: size }}
      className="rounded-full object-contain bg-gray-700"
    />
  );
}
