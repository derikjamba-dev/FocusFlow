export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-5xl font-bold mb-4">
          Welcome to <span className="text-accent">FocusFlow</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Production-ready productivity application
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-accent text-bg font-mono font-semibold rounded-lg"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
