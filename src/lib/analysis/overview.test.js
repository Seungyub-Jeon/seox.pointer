import { describe, it, expect } from 'vitest';
import { analyzeOverview } from './overview.js';

describe('analyzeOverview', () => {
  it('should analyze a document and return the correct overview data', () => {
    // 1. Setup - Create a mock window and document
    const mockDocument = {
      querySelector: (selector) => {
        if (selector === 'title') {
          return { textContent: '  Test Title  ' };
        }
        if (selector === 'meta[name="description"]') {
          return { getAttribute: () => 'Test Description.' };
        }
        if (selector === 'link[rel="canonical"]') {
          return { href: 'https://example.com/canonical' };
        }
        if (selector === 'meta[name="robots"]') {
          return { getAttribute: () => 'noindex, nofollow' };
        }
        if (selector === 'meta[name="keywords"]') {
            return { getAttribute: () => 'test, seo, analysis' };
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === 'link[rel="alternate"][hreflang]') {
            return [
                { getAttribute: (attr) => attr === 'hreflang' ? 'en' : 'https://example.com/en' },
                { getAttribute: (attr) => attr === 'hreflang' ? 'ko' : 'https://example.com/ko' },
            ];
        }
        // Mock element counts
        if (selector === 'h1') return { length: 1 };
        if (selector === 'h2') return { length: 2 };
        if (selector === 'h3') return { length: 3 };
        if (selector === 'h4') return { length: 4 };
        if (selector === 'h5') return { length: 5 };
        if (selector === 'h6') return { length: 6 };
        if (selector === 'img') return { length: 10 };
        if (selector === 'a') return { length: 25 };
        return [];
      },
      documentElement: {
        getAttribute: () => 'en-US',
      },
      body: {
        textContent: 'This is the body content with five words.',
      },
    };

    const mockWindow = {
      document: mockDocument,
      location: {
        href: 'https://example.com/test-page',
      },
    };

    // 2. Act - Run the analysis function
    const result = analyzeOverview(mockWindow);

    // 3. Assert - Check if the returned object is correct
    expect(result.title.text).toBe('Test Title');
    expect(result.title.length).toBe(10);

    expect(result.description.text).toBe('Test Description.');
    expect(result.description.length).toBe(17);

    expect(result.url.href).toBe('https://example.com/test-page');
    expect(result.url.isIndexable).toBe(false);
    expect(result.url.robotsContent).toBe('noindex, nofollow');

    expect(result.canonical.href).toBe('https://example.com/canonical');
    expect(result.canonical.isSelfReferencing).toBe(false);

    expect(result.meta.keywords).toBe('test, seo, analysis');
    expect(result.meta.lang).toBe('en-US');

    expect(result.content.wordCount).toBe(8);

    expect(result.hreflang).toHaveLength(2);
    expect(result.hreflang[0].lang).toBe('en');

    expect(result.elementCounts.h1).toBe(1);
    expect(result.elementCounts.h2).toBe(2);
    expect(result.elementCounts.img).toBe(10);
    expect(result.elementCounts.a).toBe(25);
  });

  it('should handle missing elements gracefully', () => {
    // 1. Setup - Mock a document with missing elements
    const mockDocument = {
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: {
        getAttribute: () => '',
      },
      body: {
        textContent: '',
      },
    };

    const mockWindow = {
      document: mockDocument,
      location: {
        href: 'https://example.com/empty-page',
      },
    };

    // 2. Act
    const result = analyzeOverview(mockWindow);

    // 3. Assert
    expect(result.title.text).toBe('');
    expect(result.description.text).toBe('');
    expect(result.canonical.href).toBe('');
    expect(result.url.isIndexable).toBe(true); // `noindex` is not present
    expect(result.hreflang).toHaveLength(0);
    expect(result.content.wordCount).toBe(0);
  });
});
