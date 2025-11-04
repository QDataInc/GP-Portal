export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 text-sm text-gray-600 flex flex-col sm:flex-row justify-between">
        <p>© {new Date().getFullYear()} Victory GP Portal</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
