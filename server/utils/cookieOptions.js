// Centralized cookie options so that whatever generateToken() uses to SET
// the cookie is guaranteed to match what logoutUser() uses to CLEAR it.
// Mismatched options (secure/sameSite/path) are a common reason "logout"
// doesn't actually remove the cookie in some browsers.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only sent over HTTPS in prod
  sameSite: 'strict', // adjust to 'lax' if you need cross-site top-level navigation
  path: '/'
};