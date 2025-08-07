/**
 * @param {Window} window
 * @returns {object}
 */
export function analyzeLinks(window) {
  const document = window.document;
  const allLinks = document.querySelectorAll('a');
  const currentDomain = window.location.hostname;

  const internalLinks = [];
  const externalLinks = [];
  const brokenLinks = [];
  const insecureLinks = [];
  const genericTextLinks = [];

  const genericLinkTexts = [
    'here', 'click here', 'click', 'read more', 'learn more', 'more',
    'details', 'go', 'view', 'check out', '여기', '클릭', '더보기', '자세히 보기'
  ];

  allLinks.forEach(link => {
    // Ignore links within the checker UI
    if (link.closest('#seo-checker-overlay')) {
      return;
    }

    const href = link.getAttribute('href');
    const text = link.textContent.trim() || '';
    const linkData = { text, href: href || '' };

    // 1. Check for broken links (missing or empty href)
    if (!href || href.trim() === '' || href.trim() === '#') {
      brokenLinks.push(linkData);
      return; // No further analysis needed for broken links
    }

    // 2. Check for insecure target="_blank" links
    if (link.target === '_blank' && !link.rel.includes('noopener')) {
      insecureLinks.push({ ...linkData, rel: link.rel });
    }

    // 3. Check for generic anchor text
    if (genericLinkTexts.includes(text.toLowerCase())) {
      genericTextLinks.push(linkData);
    }

    // 4. Classify as internal or external
    try {
      const url = new URL(link.href, window.location.origin);
      // Check for http/https protocols for standard web links
      if (url.protocol.startsWith('http')) {
        if (url.hostname === currentDomain) {
          internalLinks.push(linkData);
        } else {
          externalLinks.push(linkData);
        }
      } else {
        // Handle special protocols like mailto:, tel:, etc.
        externalLinks.push({ ...linkData, type: 'special' });
      }
    } catch (e) {
      // Hrefs that are truly invalid and cannot be parsed by new URL()
      // are considered broken.
      brokenLinks.push(linkData);
    }
  });

  return {
    total: allLinks.length,
    internal: internalLinks,
    external: externalLinks,
    issues: {
      broken: brokenLinks,
      insecure: insecureLinks,
      genericText: genericTextLinks,
    },
    counts: {
      total: allLinks.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      broken: brokenLinks.length,
      insecure: insecureLinks.length,
      genericText: genericTextLinks.length,
    }
  };
}
