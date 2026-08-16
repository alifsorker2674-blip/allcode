// Runs once when the Next.js server starts (before any request is handled).
// On Windows, Node's fetch() can take several seconds (sometimes hangs) to
// connect to "localhost"/127.0.0.1 because it tries IPv6 first and falls
// back to IPv4 only after a timeout. Forcing IPv4-first DNS resolution here
// fixes the slow/hanging API calls from server components (Navbar, etc).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}
