import { describe, it, expect } from 'vitest';
import { analyzeHeadings } from './headings.js';

// A simple DOM mock utility
const createMockDocument = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
};

describe('analyzeHeadings', () => {
  it('should correctly analyze a valid heading structure', () => {
    const mockDocument = createMockDocument(`
      <h1>Main Title</h1>
      <h2>Subtitle 1</h2>
      <h3>Sub-subtitle</h3>
      <h2>Subtitle 2</h2>
    `);

    const result = analyzeHeadings(mockDocument);

    expect(result.h1.count).toBe(1);
    expect(result.h1.text).toBe('Main Title');
    expect(result.counts.h1).toBe(1);
    expect(result.counts.h2).toBe(2);
    expect(result.counts.h3).toBe(1);
    expect(result.headings).toHaveLength(4);
    expect(result.headings[0].issues).toEqual([]);
    expect(result.headings[1].issues).toEqual([]);
  });

  it('should detect multiple H1 tags', () => {
    const mockDocument = createMockDocument(`
      <h1>First H1</h1>
      <h1>Second H1</h1>
    `);

    const result = analyzeHeadings(mockDocument);
    expect(result.h1.count).toBe(2);
  });

  it('should detect an empty heading', () => {
    const mockDocument = createMockDocument(`
      <h1>Main Title</h1>
      <h2></h2>
    `);

    const result = analyzeHeadings(mockDocument);
    expect(result.headings[1].text).toBe('');
    expect(result.headings[1].issues).toContain('empty');
  });

  it('should detect a skipped heading level', () => {
    const mockDocument = createMockDocument(`
      <h1>Main Title</h1>
      <h3>Skipped Level</h3>
    `);

    const result = analyzeHeadings(mockDocument);
    expect(result.headings[1].level).toBe(3);
    expect(result.headings[1].issues).toContain('skipped');
  });

  it('should handle no headings on the page', () => {
    const mockDocument = createMockDocument('<p>Just a paragraph.</p>');
    const result = analyzeHeadings(mockDocument);

    expect(result.headings).toHaveLength(0);
    expect(result.h1.count).toBe(0);
    expect(result.counts.h2).toBe(0);
  });

  it('should ignore headings within the SEO checker UI', () => {
    const mockDocument = createMockDocument(`
      <h1>Real Page Title</h1>
      <div id="seo-checker-overlay">
        <h1>This is a UI heading</h1>
      </div>
    `);

    const result = analyzeHeadings(mockDocument);

    expect(result.headings).toHaveLength(1);
    expect(result.h1.count).toBe(1);
    expect(result.headings[0].text).toBe('Real Page Title');
  });
});
