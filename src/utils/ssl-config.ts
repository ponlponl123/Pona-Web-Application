/**
 * Global SSL configuration for Node.js environment
 * Handles SSL certificate issues in containerized environments
 */

export function configureSSL() {
  // Only run in Node.js environment (server-side)
  if (typeof process === 'undefined' || typeof window !== 'undefined') {
    return;
  }

  // In production containerized environments, we need to handle SSL more gracefully
  if (process.env.NODE_ENV === 'production') {
    // Set up custom certificate paths if they exist
    if (
      process.env.SSL_CERT_FILE &&
      !process.env.SSL_CERT_FILE.includes('undefined')
    ) {
      process.env.NODE_EXTRA_CA_CERTS = process.env.SSL_CERT_FILE;
    }

    // Configure Node.js HTTPS global agent for better SSL handling
    try {
      // Dynamic import to avoid issues with bundlers
      const https = eval('require')('https');
      const originalCreateConnection = https.globalAgent.createConnection;

      https.globalAgent.createConnection = function (
        options: { host?: string; rejectUnauthorized?: boolean },
        callback: (err?: Error, socket?: unknown) => void
      ) {
        // For trusted domains, allow more flexible SSL handling
        const trustedDomains = [
          'img.youtube.com',
          'i.ytimg.com',
          'ytimg.com',
          'yt3.ggpht.com',
          'yt3.googleusercontent.com',
          'cdn.discordapp.com',
          'githubusercontent.com',
          'github.com',
        ];

        if (
          options.host &&
          trustedDomains.some(domain =>
            options.host!.toLowerCase().includes(domain)
          )
        ) {
          options.rejectUnauthorized = false;
        }

        return originalCreateConnection.call(this, options, callback);
      };

      // Set reasonable timeout values
      https.globalAgent.timeout = 15000;
      https.globalAgent.keepAlive = true;
      https.globalAgent.keepAliveMsecs = 1000;
    } catch (error) {
      // Silently ignore if HTTPS module is not available
      console.warn('Could not configure HTTPS global agent:', error);
    }
  }
}

// Auto-configure SSL when this module is imported
configureSSL();
