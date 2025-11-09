import { isSSLError, isTrustedDomain } from './ssl-config-env';

/**
 * Utility function to handle fetch requests with SSL fallback for trusted domains
 */

interface FetchWithFallbackOptions extends RequestInit {
  timeout?: number;
  ignoreSSLErrors?: boolean;
}

export async function fetchWithSSLFallback(
  url: string,
  options: FetchWithFallbackOptions = {}
): Promise<Response> {
  const { timeout = 15000, ignoreSSLErrors = false, ...fetchOptions } = options;

  const shouldTemporarilyRelaxSSL =
    typeof process !== 'undefined' && ignoreSSLErrors;
  const originalRejectUnauthorized = shouldTemporarilyRelaxSSL
    ? process.env.NODE_TLS_REJECT_UNAUTHORIZED
    : undefined;

  // Configure timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestOptions: RequestInit = {
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Pona-Image-Proxy/1.0)',
      Accept: 'image/*,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      ...fetchOptions.headers,
    },
  };

  // For Node.js environments, configure SSL options if ignoreSSLErrors is true
  if (shouldTemporarilyRelaxSSL) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const response = await fetch(url, requestOptions);
    return response;
  } catch (error) {
    // Check if this is an SSL certificate error
    if (error instanceof Error && isSSLError(error)) {
      console.warn(`SSL certificate issue for ${url}:`, error.message);

      const urlObj = new URL(url);

      // Strategy 1: Try with relaxed SSL for trusted domains
      if (isTrustedDomain(url)) {
        console.log(`Attempting SSL relaxed fetch for: ${url}`);
        const originalSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const relaxedController = new AbortController();
        const relaxedTimeoutId = setTimeout(
          () => relaxedController.abort(),
          timeout
        );

        try {
          const relaxedResponse = await fetch(url, {
            ...requestOptions,
            signal: relaxedController.signal,
          });

          console.log(`Successfully fetched with relaxed SSL: ${url}`);
          return relaxedResponse;
        } catch (relaxedError) {
          console.warn('Relaxed SSL fetch failed:', relaxedError);
        } finally {
          clearTimeout(relaxedTimeoutId);

          if (originalSetting === undefined) {
            delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
          } else {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalSetting;
          }
        }

        // Strategy 2: HTTP fallback for YouTube domains only
        if (
          urlObj.protocol === 'https:' &&
          (urlObj.hostname.includes('youtube.com') ||
            urlObj.hostname.includes('ytimg.com'))
        ) {
          try {
            const httpUrl = new URL(url);
            httpUrl.protocol = 'http:';

            const fallbackController = new AbortController();
            const fallbackTimeoutId = setTimeout(
              () => fallbackController.abort(),
              10000
            );

            const fallbackResponse = await fetch(httpUrl.toString(), {
              ...requestOptions,
              signal: fallbackController.signal,
            });

            clearTimeout(fallbackTimeoutId);
            console.log(
              `Successfully fetched via HTTP fallback: ${httpUrl.toString()}`
            );
            return fallbackResponse;
          } catch (fallbackError) {
            console.error('HTTP fallback failed:', fallbackError);
          }
        }
      }
    }

    // Reset SSL setting if it was modified
    throw error;
  } finally {
    clearTimeout(timeoutId);

    if (shouldTemporarilyRelaxSSL) {
      if (originalRejectUnauthorized === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
      }
    }
  }
}
