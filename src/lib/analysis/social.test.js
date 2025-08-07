import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeSocial } from './social.js';

const createMockWindow = (html) => {
  const dom = new JSDOM(html);
  return dom.window;
};

describe('analyzeSocial', () => {
  it('should extract Open Graph and Twitter tags', () => {
    const mockWindow = createMockWindow(`
      <meta property="og:title" content="OG Title">
      <meta property="og:description" content="OG Description">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Twitter Title">
    `);
    const result = analyzeSocial(mockWindow.document);

    expect(result.openGraph['og:title']).toBe('OG Title');
    expect(result.openGraph['og:description']).toBe('OG Description');
    expect(result.twitter['twitter:card']).toBe('summary_large_image');
    expect(result.twitter['twitter:title']).toBe('Twitter Title');
  });

  it('should return empty objects if no social tags are found', () => {
    const mockWindow = createMockWindow('<p>No social tags here.</p>');
    const result = analyzeSocial(mockWindow.document);

    expect(result.openGraph).toEqual({});
    expect(result.twitter).toEqual({});
  });

  it('should handle tags with empty content attributes', () => {
    const mockWindow = createMockWindow(`
      <meta property="og:title" content="">
      <meta name="twitter:card" content="summary">
    `);
    const result = analyzeSocial(mockWindow.document);

    expect(result.openGraph['og:title']).toBe('');
    expect(result.twitter['twitter:card']).toBe('summary');
  });
});
