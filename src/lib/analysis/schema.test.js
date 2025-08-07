import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeSchema } from './schema.js';

const createMockWindow = (html, url = 'https://example.com') => {
  const dom = new JSDOM(html, { url });
  return dom.window;
};

describe('analyzeSchema', () => {
  it('should detect and parse JSON-LD schema', () => {
    const mockWindow = createMockWindow(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Jules"
        }
      </script>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://example.com"
        }
      </script>
    `);
    const result = analyzeSchema(mockWindow.document);
    expect(result.counts.jsonLD).toBe(2);
    expect(result.counts.total).toBe(2);
    expect(result.jsonLD[0].name).toBe('Jules');
    expect(result.schemaTypes['Person']).toBe(1);
    expect(result.schemaTypes['WebSite']).toBe(1);
  });

  it('should detect and parse Microdata schema', () => {
    const mockWindow = createMockWindow(`
      <div itemscope itemtype="http://schema.org/Product">
        <span itemprop="name">Cool Product</span>
      </div>
    `);
    const result = analyzeSchema(mockWindow.document);
    expect(result.counts.microdata).toBe(1);
    expect(result.schemaTypes['Product']).toBe(1);
  });

  it('should detect and parse RDFa schema', () => {
    const mockWindow = createMockWindow(`
      <div vocab="http://schema.org/" typeof="Event">
        <div property="name">Awesome Event</div>
      </div>
    `);
    const result = analyzeSchema(mockWindow.document);
    expect(result.counts.rdfa).toBe(1);
    expect(result.schemaTypes['Event']).toBe(1);
  });

  it('should handle multiple types in JSON-LD', () => {
    const mockWindow = createMockWindow(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": ["Thing", "Person"],
          "name": "Jules"
        }
      </script>
    `);
    const result = analyzeSchema(mockWindow.document);
    expect(result.schemaTypes['Thing']).toBe(1);
    expect(result.schemaTypes['Person']).toBe(1);
  });

  it('should handle documents with no schema markup', () => {
    const mockWindow = createMockWindow('<p>No schema here.</p>');
    const result = analyzeSchema(mockWindow.document);
    expect(result.counts.total).toBe(0);
    expect(result.counts.jsonLD).toBe(0);
    expect(result.counts.microdata).toBe(0);
  });

  it('should handle all schema types together', () => {
    const mockWindow = createMockWindow(`
      <script type="application/ld+json">
        {"@type": "WebSite"}
      </script>
      <div itemscope itemtype="http://schema.org/Product"></div>
      <div vocab="http://schema.org/" typeof="Event"></div>
    `);
    const result = analyzeSchema(mockWindow.document);
    expect(result.counts.total).toBe(3);
    expect(result.counts.jsonLD).toBe(1);
    expect(result.counts.microdata).toBe(1);
    expect(result.counts.rdfa).toBe(1);
    expect(result.schemaTypes).toEqual({
      'WebSite': 1,
      'Product': 1,
      'Event': 1,
    });
  });
});
