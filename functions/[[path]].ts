/* eslint-disable */

// @ts-ignore
import { render } from '../server/entry.server.js';

export const onRequestGet: PagesFunction = async (req) => {
  // Handle static assets
  if (/\.\w+$/.test(req.request.url)) {
    return req.next(req.request);
  }

  // Generate SSR response
  const ssrResult = await render({
    url: new URL(req.request.url),
    base: '/build/',
  });

  const response = new Response(ssrResult.html, {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `no-cache, max-age=0`,
    },
  });

  return response;
};
