export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm sm:flex-row sm:items-center">
        <p className="text-paper/70">PeerMock — practice interviews, hosted by peers.</p>
        <div className="flex items-center gap-4">
          <span className="font-medium">Atul Kumar Srivastav</span>
          <a
            href="https://github.com/YOUR_GITHUB_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/70 hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/70 hover:text-white"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
