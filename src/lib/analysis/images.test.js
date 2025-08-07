import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeImages } from './images.js';

const createMockWindow = (html, url = 'https://example.com') => {
  const dom = new JSDOM(html, { url, resources: 'usable' });
  return dom.window;
};

describe('analyzeImages', () => {
  it('should count all images correctly', () => {
    const mockWindow = createMockWindow(`
      <img src="image1.jpg" alt="Image 1">
      <img src="image2.png" alt="Image 2">
    `);
    const result = analyzeImages(mockWindow);
    expect(result.counts.total).toBe(2);
  });

  it('should detect images with missing alt attributes', () => {
    const mockWindow = createMockWindow(`
      <img src="image1.jpg">
      <img src="image2.png" alt="">
      <img src="image3.gif" alt="Description">
    `);
    const result = analyzeImages(mockWindow);
    expect(result.counts.missingAlt).toBe(1);
    expect(result.issues.missingAlt[0]).toContain('image1.jpg');
  });

  it('should detect images with overly long alt text', () => {
    const longAlt = 'a'.repeat(126);
    const mockWindow = createMockWindow(`
      <img src="long.jpg" alt="${longAlt}">
      <img src="ok.jpg" alt="ok">
    `);
    const result = analyzeImages(mockWindow);
    expect(result.counts.longAlt).toBe(1);
    expect(result.issues.longAlt[0]).toContain('long.jpg');
  });

  it('should detect images missing width or height attributes', () => {
    const mockWindow = createMockWindow(`
      <img src="no-dims.jpg">
      <img src="width-only.jpg" width="100">
      <img src="height-only.jpg" height="100">
      <img src="full-dims.jpg" width="100" height="100">
    `);
    const result = analyzeImages(mockWindow);
    expect(result.counts.missingDimensions).toBe(3);
    expect(result.issues.missingDimensions).toEqual(
        expect.arrayContaining([
            expect.stringContaining('no-dims.jpg'),
            expect.stringContaining('width-only.jpg'),
            expect.stringContaining('height-only.jpg'),
        ])
    );
  });

  it('should identify lazy-loaded images', () => {
    const mockWindow = createMockWindow(`
        <img src="lazy.jpg" loading="lazy">
        <img src="eager.jpg" loading="eager">
        <img src="none.jpg">
    `);
    const result = analyzeImages(mockWindow);
    expect(result.counts.lazyLoaded).toBe(1);
    expect(result.issues.lazyLoaded[0]).toContain('lazy.jpg');
  });
});
