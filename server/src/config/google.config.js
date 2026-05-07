// ============================================
// google.config.js - Google OAuth Configuration
// ============================================

import { OAuth2Client } from 'google-auth-library';
import https from 'https';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // OAuth client setup (Express.js: OAuth Integration)

// Using async/await pattern (JS Essentials: Async/Await)
const verifyGoogleToken = async (token) => {
  try {
    // Attempt to verify as an ID Token first
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (idTokenError) {
      const userData = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'www.googleapis.com',
          path: '/oauth2/v3/userinfo',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            } else {
              reject(new Error(`Failed to fetch user info: ${res.statusCode} - ${data}`));
            }
          });
        });

        req.on('error', (e) => reject(e));
        req.end();
      });

      return {
        googleId: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      };
    }

  } catch (error) {
    const authError = new Error('Invalid Google token');
    authError.statusCode = 401; 
    throw authError;
  }
};

export { googleClient, verifyGoogleToken };
