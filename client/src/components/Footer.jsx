function Footer() {
  return (
    <footer className="bg-buyko-surface border-t border-buyko-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand column */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-buyko-text">
            Buyko<span className="text-buyko-coral-from">.</span>
          </h2>
          <p className="text-sm text-buyko-text-dim leading-relaxed max-w-xs">
            Lorem ipsum is simply dummy text of the printing and typesetting
            industry. Lorem ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>
        </div>

        {/* Company links column */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide mb-4 text-buyko-text">
            COMPANY
          </h3>
          <ul className="space-y-2 text-sm text-buyko-text-dim">
            <li>
              <a href="/" className="hover:text-buyko-coral-from transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-buyko-coral-from transition-colors">
                About us
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-buyko-coral-from transition-colors">
                Delivery
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-buyko-coral-from transition-colors">
                Privacy policy
              </a>
            </li>
          </ul>
        </div>

        {/* Get in touch column */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide mb-4 text-buyko-text">
            GET IN TOUCH
          </h3>
          <ul className="space-y-2 text-sm text-buyko-text-dim">
            <li>+1-212-456-7890</li>
            <li>contact@buyko.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-buyko-border py-4">
        <p className="text-center text-xs text-buyko-text-dim">
          Copyright 2026 @ Buyko.com - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;