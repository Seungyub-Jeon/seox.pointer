import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeLinks } from './links.js';

const createMockWindow = (html, url = 'https://example.com') => {
  const dom = new JSDOM(html, { url });
  return dom.window;
};

describe('analyzeLinks', () => {
  it('should correctly classify internal and external links', () => {
    const mockWindow = createMockWindow(`
      <a href="/internal-page">Internal</a>
      <a href="https://other-domain.com">External</a>
      <a href="https://example.com/another-page">Internal (Absolute)</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.internal).toBe(2);
    expect(result.counts.external).toBe(1);
    expect(result.total).toBe(3);
  });

  it('should detect broken links', () => {
    const mockWindow = createMockWindow(`
      <a>No href</a>
      <a href="">Empty href</a>
      <a href="#">Anchor href</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.broken).toBe(3);
    expect(result.issues.broken[0].text).toBe('No href');
  });

  it('should detect insecure target="_blank" links', () => {
    const mockWindow = createMockWindow(`
      <a href="/secure" target="_blank" rel="noopener">Secure</a>
      <a href="/insecure" target="_blank">Insecure</a>
      <a href="/insecure-noreferrer" target="_blank" rel="noreferrer">Insecure</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.insecure).toBe(2);
    expect(result.issues.insecure[0].href).toBe('/insecure');
  });

  it('should detect generic link text', () => {
    const mockWindow = createMockWindow(`
      <a href="/page1">Click Here</a>
      <a href="/page2">read more</a>
      <a href="/page3">Specific Text</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.genericText).toBe(2);
    expect(result.issues.genericText[0].text).toBe('Click Here');
  });

  it('should handle special links like mailto and tel', () => {
    const mockWindow = createMockWindow(`
      <a href="mailto:test@example.com">Email</a>
      <a href="tel:+123456789">Call</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.external).toBe(2);
    expect(result.external[0].type).toBe('special');
  });

  it('should handle a mix of all link types and issues', () => {
    const mockWindow = createMockWindow(`
      <a href="/internal">Internal</a>
      <a href="https://google.com" target="_blank">Insecure External</a>
      <a href="#">Broken</a>
      <a href="/generic">Click Here</a>
    `);
    const result = analyzeLinks(mockWindow);
    expect(result.counts.total).toBe(4);
    expect(result.counts.internal).toBe(2); // /internal and /generic
    expect(result.counts.external).toBe(1);
    expect(result.counts.broken).toBe(1);
    expect(result.counts.insecure).toBe(1);
    expect(result.counts.genericText).toBe(1);
  });
});
