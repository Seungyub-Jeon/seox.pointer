/**
 * @param {Document} document
 * @returns {object}
 */
export function analyzeSocial(document) {
  const openGraphTags = {};
  const twitterTags = {};

  const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');

  metaTags.forEach(tag => {
    const property = tag.getAttribute('property'); // For Open Graph
    const name = tag.getAttribute('name'); // For Twitter
    const content = tag.getAttribute('content');

    if (property && content !== null) {
      openGraphTags[property] = content;
    } else if (name && content !== null) {
      twitterTags[name] = content;
    }
  });

  return {
    openGraph: openGraphTags,
    twitter: twitterTags,
  };
}
