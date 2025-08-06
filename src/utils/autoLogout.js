// auth.js or useEffect in App.js / Main Component
import {jwtDecode} from "jwt-decode";

export function autoLogout(token, logoutCallback) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token already expired
      logoutCallback();
    } else {
      const timeout = (decoded.exp - currentTime) * 1000;

      // Set timer to logout user
      setTimeout(() => {
        logoutCallback();
      }, timeout);
    }
  } catch (error) {
    console.error("Invalid token:", error);
    logoutCallback(); // logout on invalid token
  }
}
