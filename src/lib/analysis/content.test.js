import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeKeywords } from './content.js';

const createMockWindow = (html) => {
  const dom = new JSDOM(html);
  return dom.window;
};

describe('analyzeKeywords', () => {
  it('should extract and count keywords correctly', () => {
    const mockWindow = createMockWindow(`
      <body>
        The quick brown fox jumps over the lazy dog. The dog was happy.
        The fox is a fox.
      </body>
    `);
    const result = analyzeKeywords(mockWindow.document);

    expect(result).toHaveLength(8);
    expect(result[0]).toEqual(['fox', 3]);
    expect(result[1]).toEqual(['dog', 2]);
    expect(result[2]).toEqual(['quick', 1]);
  });

  it('should ignore stopwords and short words', () => {
    const mockWindow = createMockWindow(`
      <body>
        A test is a good test.
      </body>
    `);
    const result = analyzeKeywords(mockWindow.document);
    expect(result).toEqual([['test', 2], ['good', 1]]);
  });

  it('should handle Korean text', () => {
    const mockWindow = createMockWindow(`
      <body>
        이것은 테스트입니다. 테스트는 중요합니다.
      </body>
    `);
    const result = analyzeKeywords(mockWindow.document);
    expect(result).toEqual([['테스트입니다', 1], ['테스트는', 1], ['중요합니다', 1]]);
  });

  it('should return an empty array for empty text', () => {
    const mockWindow = createMockWindow('<body></body>');
    const result = analyzeKeywords(mockWindow.document);
    expect(result).toEqual([]);
  });

  it('should respect the keyword count limit', () => {
    const mockWindow = createMockWindow(`
      <body>
        one two three four five six
      </body>
    `);
    const result = analyzeKeywords(mockWindow.document, 3);
    expect(result).toHaveLength(3);
  });
});
