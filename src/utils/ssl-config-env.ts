/**
 * SSL Environment Configuration
 * Provides centralized SSL configuration for the application
 */

export interface SSLConfig {
  rejectUnauthorized: boolean;
  trustedDomains: string[];
  fallbackToHTTP: boolean;
  timeout: number;
}

export function getSSLConfig(): SSLConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // In development, be more permissive with SSL
    // In production, be strict but allow fallbacks for trusted domains
    rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',

    trustedDomains: [
      'img.youtube.com',
      'i.ytimg.com',
      'ytimg.com',
      'yt3.ggpht.com',
      'yt3.googleusercontent.com',
      'cdn.discordapp.com',
      'githubusercontent.com',
      'github.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],

    // Allow HTTP fallback for YouTube domains in production containers
    fallbackToHTTP: isProduction,

    timeout: parseInt(process.env.SSL_TIMEOUT || '15000', 10),
  };
}

export function isSSLError(error: Error): boolean {
  const sslErrorMessages = [
    'certificate',
    'SSL',
    'TLS',
    'unable to get issuer certificate',
    'self signed certificate',
    'CERT_UNTRUSTED',
    'UNABLE_TO_GET_ISSUER_CERT',
    'CERT_AUTHORITY_INVALID',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
  ];

  return sslErrorMessages.some(msg =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

export function isTrustedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const config = getSSLConfig();
    return config.trustedDomains.some(domain =>
      urlObj.hostname.toLowerCase().includes(domain.toLowerCase())
    );
  } catch {
    return false;
  }
}
