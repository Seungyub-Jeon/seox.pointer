/**
 * @param {Document} document
 * @returns {object}
 */
export function analyzeHeadings(document) {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const headingsData = [];
  let lastLevel = 0;
  let h1Count = 0;

  headings.forEach(heading => {
    // A simple way to try and filter out headings from the checker UI itself.
    // This can be improved with more specific selectors or classes.
    if (heading.closest('#seo-checker-overlay')) {
      return;
    }

    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent.trim();
    const issues = [];

    if (level === 1) {
      h1Count++;
    }

    // 1. Check for empty headings
    if (!text) {
      issues.push('empty');
    }

    // 2. Check for skipped heading levels
    if (lastLevel !== 0 && level > lastLevel + 1) {
      issues.push('skipped');
    }

    headingsData.push({
      level: level,
      text: text || '',
      issues: issues,
      // Storing a reference to the element might be useful for later features,
      // but for pure data analysis, it's often better to avoid it.
      // For now, we'll keep it simple and just store the data.
    });

    lastLevel = level;
  });

  const h1Details = {
    count: h1Count,
    text: headingsData.find(h => h.level === 1)?.text || '',
  };

  const headingCounts = {
    h1: h1Count,
    h2: headingsData.filter(h => h.level === 2).length,
    h3: headingsData.filter(h => h.level === 3).length,
    h4: headingsData.filter(h => h.level === 4).length,
    h5: headingsData.filter(h => h.level === 5).length,
    h6: headingsData.filter(h => h.level === 6).length,
  };

  return {
    headings: headingsData,
    h1: h1Details,
    counts: headingCounts,
  };
}
