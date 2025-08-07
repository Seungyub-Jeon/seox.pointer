/**
 * @param {Document} document
 * @returns {object}
 */
export function analyzeSchema(document) {
  const results = {
    jsonLD: [],
    microdata: [],
    rdfa: [],
    counts: {
      jsonLD: 0,
      microdata: 0,
      rdfa: 0,
      total: 0,
    },
    schemaTypes: {},
  };

  // 1. Analyze JSON-LD
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const jsonData = JSON.parse(script.textContent);
      results.jsonLD.push(jsonData);
      countSchemaTypes(jsonData, results.schemaTypes);
    } catch (e) {
      // Ignore parsing errors
    }
  });

  // 2. Analyze Microdata
  const microdataElements = document.querySelectorAll('[itemscope]');
  microdataElements.forEach(element => {
    const itemType = element.getAttribute('itemtype');
    if (itemType && itemType.includes('schema.org')) {
      const schemaType = itemType.split('/').pop();
      results.microdata.push({ type: schemaType, element }); // Storing element for context
      if (results.schemaTypes[schemaType]) {
        results.schemaTypes[schemaType]++;
      } else {
        results.schemaTypes[schemaType] = 1;
      }
    }
  });

  // 3. Analyze RDFa
  const rdfaElements = document.querySelectorAll('[vocab*="schema.org"][typeof]');
  rdfaElements.forEach(element => {
    const typeofAttr = element.getAttribute('typeof');
    if (typeofAttr) {
      results.rdfa.push({ type: typeofAttr, element });
      if (results.schemaTypes[typeofAttr]) {
        results.schemaTypes[typeofAttr]++;
      } else {
        results.schemaTypes[typeofAttr] = 1;
      }
    }
  });

  // Update counts
  results.counts.jsonLD = results.jsonLD.length;
  results.counts.microdata = results.microdata.length;
  results.counts.rdfa = results.rdfa.length;
  results.counts.total = results.counts.jsonLD + results.counts.microdata + results.counts.rdfa;

  return results;
}

/**
 * Recursively counts schema types from JSON-LD data.
 * @param {object | object[]} data - The JSON-LD data.
 * @param {object} typesObj - The object to store the counts.
 */
function countSchemaTypes(data, typesObj) {
  if (Array.isArray(data)) {
    data.forEach(item => countSchemaTypes(item, typesObj));
    return;
  }
  if (data && typeof data === 'object' && data['@type']) {
    const type = data['@type'];
    const types = Array.isArray(type) ? type : [type];
    types.forEach(t => {
      const typeName = t.includes('schema.org/') ? t.split('/').pop() : t;
      if (typesObj[typeName]) {
        typesObj[typeName]++;
      } else {
        typesObj[typeName] = 1;
      }
    });
  }
}
