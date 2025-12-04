export default function Header({ toggle }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={toggle}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
        <h1 className="font-semibold text-lg">Victory GP Portal</h1>
      </div>
    </header>
  );
}