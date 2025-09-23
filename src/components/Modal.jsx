export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow max-w-lg w-full">
        <button className="float-right" onClick={onClose}>✕</button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}
