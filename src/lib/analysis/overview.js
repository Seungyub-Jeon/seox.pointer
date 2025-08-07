/**
 * @param {Window} window
 * @returns {object}
 */
export function analyzeOverview(window) {
  const document = window.document;

  // 1. Title
  const titleElement = document.querySelector('title');
  const title = titleElement ? titleElement.textContent.trim() : '';

  // 2. Description
  const metaDescription = document.querySelector('meta[name="description"]');
  const description = metaDescription ? metaDescription.getAttribute('content')?.trim() : '';

  // 3. URL & Canonical
  const pageUrl = window.location.href;
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalLink ? canonicalLink.href : '';

  // 4. Robots & Indexability
  const robotsMeta = document.querySelector('meta[name="robots"]');
  const robotsContent = robotsMeta ? robotsMeta.getAttribute('content')?.toLowerCase() : '';
  const isIndexable = !(robotsContent.includes('noindex'));
  // X-Robots-Tag requires an HTTP header check, which is out of scope for client-side analysis.
  const xRobotsTag = 'N/A (Requires HTTP Header check)';

  // 5. Keywords & Publisher
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  const keywords = keywordsMeta ? keywordsMeta.getAttribute('content')?.trim() : '';
  const publisherMeta = document.querySelector('meta[name="publisher"]');
  const publisher = publisherMeta ? publisherMeta.getAttribute('content')?.trim() : '';

  // 6. Lang & Word Count
  const htmlLang = document.documentElement.getAttribute('lang') || '';
  const bodyContent = document.body.textContent || '';
  const wordCount = bodyContent.trim().split(/\s+/).filter(Boolean).length;

  // 7. hreflang
  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  const hreflang = Array.from(hreflangLinks).map(link => {
    return {
      lang: link.getAttribute('hreflang'),
      href: link.getAttribute('href')
    };
  });

  // 8. Element Counts
  const elementCounts = {
    h1: document.querySelectorAll('h1').length,
    h2: document.querySelectorAll('h2').length,
    h3: document.querySelectorAll('h3').length,
    h4: document.querySelectorAll('h4').length,
    h5: document.querySelectorAll('h5').length,
    h6: document.querySelectorAll('h6').length,
    img: document.querySelectorAll('img').length,
    a: document.querySelectorAll('a').length,
  };

  return {
    title: {
      text: title,
      length: title.length,
    },
    description: {
      text: description,
      length: description ? description.length : 0,
    },
    url: {
      href: pageUrl,
      isIndexable,
      robotsContent,
      xRobotsTag,
    },
    canonical: {
      href: canonicalUrl,
      isSelfReferencing: canonicalUrl ? canonicalUrl === pageUrl : null,
    },
    meta: {
      keywords,
      publisher,
      lang: htmlLang,
    },
    content: {
      wordCount,
    },
    hreflang,
    elementCounts,
  };
}
