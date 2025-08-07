/**
 * Extracts the most common keywords from the body text.
 * @param {Document} document
 * @param {number} count - The number of top keywords to return.
 * @returns {Array<[string, number]>} - An array of [keyword, count] tuples.
 */
export function analyzeKeywords(document, count = 10) {
  const text = document.body.textContent || '';

  // Very basic list of stopwords. This could be expanded.
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', '이', '그', '저', '것', '수',
    '등', '들', '및', '에서', '그리고', '하지만', '또는', '로', '으로', '이것은'
  ]);

  const wordCounts = {};
  // Improved regex to only match letters and numbers
  const words = text.toLowerCase().match(/[a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+/g) || [];

  words.forEach(word => {
    if (word.length > 1 && !stopWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
}
