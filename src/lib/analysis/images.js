/**
 * @param {Window} window
 * @returns {object}
 */
export function analyzeImages(window) {
  const document = window.document;
  const allImages = document.querySelectorAll('img');

  const imagesData = [];
  const issues = {
    missingAlt: [],
    longAlt: [],
    missingDimensions: [],
    lazyLoaded: [], // Informational, not really an "issue"
  };

  allImages.forEach(img => {
    if (img.closest('#seo-checker-overlay')) {
      return;
    }

    const alt = img.getAttribute('alt');
    const imageData = {
      src: img.src,
      alt: alt,
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      loading: img.getAttribute('loading'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
    };

    imagesData.push(imageData);

    // --- Issue Detection ---
    if (alt === null) {
      issues.missingAlt.push(imageData.src);
    } else if (alt.length > 125) {
      issues.longAlt.push(imageData.src);
    }

    if (!imageData.width || !imageData.height) {
      issues.missingDimensions.push(imageData.src);
    }

    if (imageData.loading === 'lazy') {
        issues.lazyLoaded.push(imageData.src);
    }
  });

  return {
    images: imagesData,
    issues: issues,
    counts: {
      total: imagesData.length,
      missingAlt: issues.missingAlt.length,
      longAlt: issues.longAlt.length,
      missingDimensions: issues.missingDimensions.length,
      lazyLoaded: issues.lazyLoaded.length,
    }
  };
}
