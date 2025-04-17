/**
 * SEO & 웹접근성 체크 북마클릿
 * 웹사이트의 SEO와 웹 접근성 항목을 간편하게 진단하는 도구
 */

(function() {
    // Base URL of your server
    const BASE_URL = 'http://localhost:3000'; // Ensure this matches your server address

    // Unique timestamp to prevent caching issues
    const cacheBuster = new Date().getTime();

    // Check if the overlay already exists
    if (document.getElementById('seo-checker-overlay')) {
        // Optional: Maybe reload the script or just return
        console.log('SEO Checker is already running.');
        return; 
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${BASE_URL}/css/seo-checker.css?v=${cacheBuster}`;
    document.head.appendChild(link);

    // Load the main JavaScript file from the server
    const script = document.createElement('script');
    script.src = `${BASE_URL}/js/seo-checker.js?v=${cacheBuster}`;
    script.onload = () => {
        console.log('seo-checker.js loaded successfully.');
        // You might want to call an initialization function if seo-checker.js defines one globally
        // e.g., if (typeof window.initSeoChecker === 'function') { window.initSeoChecker(); }
    };
    script.onerror = () => {
        console.error('Failed to load seo-checker.js');
        // Clean up the added CSS link if script fails to load
        document.head.removeChild(link); 
        alert('SEO 체커 스크립트를 불러오는 데 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    };
    document.body.appendChild(script);

})(); 

/**
 * 스키마(Schema.org) 마크업 분석 함수
 */
function analyzeSchema() {
    const container = document.getElementById('seo-checker-schema');
    if (!container) return;

    // 스키마 데이터 분석
    const schemaData = {
        jsonLD: [],
        microdata: [],
        rdfa: [],
        totalSchemas: 0,
        schemaTypes: {}
    };
    
    // JSON-LD 형식 스키마 분석
    try {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        jsonLdScripts.forEach(script => {
            try {
                const jsonData = JSON.parse(script.textContent);
                schemaData.jsonLD.push({
                    data: jsonData,
                    element: script
                });
                
                // 스키마 유형 카운트
                countSchemaTypes(jsonData, schemaData.schemaTypes);
                schemaData.totalSchemas++;
            } catch (e) {
                console.warn('JSON-LD 파싱 오류:', e);
            }
        });
    } catch (e) {
        console.warn('JSON-LD 스키마 분석 오류:', e);
    }
    
    // Microdata 형식 스키마 분석
    try {
        const microdataElements = document.querySelectorAll('[itemscope]');
        microdataElements.forEach(element => {
            const itemType = element.getAttribute('itemtype');
            if (itemType && itemType.includes('schema.org')) {
                const schemaType = itemType.split('/').pop();
                schemaData.microdata.push({
                    type: schemaType,
                    element: element
                });
                
                // 스키마 유형 카운트
                if (schemaData.schemaTypes[schemaType]) {
                    schemaData.schemaTypes[schemaType]++;
                } else {
                    schemaData.schemaTypes[schemaType] = 1;
                }
                schemaData.totalSchemas++;
            }
        });
    } catch (e) {
        console.warn('Microdata 스키마 분석 오류:', e);
    }
    
    // RDFa 형식 스키마 분석
    try {
        const rdfaElements = document.querySelectorAll('[typeof]');
        rdfaElements.forEach(element => {
            const typeofAttr = element.getAttribute('typeof');
            if (typeofAttr && typeofAttr.includes('schema.org')) {
                const schemaType = typeofAttr.split(':').pop();
                schemaData.rdfa.push({
                    type: schemaType,
                    element: element
                });
                
                // 스키마 유형 카운트
                if (schemaData.schemaTypes[schemaType]) {
                    schemaData.schemaTypes[schemaType]++;
                } else {
                    schemaData.schemaTypes[schemaType] = 1;
                }
                schemaData.totalSchemas++;
            }
        });
    } catch (e) {
        console.warn('RDFa 스키마 분석 오류:', e);
    }
    
    // 바로 UI 업데이트 호출
    updateSchemaPanel(schemaData);
    
    return schemaData;
} 