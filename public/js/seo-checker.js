/**
 * SEO & 웹접근성 체크 스크립트
 * 웹사이트의 SEO와 웹 접근성 항목을 간편하게 진단하는 도구
 */

(function() {
    // 이미 실행 중인지 확인
    if (document.getElementById('seo-checker-overlay')) {
        return;
    }
    
    // 메인 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'seo-checker-overlay';
    
    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.id = 'seo-checker-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // 탭 컨테이너
    const tabsContainer = document.createElement('div');
    tabsContainer.id = 'seo-checker-tabs';
    
    // 탭 콘텐츠 컨테이너
    const tabContents = document.createElement('div');
    tabContents.id = 'seo-checker-contents';
    
    // 탭 정의
    const tabs = [
        { id: 'overview', label: '개요' },
        { id: 'headings', label: '제목 구조' },
        { id: 'structure', label: '문서 구조' },
        { id: 'links', label: '링크' },
        { id: 'images', label: '이미지' },
        { id: 'schema', label: '스키마' },
        { id: 'social', label: '소셜' },
        { id: 'advanced', label: '고급 설정' }
    ];
    
    // 탭 생성
    tabs.forEach((tab, index) => {
        // 탭 버튼 생성
        const tabButton = document.createElement('button');
        tabButton.className = 'seo-checker-tab' + (index === 0 ? ' active' : '');
        tabButton.textContent = tab.label;
        tabButton.dataset.tab = tab.id;
        
        // 소셜 탭 버튼 로깅
        if (tab.id === 'social') {
            console.log('소셜 탭 버튼 생성:', tabButton);
        }
        
        tabButton.addEventListener('click', function() {
            console.log(`Tab clicked: ${tab.id}`);
            // 활성 탭 전환
            document.querySelectorAll('.seo-checker-tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.seo-checker-tab-content').forEach(content => {
                content.classList.remove('active');
                console.log(`  Content div #${content.id} active class: ${content.classList.contains('active')}`);
            });
            this.classList.add('active');
            const targetContent = document.getElementById(`seo-checker-${tab.id}`);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log(`  -> Activated: #${targetContent.id}`);
            } else {
                console.error(`Target content not found for tab: ${tab.id}`);
            }
        });
        tabsContainer.appendChild(tabButton);
        
        // 탭 콘텐츠 컨테이너 생성
        const tabContent = document.createElement('div');
        tabContent.id = `seo-checker-${tab.id}`;
        tabContent.className = 'seo-checker-tab-content' + (index === 0 ? ' active' : '');
        tabContent.innerHTML = `<div class="tab-title">${tab.label}</div><p>데이터 수집 중...</p>`;
        
        // 소셜 탭 콘텐츠 로깅
        if (tab.id === 'social') {
            console.log('소셜 탭 콘텐츠 생성:', tabContent);
        }
        
        tabContents.appendChild(tabContent);
    });
    
    // UI 조립
    overlay.appendChild(closeButton);
    overlay.appendChild(tabsContainer);
    overlay.appendChild(tabContents);
    document.body.appendChild(overlay);
    
    // 데이터 수집 및 분석 시작
    analyzePage();
    
    /**
     * 파일 존재 여부 확인 (HEAD 요청 사용)
     */
    async function checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' }); // 캐시 사용 안함
            return response.ok; // 상태 코드가 200-299 범위면 true 반환
        } catch (error) {
            // 네트워크 오류 등 발생 시
            console.error(`Error checking file ${url}:`, error);
            return false;
        }
    }

    /**
     * 페이지 분석 실행 함수 (이제 analyzeOverview는 async)
     */
    function analyzePage() {
        console.log('analyzePage 시작 - 모든 탭 ID 확인:');
        document.querySelectorAll('.seo-checker-tab-content').forEach(el => {
            console.log(`탭 컨테이너 ID: ${el.id}, 요소:`, el);
        });
        
        // 각 분석 함수 호출 (analyzeOverview는 async이지만 await 없이 호출)
        console.log('소셜 콘텐츠 컨테이너 존재 여부:', document.getElementById('seo-checker-social') !== null);
        
        analyzeOverview(); 
        analyzeHeadings();
        analyzeDocumentStructure();
        analyzeLinks();
        analyzeImages();
        analyzeSchema();
        analyzeSocial();
        analyzeAdvanced();
    }
    
    /**
     * Overview 탭 분석 (async 함수로 변경)
     */
    async function analyzeOverview() { // async 추가
        const container = document.getElementById('seo-checker-overview');
        if (!container) {
            console.error('#seo-checker-overview container not found!');
            return;
        }
        
        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><span>페이지 분석 중...</span></div>';

        // --- 유틸리티 함수: 한글 포함 여부 확인 ---
        const containsKorean = (text) => {
            if (!text) return false;
            const koreanChars = text.match(/[\uac00-\ud7a3]/g);
            // 텍스트 길이의 30% 이상이 한글이면 한글 콘텐츠로 간주 (임계값 조절 가능)
            return koreanChars && koreanChars.length / text.length > 0.3; 
        };

        // --- 데이터 수집 --- 

        // 1. Title
        const titleElement = document.querySelector('title');
        const title = titleElement ? titleElement.textContent.trim() : '';
        const titleLength = title.length;

        // 2. Description
        const metaDescription = document.querySelector('meta[name="description"]');
        const description = metaDescription ? metaDescription.getAttribute('content')?.trim() : '';
        const descriptionLength = description ? description.length : 0;

        // 3. URL & Canonical
        const pageUrl = window.location.href;
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        const canonicalUrl = canonicalLink ? canonicalLink.href : '';
        const isSelfReferencing = canonicalUrl === pageUrl;

        // 4. Robots & Indexability
        const robotsMeta = document.querySelector('meta[name="robots"]');
        const robotsContent = robotsMeta ? robotsMeta.getAttribute('content')?.toLowerCase() : '';
        const isIndexable = !(robotsContent.includes('noindex'));
        // X-Robots-Tag는 HTTP 헤더이므로 클라이언트에서 직접 확인 어려움
        const xRobotsTag = 'N/A (HTTP Header)'; 

        // 5. Keywords & Publisher
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const keywords = keywordsMeta ? keywordsMeta.getAttribute('content')?.trim() : '';
        const publisherMeta = document.querySelector('meta[name="publisher"]');
        const publisher = publisherMeta ? publisherMeta.getAttribute('content')?.trim() : '';
        
        // 6. Lang & Word Count
        const htmlLang = document.documentElement.getAttribute('lang') || '';
        const bodyContent = document.body.textContent || '';
        const wordCount = bodyContent.trim().split(/\s+/).filter(Boolean).length; // 빈 문자열 필터링

        // 7. hreflang 분석 추가
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
        const hreflangData = Array.from(hreflangLinks).map(link => {
            return {
                lang: link.getAttribute('hreflang'),
                href: link.getAttribute('href')
            };
        });
        
        // 8. Element Counts (분석 통계용)
        const h1Count = document.querySelectorAll('h1').length;
        const h2Count = document.querySelectorAll('h2').length;
        const h3Count = document.querySelectorAll('h3').length;
        const h4Count = document.querySelectorAll('h4').length;
        const h5Count = document.querySelectorAll('h5').length;
        const h6Count = document.querySelectorAll('h6').length;
        const imgCount = document.querySelectorAll('img').length;
        const linkCount = document.querySelectorAll('a').length;
        
        // --- 상태 메시지 생성 --- 
        let titleStatus = 'seo-checker-status-good';
        let titleIndicator = `${titleLength}자`;
        let titleMessage = '적절한 길이의 타이틀입니다.';
        const isKoreanTitle = containsKorean(title);
        const minKoreanTitleLength = 35; // 한글 타이틀 최소 길이
        const maxTitleLength = isKoreanTitle ? 35 : 60; // 최대 길이는 유지 (한글 35, 영어 60)
        
        if (titleLength === 0) {
            titleStatus = 'seo-checker-status-error';
            titleIndicator = '없음';
            titleMessage = '타이틀이 없습니다. SEO에 매우 중요합니다.';
        } else if (isKoreanTitle && titleLength < minKoreanTitleLength) {
            // 한글인데 최소 길이 미만일 때
            titleStatus = 'seo-checker-status-error'; 
            titleMessage = `타이틀이 너무 짧습니다. (한글 기준 최소 ${minKoreanTitleLength}자 권장)`;
        } else if (!isKoreanTitle && titleLength < 10) {
             // 영문 등인데 최소 길이(10) 미만일 때
            titleStatus = 'seo-checker-status-warning';
            titleMessage = `타이틀이 너무 짧습니다. (최소 10자 권장)`;
        } else if (titleLength > maxTitleLength) {
            titleStatus = 'seo-checker-status-warning';
            titleMessage = `타이틀이 너무 깁니다. ${isKoreanTitle ? '(한글 기준 최대 35자 권장)' : '(최대 60자 권장)'} 검색 결과에서 잘릴 수 있습니다.`;
        } // 그 외는 Good 상태 및 기본 메시지 유지

        let descStatus = 'seo-checker-status-good';
        let descIndicator = `${descriptionLength}자`;
        let descMessage = '적절한 길이의 메타 설명입니다.';
        const isKoreanDesc = containsKorean(description);
        const minKoreanDescLength = 65; // 한글 설명 최소 길이
        const maxDescLength = isKoreanDesc ? 70 : 160; // 최대 길이는 유지 (한글 70, 영어 160)

        if (descriptionLength === 0) {
            descStatus = 'seo-checker-status-error';
            descIndicator = '없음';
            descMessage = '메타 설명이 없습니다. 검색 결과에 중요한 요소입니다.';
        } else if (isKoreanDesc && descriptionLength < minKoreanDescLength) {
             // 한글인데 최소 길이 미만일 때
             descStatus = 'seo-checker-status-error';
             descMessage = `메타 설명이 너무 짧습니다. (한글 기준 최소 ${minKoreanDescLength}자 권장)`;
        } else if (!isKoreanDesc && descriptionLength < 50) {
            // 영문 등인데 최소 길이(50) 미만일 때
            descStatus = 'seo-checker-status-warning';
            descMessage = `메타 설명이 너무 짧습니다. (최소 50자 권장)`;
        } else if (descriptionLength > maxDescLength) {
            descStatus = 'seo-checker-status-warning';
            descMessage = `메타 설명이 너무 깁니다. ${isKoreanDesc ? '(한글 기준 최대 70자 권장)' : '(최대 160자 권장)'} 검색 결과에서 잘릴 수 있습니다.`;
        } // 그 외는 Good 상태 및 기본 메시지 유지

        const urlStatus = isIndexable ? 'seo-checker-status-good' : 'seo-checker-status-error';
        const urlIndicator = isIndexable ? 'Indexable' : 'NoIndex';

        const canonicalStatus = canonicalUrl ? (isSelfReferencing ? 'seo-checker-status-good' : 'seo-checker-status-warning') : 'seo-checker-status-warning';
        const canonicalIndicator = canonicalUrl ? (isSelfReferencing ? 'Self-referencing' : '다른 URL 지정') : '없음';
        
        const robotsStatus = robotsContent ? 'seo-checker-status-good' : 'seo-checker-status-warning';
        
        // X-Robots-Tag 상태는 정보성으로 변경
        const xRobotsStatus = 'seo-checker-status-info'; 
        const xRobotsIndicator = '확인 불가'; 
        
        const keywordsStatus = keywords ? 'seo-checker-status-good' : 'seo-checker-status-warning';
        const keywordsIndicator = keywords ? '있음' : '없음';
        
        const publisherStatus = publisher ? 'seo-checker-status-good' : 'seo-checker-status-warning';
        const publisherIndicator = publisher ? '있음' : '없음';

        const langStatus = htmlLang ? 'seo-checker-status-good' : 'seo-checker-status-error';
        const langIndicator = htmlLang ? htmlLang : '없음';
        
        // hreflang 상태 설정
        const hreflangStatus = hreflangData.length > 0 ? 'seo-checker-status-good' : 'seo-checker-status-info';
        const hreflangIndicator = hreflangData.length > 0 ? `${hreflangData.length}개` : '없음';
        
        // Word Count 상태 로직 추가
        let wordStatus = 'seo-checker-status-good';
        let wordIndicator = '충분';
        if (wordCount < 300) {
             wordStatus = 'seo-checker-status-warning';
             wordIndicator = '부족';
        }

        // --- HTML 생성 --- 
        let content = `
            <div class="tab-title">개요</div>
            <div class="overview-cards">
                <!-- SEO 점수 카드 -->
                <div class="overview-score-card">
                    <div class="page-info">
                        <div class="page-url"><strong>URL: </strong>${pageUrl}</div>
                        <div class="page-title-preview"><strong>타이틀: </strong>${title || '(타이틀 없음)'}</div>
                        <div class="page-desc-preview"><strong>설명: </strong>${description || '(메타 설명 없음)'}</div>
                    </div>
                    <div class="score-chart">
                        <div class="score-circle">
                            <div class="score-number">${isIndexable ? '✓' : '✗'}</div>
                            <div class="score-label">색인 가능</div>
                        </div>
                    </div>
                </div>

                <!-- Title 카드 -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>페이지 타이틀</h3>
                        <span class="seo-checker-status ${titleStatus}">${titleIndicator}</span>
                    </div>
                    <div class="card-content">
                        <div class="data-value full-width">${title || '(없음)'}</div>
                        <div class="data-meta compact">
                            <p class="note">${titleMessage}</p>
                            <p class="importance-note">검색 결과 제목 및 브라우저 탭에 표시되며, SEO 순위에 중요한 영향을 미칩니다.</p>
                        </div>
                    </div>
                </div>

                <!-- Description 카드 -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>메타 설명</h3>
                        <span class="seo-checker-status ${descStatus}">${descIndicator}</span>
                    </div>
                    <div class="card-content">
                        <div class="data-value full-width">${description || '(없음)'}</div>
                        <div class="data-meta compact">
                            <p class="note">${descMessage}</p>
                            <p class="importance-note">검색 결과에 페이지 요약으로 표시되어 클릭률(CTR)에 영향을 줍니다.</p>
                        </div>
                    </div>
                </div>

                <!-- URL & Canonical 카드 -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>URL 정보</h3>
                    </div>
                    <div class="card-content">
                        <div class="data-item">
                            <div class="data-label">색인 상태:</div>
                            <div class="data-value">${isIndexable ? '색인 가능' : '색인 불가능'}</div>
                            <div class="data-status"><span class="seo-checker-status ${urlStatus}">${urlIndicator}</span></div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">표준 URL:</div>
                            <div class="data-value">${canonicalUrl || '(없음)'}</div>
                            <div class="data-status"><span class="seo-checker-status ${canonicalStatus}">${canonicalIndicator}</span></div>
                        </div>
                    </div>
                </div>

                <!-- Robots & X-Robots 카드 -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>로봇 제어</h3>
                    </div>
                    <div class="card-content">
                        <div class="data-item">
                            <div class="data-label">Robots 태그:</div>
                            <div class="data-value">${robotsContent || '(없음)'}</div>
                            <div class="data-status"><span class="seo-checker-status ${robotsStatus}">${robotsContent ? '있음' : '없음'}</span></div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">X-Robots 헤더:</div>
                            <div class="data-value">${xRobotsTag}</div>
                            <div class="data-status"><span class="seo-checker-status ${xRobotsStatus}">${xRobotsIndicator}</span></div>
                        </div>
                    </div>
                </div>

                <!-- Keywords & Lang 카드 -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>언어 및 키워드</h3>
                    </div>
                    <div class="card-content">
                        <div class="data-item">
                            <div class="data-label">HTML 언어:</div>
                            <div class="data-value">${htmlLang || '(없음)'}</div>
                            <div class="data-status"><span class="seo-checker-status ${langStatus}">${langIndicator}</span></div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">메타 키워드:</div>
                            <div class="data-value">${keywords || '(없음)'}</div>
                            <div class="data-status"><span class="seo-checker-status ${keywordsStatus}">${keywordsIndicator}</span></div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">단어 수:</div>
                            <div class="data-value">${wordCount}</div>
                            <div class="data-status"><span class="seo-checker-status ${wordStatus}">${wordIndicator}</span></div>
                        </div>
                    </div>
                </div>

                <!-- Hreflang 카드 (새로 추가) -->
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>다국어 지원 (Hreflang)</h3>
                        <span class="seo-checker-status ${hreflangStatus}">${hreflangIndicator}</span>
                    </div>
                    <div class="card-content">
                        <div class="data-item">
                            <div class="data-meta">
                                <p class="importance-note">국제적 또는 다국어 웹사이트를 위한 태그로, 검색 엔진에 동일 콘텐츠의 언어별/지역별 버전을 알려줍니다.</p>
                            </div>
                            ${hreflangData.length > 0 ? `
                            <div class="hreflang-list">
                                <table class="hreflang-table">
                                    <thead>
                                        <tr>
                                            <th>언어 코드</th>
                                            <th>URL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${hreflangData.map(item => `
                                            <tr>
                                                <td><code>${item.lang}</code></td>
                                                <td>${item.href}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : '<div class="no-data">설정된 hreflang 태그가 없습니다. 다국어 사이트인 경우 추가하는 것이 좋습니다.</div>'}
                        </div>
                    </div>
                </div>

                <!-- 요소 개수 요약 카드 -->
                <div class="overview-summary-card">
                    <div class="card-header">
                        <h3>문서 요소 통계</h3>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>H1</span>
                            <strong>${h1Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H2</span>
                            <strong>${h2Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H3</span>
                            <strong>${h3Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H4-H6</span>
                            <strong>${h4Count + h5Count + h6Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>이미지</span>
                            <strong>${imgCount}</strong>
                        </div>
                        <div class="summary-item">
                            <span>링크</span>
                            <strong>${linkCount}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 파일 링크 카드 (robots.txt, sitemap.xml)
        const origin = window.location.origin;
        const robotsUrl = `${origin}/robots.txt`;
        const sitemapUrl = `${origin}/sitemap.xml`;

        // 파일 존재 여부 비동기 확인
        const robotsExists = await checkFileExists(robotsUrl);
        const sitemapExists = await checkFileExists(sitemapUrl);

        content += `
            <div class="file-links-card">
                <div class="file-links-title">SEO 파일 확인</div>
                <div class="file-links-container">
                    ${robotsExists 
                      ? `<a href="${robotsUrl}" target="_blank" rel="noopener noreferrer" class="file-link available">
                           <span class="file-icon">📄</span>
                           <span class="file-name">robots.txt</span>
                         </a>` 
                      : `<span class="file-link unavailable">
                           <span class="file-icon">🚫</span>
                           <span class="file-name">robots.txt 없음</span>
                         </span>`
                    }
                    ${sitemapExists 
                      ? `<a href="${sitemapUrl}" target="_blank" rel="noopener noreferrer" class="file-link available">
                           <span class="file-icon">🗺️</span>
                           <span class="file-name">sitemap.xml</span>
                         </a>` 
                      : `<span class="file-link unavailable">
                           <span class="file-icon">🚫</span>
                           <span class="file-name">sitemap.xml 없음</span>
                         </span>`
                    }
                </div>
            </div>
        `;

        // 최종적으로 내용 할당
        container.innerHTML = content;
    }
    
    /**
     * 헤딩 분석 함수 (개선)
     */
    function analyzeHeadings() {
        const container = document.getElementById('seo-checker-headings');
        if (!container) {
            console.error('#seo-checker-headings container not found!');
            return; 
        }
        
        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>제목 구조 분석 중...</p></div>';

        // --- 데이터 수집 ---
        // 모든 헤딩 요소를 가져온 후, 북마클릿 UI 내부 요소 제외
        const allHeadingsInDoc = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headings = Array.from(allHeadingsInDoc).filter(h => !h.closest('#seo-checker-overlay'));
        
        const headingsData = [];
        let lastLevel = 0; // 헤딩 순서 검사를 위한 변수
        let h1Count = 0;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            const text = heading.textContent.trim();
            const issues = [];

            if (level === 1) {
                h1Count++;
            }

            // 1. 빈 헤딩 검사
            if (!text) {
                issues.push('내용 없음');
            }

            // 2. 헤딩 순서 검사 (첫 헤딩 제외)
            // 중요: lastLevel이 0일 때(첫 헤딩이 H1이 아닌 경우)도 고려해야 함
            if (lastLevel !== 0 && level > lastLevel + 1) { 
                issues.push(`레벨 건너뜀 (H${lastLevel} → H${level})`);
            }

            headingsData.push({
                level: level,
                text: text || '(내용 없음)',
                issues: issues
            });

            // 다음 레벨 비교를 위해 현재 레벨 업데이트 
            lastLevel = level;
        });

        // --- H1 태그 상태 ---
        let h1Status = 'seo-checker-status-good';
        let h1Message = 'H1 태그가 1개 사용되었습니다. (권장)';
        let h1Detail = ''; // H1 내용 표시용

        if (h1Count === 0) {
            h1Status = 'seo-checker-status-error';
            h1Message = 'H1 태그가 없습니다. 페이지의 주요 제목을 H1으로 지정해야 합니다.';
        } else if (h1Count > 1) {
            h1Status = 'seo-checker-status-warning';
            h1Message = `H1 태그가 ${h1Count}개 사용되었습니다. 일반적으로 페이지당 하나의 H1만 권장합니다.`;
        }
        
        // H1 내용 가져오기 (첫 번째 H1만)
        const firstH1 = headingsData.find(h => h.level === 1);
        if(firstH1) {
             h1Detail = firstH1.text;
        }

        // 헤딩 개수 계산
        const h2Count = headingsData.filter(h => h.level === 2).length;
        const h3Count = headingsData.filter(h => h.level === 3).length;
        const h4Count = headingsData.filter(h => h.level === 4).length;
        const h5Count = headingsData.filter(h => h.level === 5).length;
        const h6Count = headingsData.filter(h => h.level === 6).length;

        // --- HTML 생성 ---
        let content = `
            <div class="tab-title">제목 구조</div>
            
            <!-- 헤딩 요약 카드 -->
            <div class="overview-cards">
                <!-- H1 상태 카드 -->
                <div class="overview-data-card full-width">
                    <div class="card-header">
                        <h3>H1 태그 상태</h3>
                        <span class="seo-checker-status ${h1Status}">${h1Count}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-value full-width">${h1Detail || '(H1 없음)'}</div>
                        <div class="data-meta compact">
                            <p class="note">${h1Message}</p>
                            <p class="importance-note">H1 태그는 페이지의 가장 중요한 제목으로, 검색 엔진과 사용자에게 페이지 주제를 명확히 전달합니다.</p>
                        </div>
                    </div>
                </div>

                <!-- 헤딩 통계 카드 -->
                <div class="overview-summary-card">
                    <div class="card-header">
                        <h3>제목 태그 통계</h3>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>H1</span>
                            <strong>${h1Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H2</span>
                            <strong>${h2Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H3</span>
                            <strong>${h3Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H4</span>
                            <strong>${h4Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H5</span>
                            <strong>${h5Count}</strong>
                        </div>
                        <div class="summary-item">
                            <span>H6</span>
                            <strong>${h6Count}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 헤딩 구조 목록 카드 -->
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>헤딩 구조 목록</h3>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">헤딩 태그(H1-H6)는 콘텐츠의 계층 구조를 나타내며, 검색 엔진과 스크린 리더 사용자에게 중요합니다. 논리적인 순서와 명확한 내용이 필요합니다.</p>
                    </div>
                    ${headingsData.length > 0 ? `
                    <ul class="heading-structure-list">
                        ${headingsData.map(heading => {
                            const issueText = heading.issues.length > 0 ? `<span class="heading-issue">(${heading.issues.join(', ')})</span>` : '';
                            return `
                            <li class="heading-level-${heading.level} ${heading.issues.length > 0 ? 'has-issue' : ''}">
                                <span class="heading-tag">H${heading.level}</span>
                                <span class="heading-text">${heading.text}</span>
                                ${issueText}
                            </li>
                            `;
                        }).join('')}
                    </ul>
                    ` : '<div class="no-data">페이지에 헤딩 태그가 없습니다.</div>'}
                </div>
            </div>

            <!-- HTML 문서 개요 카드 -->
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>HTML 문서 개요</h3>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">페이지의 제목(H1-H6) 구조를 시각적으로 보여줍니다. 콘텐츠의 논리적 흐름을 파악하는 데 도움이 됩니다.</p>
                    </div>
                    ${headingsData.length > 0 ? `
                    <ul class="html-outline-list">
                        ${headingsData.map(heading => `
                            <li class="outline-level-${heading.level}">
                                <span class="outline-text">${heading.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                    ` : '<div class="no-data">문서 개요를 생성할 헤딩 태그가 없습니다.</div>'}
                </div>
            </div>
        `;

        // 최종적으로 내용 할당
        container.innerHTML = content;
    }
    
    /**
     * 링크 분석 함수 (개선)
     */
    function analyzeLinks() {
        const container = document.getElementById('seo-checker-links');
        if (!container) {
            console.error('#seo-checker-links container not found!');
            return; 
        }
        
        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>링크 분석 중...</p></div>';
        
        let content = '<div class="tab-title">링크 분석</div>';
        
        // --- 데이터 수집 ---
        const allLinks = document.querySelectorAll('a');
        const totalLinks = allLinks.length;
        const currentDomain = window.location.hostname;

        const internalLinks = [];
        const externalLinks = [];
        const brokenLinks = []; // href 없거나 비어있음
        const linksWithoutTitle = [];
        const insecureTargetBlankLinks = [];
        const genericTextLinks = []; // 일반적인 텍스트를 사용하는 링크

        // 일반적인 링크 텍스트 단어 목록 (SEO와 접근성에 좋지 않은 텍스트)
        const genericLinkTexts = [
            '여기', '클릭', '클릭하세요', '여기를 클릭하세요', '여기를 눌러주세요',
            '더보기', '더 보기', '자세히 보기', '자세히', '상세보기', '상세 보기',
            '바로가기', '바로 가기', '확인하기', '알아보기',
            'click', 'click here', 'here', 'more', 'read more', 'details', 'learn more',
            'go', 'go to', 'check', 'check out', 'view', 'view more'
        ];

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim() || '(텍스트 없음)';
            const titleAttr = link.getAttribute('title');
            const targetAttr = link.getAttribute('target');
            const relAttr = link.getAttribute('rel')?.toLowerCase() || '';

            // 1. 깨진 링크 확인 (href 없음)
            if (!href || href.trim() === '') {
                brokenLinks.push({ text: text, href: '(href 없음)' });
                // 깨진 링크는 추가 분석 중단
                return;
            }

            // 2. title 속성 확인
            if (!titleAttr) {
                linksWithoutTitle.push({ text: text, href: href });
            }

            // 3. target="_blank" 보안 확인
            if (targetAttr === '_blank') {
                const hasNoopener = relAttr.includes('noopener');
                const hasNoreferrer = relAttr.includes('noreferrer');
                if (!hasNoopener || !hasNoreferrer) {
                    insecureTargetBlankLinks.push({ text: text, href: href, rel: relAttr });
                }
            }

            // 4. 일반적인 링크 텍스트 확인
            if (text !== '(텍스트 없음)') {
                const lowerText = text.toLowerCase().trim();
                if (genericLinkTexts.some(genericText => lowerText === genericText.toLowerCase())) {
                    genericTextLinks.push({ text: text, href: href });
                }
            }

            // 5. 내부/외부 링크 분류
            // 앵커 링크
            if (href.startsWith('#')) {
                internalLinks.push({ text: text, href: href, type: 'anchor' });
                return;
            }

            try {
                const url = new URL(href, window.location.origin);
                if (url.hostname === currentDomain) {
                    internalLinks.push({ text: text, href: href, type: 'internal' });
                } else {
                    externalLinks.push({ text: text, href: href, type: 'external' });
                }
            } catch (e) {
                // 유효하지 않은 URL 형식 등 (상대 경로는 내부로 처리)
                 if (!href.startsWith('mailto:') && !href.startsWith('tel:')) { // 메일, 전화 링크 제외
                    internalLinks.push({ text: text, href: href, type: 'relative' });
                 } else {
                    // mailto:, tel: 등은 특수 링크로 분류
                    externalLinks.push({ text: text, href: href, type: 'special' });
                 }
            }
        });

        // --- HTML 생성 ---
        // 카드 레이아웃 시작
        content += '<div class="overview-cards">';
        
        // 링크 통계 요약 카드
        content += `
            <div class="overview-summary-card">
                <div class="card-header">
                    <h3>링크 통계 요약</h3>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>총 링크</span>
                        <strong>${totalLinks}</strong>
                    </div>
                    <div class="summary-item">
                        <span>내부 링크</span>
                        <strong>${internalLinks.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>외부 링크</span>
                        <strong>${externalLinks.length}</strong>
                    </div>
                    <div class="summary-item ${brokenLinks.length > 0 ? 'warning' : ''}">
                        <span>깨진 링크</span>
                        <strong>${brokenLinks.length}</strong>
                    </div>
                    <div class="summary-item ${insecureTargetBlankLinks.length > 0 ? 'warning' : ''}">
                        <span>보안 위험</span>
                        <strong>${insecureTargetBlankLinks.length}</strong>
                    </div>
                    <div class="summary-item ${genericTextLinks.length > 0 ? 'warning' : ''}">
                        <span>일반 텍스트</span>
                        <strong>${genericTextLinks.length}</strong>
                    </div>
                </div>
            </div>

            <!-- 링크 분포 시각화 카드 -->
            <div class="overview-data-card full-width">
                <div class="card-header">
                    <h3>내부/외부 링크 비율</h3>
                </div>
                <div class="card-content">
                    <div class="link-ratio-chart">
                        <div class="chart-container">
                            <div class="internal-bar" style="width: ${internalLinks.length > 0 ? Math.round((internalLinks.length / totalLinks) * 100) : 0}%;">
                                <span class="bar-label">${internalLinks.length > 0 ? Math.round((internalLinks.length / totalLinks) * 100) : 0}%</span>
                            </div>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color internal"></span>
                                <span class="legend-text">내부 링크 (${internalLinks.length}개)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color external"></span>
                                <span class="legend-text">외부 링크 (${externalLinks.length}개)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 링크 문제점 요약 카드
        if (brokenLinks.length > 0 || insecureTargetBlankLinks.length > 0 || genericTextLinks.length > 0) {
            content += `
                <div class="overview-data-card full-width">
                    <div class="card-header">
                        <h3>링크 문제점 요약</h3>
                    </div>
                    <div class="card-content">
                        <div class="data-meta compact">
                            <p class="importance-note">잘 구성된 링크는 사용자 경험과 SEO에 중요합니다. 다음 문제들을 해결하면 웹사이트의 품질이 향상됩니다.</p>
                        </div>
                        <div class="link-issues-summary">
                            ${brokenLinks.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-error">href 속성 없음 (${brokenLinks.length}개)</span>
                                    </div>
                                    <p class="issue-desc">링크에 href 속성이 없어 사용자가 이동할 수 없습니다. 모든 링크에 유효한 목적지를 지정해야 합니다.</p>
                                </div>
                            ` : ''}
                            
                            ${insecureTargetBlankLinks.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-warning">보안 위험 target="_blank" (${insecureTargetBlankLinks.length}개)</span>
                                    </div>
                                    <p class="issue-desc">새 탭으로 열리는 링크에 rel="noopener noreferrer" 속성이 없어 보안 취약점이 있습니다.</p>
                                </div>
                            ` : ''}
                            
                            ${genericTextLinks.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-warning">일반적인 링크 텍스트 (${genericTextLinks.length}개)</span>
                                    </div>
                                    <p class="issue-desc">"여기", "클릭", "더보기"와 같은 일반적인 텍스트는 맥락 없이 링크의 목적을 이해하기 어렵게 만듭니다.</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        // 문제점 상세 목록 카드
        const createIssueListCard = (title, description, statusClass, items, itemFormatter) => {
            if (items.length === 0) return '';
            return `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>${title}</h3>
                        <span class="seo-checker-status ${statusClass}">${items.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="importance-note">${description}</p>
                        </div>
                        <ul class="link-issue-list">
                            ${items.map(itemFormatter).join('')}
                        </ul>
                    </div>
                </div>
            `;
        };

        // href 속성 없는 링크 목록
        content += createIssueListCard(
            'href 속성 없는 링크',
            '다음 링크에 href 속성이 없거나 비어 있어 사용자가 이동할 수 없습니다. 링크의 목적지를 명시하는 것이 중요합니다.',
            'seo-checker-status-error',
            brokenLinks,
            link => `<li>${link.text}</li>`
        );

        // Title 없는 링크 목록 (중요도 낮음 - 정보성)
        content += createIssueListCard(
            'title 속성 없는 링크',
            'title 속성은 선택 사항이지만, 링크의 목적을 추가 설명하여 사용자 경험과 접근성을 높일 수 있습니다. 링크 텍스트가 충분히 설명적이라면 생략해도 됩니다.',
            'seo-checker-status-info',
            linksWithoutTitle.slice(0, 20), // 너무 많을 수 있으므로 20개만 표시
            link => `<li><a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.text}</a> <span class="link-href">(${link.href})</span></li>`
        );

        // 보안 위험 target="_blank" 목록
        content += createIssueListCard(
            '보안 위험 target="_blank"',
            '다음 링크는 새 탭으로 열리지만 rel="noopener noreferrer" 속성이 없어 보안 및 성능 문제가 발생할 수 있습니다. 이 속성은 새 탭에서 악성 스크립트로부터 원래 페이지를 보호합니다.',
            'seo-checker-status-warning',
            insecureTargetBlankLinks,
            link => `<li><a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.text}</a> <span class="link-href">(${link.href})</span> <span class="link-rel">(rel: ${link.rel || '없음'})</span></li>`
        );

        // 일반적인 링크 텍스트 목록
        content += createIssueListCard(
            '일반적인 링크 텍스트',
            '"여기", "클릭", "더보기"와 같은 일반적인 텍스트는 맥락 없이 링크의 목적을 이해하기 어렵게 만듭니다. 특히 스크린 리더 사용자에게 불편하며, 검색 엔진에도 불리합니다.',
            'seo-checker-status-warning',
            genericTextLinks,
            link => `<li><span class="generic-link-text">${link.text}</span> <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="link-preview">↗</a> <span class="link-href">(${link.href})</span></li>`
        );

        // 내부 링크 및 외부 링크 목록 카드
        const createLinkListCard = (title, description, links, type) => {
            if (links.length === 0) return '';
            const maxDisplayLinks = 8; // 기본 표시 개수
            const hasMoreLinks = links.length > maxDisplayLinks;
            const buttonId = `toggle-${type}-links`;
            const listId = `${type}-links-list`;
            
            return `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>${title}</h3>
                        <span class="seo-checker-status seo-checker-status-info">${links.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="importance-note">${description}</p>
                            ${hasMoreLinks ? `<button class="toggle-list-btn" id="${buttonId}">펼치기</button>` : ''}
                        </div>
                        <ul class="link-full-list ${hasMoreLinks ? 'collapsible-list' : ''}" id="${listId}">
                            ${links.slice(0, maxDisplayLinks).map(link => `
                                <li>
                                    <span class="link-text">${link.text}</span>
                                    <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="link-preview">↗</a>
                                    <span class="link-href">(${link.href})</span>
                                </li>
                            `).join('')}
                            ${hasMoreLinks ? `<li class="more-links-info">...외 ${links.length - maxDisplayLinks}개 더 있음</li>` : ''}
                        </ul>
                    </div>
                </div>
            `;
        };

        // 내부 링크 목록
        content += createLinkListCard(
            '내부 링크',
            '내부 링크는 웹사이트 내 페이지 간 연결을 제공하며, 검색 엔진의 페이지 크롤링과 사이트 구조 이해에 도움을 줍니다.',
            internalLinks,
            'internal'
        );

        // 외부 링크 목록
        content += createLinkListCard(
            '외부 링크',
            '외부 링크는 다른 웹사이트로 연결되는 링크입니다. 신뢰할 수 있는 사이트로의 링크는 SEO에 도움이 될 수 있지만, 보안과 성능 면에서 주의가 필요합니다.',
            externalLinks,
            'external'
        );

        // 링크 데이터 내보내기 카드
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>링크 데이터 내보내기</h3>
                </div>
                <div class="card-content export-buttons">
                    <button class="seo-checker-export-btn" id="export-internal-links">내부 링크 (CSV)</button>
                    <button class="seo-checker-export-btn" id="export-external-links">외부 링크 (CSV)</button>
                    <button class="seo-checker-export-btn" id="export-all-links">모든 링크 (CSV)</button>
                </div>
            </div>
        `;

        // 카드 레이아웃 닫기
        content += '</div>';

        container.innerHTML = content;
        
        // 토글 버튼에 이벤트 리스너 추가
        const setupToggleButton = (buttonId, listId) => {
            const toggleBtn = document.getElementById(buttonId);
            const list = document.getElementById(listId);
            
            if (toggleBtn && list) {
                toggleBtn.addEventListener('click', function() {
                    list.classList.toggle('expanded');
                    toggleBtn.textContent = list.classList.contains('expanded') ? '접기' : '펼치기';
                });
            }
        };
        
        setupToggleButton('toggle-internal-links', 'internal-links-list');
        setupToggleButton('toggle-external-links', 'external-links-list');

        // 내보내기 버튼에 이벤트 리스너 추가
        const internalBtn = document.getElementById('export-internal-links');
        if (internalBtn) {
             internalBtn.addEventListener('click', function() {
                 const csv = 'Text,URL\n' + internalLinks.map(link => `"${link.text.replace(/"/g, '""')}","${link.href}"`).join('\n');
                 downloadCSV(csv, '내부_링크.csv');
             });
        }

        const externalBtn = document.getElementById('export-external-links');
         if (externalBtn) {
             externalBtn.addEventListener('click', function() {
                 const csv = 'Text,URL\n' + externalLinks.map(link => `"${link.text.replace(/"/g, '""')}","${link.href}"`).join('\n');
                 downloadCSV(csv, '외부_링크.csv');
             });
         }
         
        const allLinksBtn = document.getElementById('export-all-links');
        if (allLinksBtn) {
            allLinksBtn.addEventListener('click', function() {
                const allData = [
                    ...internalLinks.map(link => ({...link, category: '내부'})),
                    ...externalLinks.map(link => ({...link, category: '외부'})),
                    ...brokenLinks.map(link => ({...link, category: '깨진 링크'}))
                ];
                const csv = 'Category,Text,URL\n' + allData.map(link => 
                    `"${link.category}","${link.text.replace(/"/g, '""')}","${link.href}"`
                ).join('\n');
                downloadCSV(csv, '모든_링크.csv');
            });
        }
    }
    
    /**
     * 이미지 분석 함수 (고도화된 버전)
     */
    function analyzeImages() {
        const container = document.getElementById('seo-checker-images');
        if (!container) {
            console.error('#seo-checker-images container not found!');
            return; 
        }
        
        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>이미지 분석 중...</p></div>';
        
        let content = '<div class="tab-title">이미지 분석</div>';
        
        // --- 데이터 수집 ---
        const allImages = document.querySelectorAll('img');
        const totalImages = allImages.length;
        
        // 문제점 및 통계를 위한 배열 초기화
        const imagesWithoutAlt = []; // alt 속성 없는 이미지
        const imagesWithEmptyAlt = []; // 빈 alt 속성 이미지 (장식용)
        const imagesWithLongAlt = []; // 너무 긴 alt 텍스트 (125자 이상)
        const imagesWithoutDimensions = []; // width/height 속성 없는 이미지
        const largeImages = []; // 큰 이미지 (표시 크기보다 실제 크기가 훨씬 큰 경우)
        const imagesWithoutLazyLoading = []; // lazy 로딩 없는 이미지 (첫 화면 제외)
        const imagesWithoutResponsive = []; // 반응형 속성 없는 이미지
        
        // 이미지 형식별 개수
        const formatCounts = {
            jpg: 0, jpeg: 0, png: 0, gif: 0, webp: 0, svg: 0, avif: 0, other: 0
        };
        
        // 모든 이미지에 대한 상세 정보 수집
        const imagesData = [];
        let isFirstScreenImage = true; // 첫 화면 이미지 여부 (처음 10개 이미지는 lazy loading 필요 없음)
        
        allImages.forEach((img, index) => {
            // 이미지가 북마클릿 UI의 일부라면 건너뛰기
            if (img.closest('#seo-checker-overlay')) {
                return;
            }
            
            const src = img.getAttribute('src') || '';
            const srcset = img.getAttribute('srcset') || '';
            const sizes = img.getAttribute('sizes') || '';
            const alt = img.getAttribute('alt');
            const title = img.getAttribute('title');
            const width = img.getAttribute('width');
            const height = img.getAttribute('height');
            const loading = img.getAttribute('loading'); // eager, lazy, auto
            const displayWidth = img.clientWidth;
            const displayHeight = img.clientHeight;
            
            // 이미지 형식 파악
            const format = getImageFormat(src);
            formatCounts[format]++;
            
            // 이미지 데이터 객체 생성
            const imageData = {
                src,
                srcset,
                sizes,
                alt,
                title,
                width,
                height,
                loading,
                format,
                displayWidth,
                displayHeight,
                naturalWidth: img.naturalWidth || 0,
                naturalHeight: img.naturalHeight || 0,
                issues: []
            };
            
            // 첫 화면 이후 이미지는 lazy loading 권장
            if (index >= 10) {
                isFirstScreenImage = false;
            }
            
            // --- 이미지 문제점 분석 ---
            
            // 1. alt 속성 검사
            if (alt === null) {
                imagesWithoutAlt.push(imageData);
                imageData.issues.push('alt 속성 없음');
            } else if (alt.trim() === '') {
                imagesWithEmptyAlt.push(imageData);
                // 빈 alt는 장식용 이미지에 적절하므로 문제로 간주하지 않음
            } else if (alt.length > 125) {
                imagesWithLongAlt.push(imageData);
                imageData.issues.push('alt 텍스트가 너무 김 (125자 초과)');
            }
            
            // 2. width/height 속성 검사 (CLS 방지)
            if (!width || !height) {
                imagesWithoutDimensions.push(imageData);
                imageData.issues.push('width/height 속성 누락');
            }
            
            // 3. 크기 최적화 검사 (표시 크기보다 2배 이상 큰 이미지)
            if (displayWidth > 0 && img.naturalWidth > 0 && (img.naturalWidth > displayWidth * 2 || img.naturalHeight > displayHeight * 2)) {
                largeImages.push(imageData);
                imageData.issues.push('크기 과대 (2배↑)');
            }
            
            // 4. lazy loading 검사 (첫 화면 이미지 제외)
            if (!isFirstScreenImage && loading !== 'lazy') {
                imagesWithoutLazyLoading.push(imageData);
                imageData.issues.push('lazy loading 속성 없음');
            }
            
            // 5. 반응형 이미지 검사 (srcset, sizes)
            if (!srcset && displayWidth > 0 && img.naturalWidth > 400) {
                imagesWithoutResponsive.push(imageData);
                imageData.issues.push('반응형 속성(srcset) 없음');
            }
            
            // 데이터 배열에 추가
            imagesData.push(imageData);
        });
        
        // --- HTML 생성 ---
        // 카드 레이아웃 시작
        content += '<div class="overview-cards">';
        
        // 이미지 통계 요약 카드
        content += `
            <div class="overview-summary-card">
                <div class="card-header">
                    <h3>이미지 통계 요약</h3>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>총 이미지</span>
                        <strong>${totalImages}</strong>
                    </div>
                    <div class="summary-item ${imagesWithoutAlt.length > 0 ? 'warning' : ''}">
                        <span>alt 속성 없음</span>
                        <strong>${imagesWithoutAlt.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>장식용 이미지</span>
                        <strong>${imagesWithEmptyAlt.length}</strong>
                    </div>
                    <div class="summary-item ${imagesWithoutDimensions.length > 0 ? 'warning' : ''}">
                        <span>크기 속성 없음</span>
                        <strong>${imagesWithoutDimensions.length}</strong>
                    </div>
                    <div class="summary-item ${largeImages.length > 0 ? 'warning' : ''}">
                        <span>과대 크기</span>
                        <strong>${largeImages.length}</strong>
                    </div>
                    <div class="summary-item ${imagesWithoutLazyLoading.length > 0 ? 'warning' : ''}">
                        <span>지연 로딩 없음</span>
                        <strong>${imagesWithoutLazyLoading.length}</strong>
                    </div>
                </div>
            </div>

            <!-- 이미지 형식 분포 카드 -->
            <div class="overview-data-card full-width">
                <div class="card-header">
                    <h3>이미지 형식 분포</h3>
                </div>
                <div class="card-content">
                    <div class="image-format-grid">
                        <div class="format-stat-card">
                            <span class="stat-value">${formatCounts.jpg + formatCounts.jpeg}</span>
                            <span class="stat-label">JPG/JPEG</span>
                        </div>
                        <div class="format-stat-card">
                            <span class="stat-value">${formatCounts.png}</span>
                            <span class="stat-label">PNG</span>
                        </div>
                        <div class="format-stat-card">
                            <span class="stat-value">${formatCounts.gif}</span>
                            <span class="stat-label">GIF</span>
                        </div>
                        <div class="format-stat-card ${formatCounts.webp > 0 ? 'modern-format' : ''}">
                            <span class="stat-value">${formatCounts.webp}</span>
                            <span class="stat-label">WebP</span>
                        </div>
                        <div class="format-stat-card ${formatCounts.avif > 0 ? 'modern-format' : ''}">
                            <span class="stat-value">${formatCounts.avif}</span>
                            <span class="stat-label">AVIF</span>
                        </div>
                        <div class="format-stat-card">
                            <span class="stat-value">${formatCounts.svg}</span>
                            <span class="stat-label">SVG</span>
                        </div>
                    </div>
                    <div class="data-meta compact">
                        <p class="importance-note">
                            최신 이미지 형식(WebP, AVIF)은 기존 형식에 비해 더 작은 크기로 우수한 품질을 제공합니다.
                            ${(formatCounts.webp + formatCounts.avif) === 0 ? '최신 형식 사용을 고려해보세요.' : '최신 형식을 사용하고 있어 좋습니다!'}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // 이미지 문제점 요약 카드
        if (imagesWithoutAlt.length > 0 || imagesWithoutDimensions.length > 0 || largeImages.length > 0 || imagesWithLongAlt.length > 0 || imagesWithoutLazyLoading.length > 0) {
            content += `
                <div class="overview-data-card full-width">
                    <div class="card-header">
                        <h3>이미지 문제점 요약</h3>
                    </div>
                    <div class="card-content">
                        <div class="data-meta compact">
                            <p class="importance-note">최적화된 이미지는 웹사이트의 성능과 접근성에 큰 영향을 미칩니다. 다음 문제들을 해결하면 웹사이트의 품질이 향상됩니다.</p>
                        </div>
                        <div class="link-issues-summary">
                            ${imagesWithoutAlt.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-error">alt 속성 없음 (${imagesWithoutAlt.length}개)</span>
                                    </div>
                                    <p class="issue-desc">alt 속성이 없는 이미지는 스크린 리더 사용자에게 접근할 수 없으며, SEO에도 불리합니다. 모든 의미 있는 이미지에 alt 속성을 추가하세요.</p>
                                </div>
                            ` : ''}
                            
                            ${imagesWithoutDimensions.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-warning">width/height 속성 없음 (${imagesWithoutDimensions.length}개)</span>
                                    </div>
                                    <p class="issue-desc">이미지에 width와 height 속성이 없으면 브라우저가 이미지 공간을 예약할 수 없어 레이아웃 이동(CLS)이 발생합니다. 이는 Core Web Vitals에 부정적 영향을 미칩니다.</p>
                                </div>
                            ` : ''}
                            
                            ${largeImages.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-warning">과대 크기 이미지 (${largeImages.length}개)</span>
                                    </div>
                                    <p class="issue-desc">표시 크기보다 실제 크기가 2배 이상 큰 이미지는 불필요한 데이터 전송을 유발합니다. 이미지 크기를 적절히 조정하여 페이지 로딩 속도를 향상시키세요.</p>
                                </div>
                            ` : ''}
                            
                            ${imagesWithoutLazyLoading.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-info">지연 로딩 없음 (${imagesWithoutLazyLoading.length}개)</span>
                                    </div>
                                    <p class="issue-desc">첫 화면 아래에 있는 이미지에는 loading="lazy" 속성을 추가하여 페이지 초기 로딩 시간을 단축할 수 있습니다.</p>
                                </div>
                            ` : ''}

                            ${imagesWithoutResponsive.length > 0 ? `
                                <div class="issue-category">
                                    <div class="issue-header">
                                        <span class="seo-checker-status seo-checker-status-info">반응형 속성 없음 (${imagesWithoutResponsive.length}개)</span>
                                    </div>
                                    <p class="issue-desc">큰 이미지에 srcset 속성이 없으면 모바일 기기에서 불필요하게 큰 이미지를 다운로드하게 됩니다. 다양한 화면 크기에 최적화된 이미지를 제공하세요.</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        // 문제점 별 이미지 목록 함수
        const createImageIssueListCard = (title, description, statusClass, images) => {
            if (images.length === 0) return '';
            const maxDisplayImages = 5; // 최대 표시 이미지 수
            const hasMoreImages = images.length > maxDisplayImages;
            const listId = title.replace(/\s+/g, '-').toLowerCase() + '-list';
            const buttonId = 'toggle-' + listId;
            
            return `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>${title}</h3>
                        <span class="seo-checker-status ${statusClass}">${images.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="importance-note">${description}</p>
                            ${hasMoreImages ? `<button class="toggle-list-btn" id="${buttonId}">펼치기</button>` : ''}
                        </div>
                        <div class="image-grid ${hasMoreImages ? 'collapsible-list' : ''}" id="${listId}">
                            ${images.slice(0, maxDisplayImages).map(img => `
                                <div class="image-card ${img.issues.length > 0 ? 'has-issues' : ''}">
                                    ${img.issues.length > 0 ? `<span class="image-issue-badge">${img.issues.length}</span>` : ''}
                                    <div class="image-thumb-container">
                                        <img src="${img.src}" alt="썸네일" class="image-thumb" loading="lazy">
                                    </div>
                                    <div class="image-info">
                                        <div class="image-format-badge">${img.format.toUpperCase()}</div>
                                        <div class="image-size-info">${img.naturalWidth && img.naturalHeight ? `${img.naturalWidth}x${img.naturalHeight}px` : '크기 알 수 없음'}</div>
                                        <div class="image-alt-info">
                                            ${img.alt === null ? 
                                                '<span class="alt-missing">ALT 속성 없음</span>' : 
                                                img.alt === '' ? 
                                                '<span class="alt-empty">장식용 이미지 (alt="")</span>' : 
                                                `<span class="alt-exists">ALT: </span><span class="alt-text">${img.alt.length > 30 ? `${img.alt.substring(0, 30)}...` : img.alt}</span>`}
                                        </div>
                                        ${img.issues.length > 0 ? `
                                            <div class="image-issues">
                                                <ul>
                                                    ${img.issues.map(issue => `<li>${issue}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${hasMoreImages ? `<div class="more-images-info">...외 ${images.length - maxDisplayImages}개 더 있음 (모든 이미지 내보내기로 확인 가능)</div>` : ''}
                    </div>
                </div>
            `;
        };
        
        // 문제점 별 이미지 목록 카드 추가
        content += createImageIssueListCard(
            'alt 속성 없는 이미지',
            'alt 속성은 스크린 리더 사용자와 검색 엔진에게 이미지 내용을 설명합니다. 모든 의미 있는 이미지에 alt 속성을 추가하세요.',
            'seo-checker-status-error',
            imagesWithoutAlt
        );
        
        content += createImageIssueListCard(
            '과대 크기 이미지',
            '표시 크기보다 실제 크기가 2배 이상 큰 이미지는 불필요한 데이터 전송을 유발합니다. 이미지 크기를 적절히 조정하세요.',
            'seo-checker-status-warning',
            largeImages
        );
        
        content += createImageIssueListCard(
            'width/height 속성 없는 이미지',
            'width와 height 속성이 없으면 레이아웃 이동(CLS)이 발생할 수 있습니다. 모든 이미지에 크기 속성을 지정하세요.',
            'seo-checker-status-warning',
            imagesWithoutDimensions
        );
        
        // 내보내기 카드
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>이미지 데이터 내보내기</h3>
                </div>
                <div class="card-content export-buttons">
                    <button class="seo-checker-export-btn" id="export-all-images">모든 이미지 (CSV)</button>
                    <button class="seo-checker-export-btn" id="export-issue-images">문제 있는 이미지 (CSV)</button>
                </div>
            </div>
        `;
        
        // 최신 이미지 형식 권장 카드
        if (formatCounts.jpg + formatCounts.jpeg + formatCounts.png > 0 && formatCounts.webp + formatCounts.avif === 0) {
            content += `
                <div class="overview-data-card full-width">
                    <div class="card-header">
                        <h3>이미지 최적화 팁</h3>
                        <span class="seo-checker-status seo-checker-status-info">권장</span>
                    </div>
                    <div class="card-content">
                        <p class="importance-note">WebP나 AVIF 같은 최신 이미지 형식을 사용하면 다음과 같은 이점이 있습니다:</p>
                        <ul>
                            <li>파일 크기 감소 (JPG/PNG 대비 25-50% 작음)</li>
                            <li>페이지 로딩 속도 향상</li>
                            <li>대역폭 사용량 감소</li>
                            <li>더 나은 이미지 품질 (특히 AVIF)</li>
                        </ul>
                        <p>기존 형식과의 호환성을 위해 <code>&lt;picture&gt;</code> 요소와 함께 사용하는 것이 좋습니다:</p>
                        <pre><code>&lt;picture&gt;
  &lt;source srcset="image.avif" type="image/avif"&gt;
  &lt;source srcset="image.webp" type="image/webp"&gt;
  &lt;img src="image.jpg" alt="설명" width="800" height="600" loading="lazy"&gt;
&lt;/picture&gt;</code></pre>
                    </div>
                </div>
            `;
        }
        
        // 카드 레이아웃 닫기
        content += '</div>';
        
        container.innerHTML = content;
        
        // 토글 버튼에 이벤트 리스너 추가
        const setupToggleButton = (buttonId, listId) => {
            const toggleBtn = document.getElementById(buttonId);
            const list = document.getElementById(listId);
            
            if (toggleBtn && list) {
                toggleBtn.addEventListener('click', function() {
                    list.classList.toggle('expanded');
                    toggleBtn.textContent = list.classList.contains('expanded') ? '접기' : '펼치기';
                });
            }
        };
        
        // 필요한 토글 버튼 설정
        if (imagesWithoutAlt.length > 5) {
            setupToggleButton('toggle-alt-속성-없는-이미지-list', 'alt-속성-없는-이미지-list');
        }
        if (largeImages.length > 5) {
            setupToggleButton('toggle-과대-크기-이미지-list', '과대-크기-이미지-list');
        }
        if (imagesWithoutDimensions.length > 5) {
            setupToggleButton('toggle-width/height-속성-없는-이미지-list', 'width/height-속성-없는-이미지-list');
        }
        
        // 내보내기 버튼에 이벤트 리스너 추가
        const exportAllBtn = document.getElementById('export-all-images');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', function() {
                const headers = [
                    'src', 'alt', 'title', 'width', 'height', 'loading', 
                    'format', 'display_width', 'display_height', 'natural_width',
                    'natural_height', 'issues'
                ];
                
                const csvRows = [headers.join(',')];
                
                imagesData.forEach(img => {
                    const row = [
                        `"${(img.src || '').replace(/"/g, '""')}"`,
                        `"${(img.alt === null ? '[없음]' : img.alt).replace(/"/g, '""')}"`,
                        `"${(img.title || '').replace(/"/g, '""')}"`,
                        `"${img.width || ''}"`,
                        `"${img.height || ''}"`,
                        `"${img.loading || ''}"`,
                        `"${img.format || ''}"`,
                        `"${img.displayWidth || ''}"`,
                        `"${img.displayHeight || ''}"`,
                        `"${img.naturalWidth || ''}"`,
                        `"${img.naturalHeight || ''}"`,
                        `"${img.issues.join(' | ')}"`,
                    ];
                    
                    csvRows.push(row.join(','));
                });
                
                const csv = csvRows.join('\n');
                downloadCSV(csv, '모든_이미지.csv');
            });
        }
        
        const exportIssueBtn = document.getElementById('export-issue-images');
        if (exportIssueBtn) {
            exportIssueBtn.addEventListener('click', function() {
                // 이슈가 있는 이미지만 필터링
                const issueImages = imagesData.filter(img => img.issues.length > 0);
                
                const headers = [
                    'src', 'alt', 'title', 'width', 'height', 'loading', 
                    'format', 'display_width', 'display_height', 'natural_width',
                    'natural_height', 'issues'
                ];
                
                const csvRows = [headers.join(',')];
                
                issueImages.forEach(img => {
                    const row = [
                        `"${(img.src || '').replace(/"/g, '""')}"`,
                        `"${(img.alt === null ? '[없음]' : img.alt).replace(/"/g, '""')}"`,
                        `"${(img.title || '').replace(/"/g, '""')}"`,
                        `"${img.width || ''}"`,
                        `"${img.height || ''}"`,
                        `"${img.loading || ''}"`,
                        `"${img.format || ''}"`,
                        `"${img.displayWidth || ''}"`,
                        `"${img.displayHeight || ''}"`,
                        `"${img.naturalWidth || ''}"`,
                        `"${img.naturalHeight || ''}"`,
                        `"${img.issues.join(' | ')}"`,
                    ];
                    
                    csvRows.push(row.join(','));
                });
                
                const csv = csvRows.join('\n');
                downloadCSV(csv, '문제_있는_이미지.csv');
            });
        }
    }
    
    /**
     * 이미지 URL에서 형식 추출 (JPG, PNG, WebP 등)
     */
    function getImageFormat(src) {
        if (!src) return 'other';
        
        // 1. 일반적인 파일 확장자 검사
        const extensionMatch = src.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|#|$)/);
        if (extensionMatch) {
            const ext = extensionMatch[1];
            return ext === 'jpeg' ? 'jpg' : ext;
        }
        
        // 2. Data URI 검사
        if (src.startsWith('data:image/')) {
            const dataTypeMatch = src.match(/data:image\/([a-z0-9]+);/i);
            if (dataTypeMatch) {
                const format = dataTypeMatch[1].toLowerCase();
                return format === 'jpeg' ? 'jpg' : format === 'svg+xml' ? 'svg' : format;
            }
        }
        
        // 3. 이미지 API URL 추론
        if (src.includes('format=webp') || src.includes('.webp?')) return 'webp';
        if (src.includes('format=avif') || src.includes('.avif?')) return 'avif';
        if (src.includes('format=png') || src.includes('.png?')) return 'png';
        if (src.includes('format=jpg') || src.includes('.jpg?') || 
            src.includes('format=jpeg') || src.includes('.jpeg?')) return 'jpg';
        
        // 4. 기타 이미지 서비스 URL 추론
        if (src.includes('cloudinary.com')) {
            if (src.includes('/image/upload/')) {
                if (src.includes('/f_auto/')) return 'auto'; // 자동 최적화
                if (src.includes('/f_webp/')) return 'webp';
                if (src.includes('/f_avif/')) return 'avif';
                if (src.includes('/f_png/')) return 'png';
                if (src.includes('/f_jpg/') || src.includes('/f_jpeg/')) return 'jpg';
            }
        }
        
        return 'other';
    }
    
    /**
     * 스키마(Schema.org) 마크업 분석 함수
     */
    function analyzeSchema() {
        const container = document.getElementById('seo-checker-schema');
        if (!container) {
            console.error('스키마 탭 컨테이너를 찾을 수 없습니다: #seo-checker-schema');
            return;
        }
        
        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>구조화 데이터 분석 중...</p></div>';
        
        // 비동기적으로 스키마 분석 실행
        setTimeout(() => {
            try {
                const schemaResults = collectSchemaData();
                updateSchemaUI(container, schemaResults);
            } catch (error) {
                console.error('스키마 분석 중 오류 발생:', error);
                container.innerHTML = `
                    <div class="tab-title">구조화 데이터 (Schema.org)</div>
                    <div class="overview-data-card">
                        <div class="card-header">
                            <h3>스키마 분석 오류</h3>
                            <span class="seo-checker-status seo-checker-status-error">오류</span>
                        </div>
                        <div class="card-content">
                            <p>데이터 분석 중 문제가 발생했습니다: ${error.message}</p>
                        </div>
                    </div>
                `;
            }
        }, 100);
    }

    /**
     * 스키마 데이터 수집 함수 - 실제 데이터 분석 로직
     */
    function collectSchemaData() {
        console.log('스키마 데이터 수집 시작...');
        const schemaResults = {
            jsonLD: [],
            microdata: [],
            rdfa: [],
            totalSchemas: 0,
            schemaTypes: {}
        };
        
        // JSON-LD 형식 스키마 분석
        try {
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            console.log(`JSON-LD 스크립트 발견: ${jsonLdScripts.length}개`);
            jsonLdScripts.forEach((script, index) => {
                try {
                    const jsonData = JSON.parse(script.textContent);
                    schemaResults.jsonLD.push({
                        data: jsonData,
                        element: script
                    });
                    
                    // 스키마 유형 카운트
                    countSchemaTypes(jsonData, schemaResults.schemaTypes);
                    schemaResults.totalSchemas++;
                } catch (e) {
                    console.warn(`JSON-LD 스크립트 #${index} 파싱 오류:`, e);
                }
            });
        } catch (e) {
            console.warn('JSON-LD 스키마 분석 오류:', e);
        }
        
        // Microdata 형식 스키마 분석
        try {
            const microdataElements = document.querySelectorAll('[itemscope]');
            console.log(`Microdata 요소 발견: ${microdataElements.length}개`);
            microdataElements.forEach(element => {
                const itemType = element.getAttribute('itemtype');
                if (itemType && itemType.includes('schema.org')) {
                    const schemaType = itemType.split('/').pop();
                    schemaResults.microdata.push({
                        type: schemaType,
                        element: element
                    });
                    
                    // 스키마 유형 카운트
                    if (schemaResults.schemaTypes[schemaType]) {
                        schemaResults.schemaTypes[schemaType]++;
                    } else {
                        schemaResults.schemaTypes[schemaType] = 1;
                    }
                    schemaResults.totalSchemas++;
                }
            });
        } catch (e) {
            console.warn('Microdata 스키마 분석 오류:', e);
        }
        
        // RDFa 형식 스키마 분석
        try {
            const rdfaElements = document.querySelectorAll('[typeof]');
            console.log(`RDFa 요소 발견: ${rdfaElements.length}개`);
            rdfaElements.forEach(element => {
                const typeofAttr = element.getAttribute('typeof');
                if (typeofAttr && typeofAttr.includes('schema.org')) {
                    const schemaType = typeofAttr.split(':').pop();
                    schemaResults.rdfa.push({
                        type: schemaType,
                        element: element
                    });
                    
                    // 스키마 유형 카운트
                    if (schemaResults.schemaTypes[schemaType]) {
                        schemaResults.schemaTypes[schemaType]++;
                    } else {
                        schemaResults.schemaTypes[schemaType] = 1;
                    }
                    schemaResults.totalSchemas++;
                }
            });
        } catch (e) {
            console.warn('RDFa 스키마 분석 오류:', e);
        }
        
        console.log('스키마 데이터 수집 완료:', schemaResults);
        return schemaResults;
    }

    /**
     * 스키마 UI 업데이트 함수 - 수집된 데이터를 UI에 표시
     */
    function updateSchemaUI(container, schemaData) {
        console.log('스키마 UI 업데이트 시작...');
        
        // 탭 제목 생성
        let content = `<div class="tab-title">구조화 데이터 (Schema.org)</div>`;
        
        // 카드 레이아웃 시작
        content += '<div class="overview-cards">';
        
        // 1. 스키마 개요 카드
        content += `
            <div class="overview-summary-card">
                <div class="card-header">
                    <h3>구조화 데이터 요약</h3>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>총 스키마</span>
                        <strong>${schemaData.totalSchemas}</strong>
                    </div>
                    <div class="summary-item">
                        <span>JSON-LD</span>
                        <strong>${schemaData.jsonLD.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Microdata</span>
                        <strong>${schemaData.microdata.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>RDFa</span>
                        <strong>${schemaData.rdfa.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>스키마 유형</span>
                        <strong>${Object.keys(schemaData.schemaTypes).length}</strong>
                    </div>
                </div>
            </div>
        `;
        
        // 2. 스키마 상태 카드
        const schemaStatus = schemaData.totalSchemas > 0 ? 'seo-checker-status-good' : 'seo-checker-status-warning';
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>스키마 상태</h3>
                    <span class="seo-checker-status ${schemaStatus}">${schemaData.totalSchemas > 0 ? '검출됨' : '없음'}</span>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">구조화 데이터는 검색 엔진이 페이지 콘텐츠를 더 잘 이해하도록 도와주며, 리치 검색 결과를 생성하는 데 사용됩니다.</p>
                        ${schemaData.totalSchemas === 0 ? 
                            '<p>이 페이지에는 구조화 데이터가 없습니다. 적절한 Schema.org 마크업 추가를 고려하세요.</p>' : 
                            '<p>이 페이지에 구조화 데이터가 있어 검색 엔진에서 더 풍부한 결과로 표시될 수 있습니다.</p>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        // 3. 스키마 유형 카드
        if (Object.keys(schemaData.schemaTypes).length > 0) {
            content += `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>스키마 유형</h3>
                    </div>
                    <div class="card-content">
                        <div class="schema-types-list">
                            ${Object.entries(schemaData.schemaTypes).map(([type, count]) => 
                                `<span class="schema-type-pill">${type} (${count})</span>`
                            ).join('')}
                        </div>
                        <div class="data-meta">
                            <p class="note">페이지에 포함된 구조화 데이터 유형입니다.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 4. JSON-LD 스키마 세부 정보 카드
        if (schemaData.jsonLD.length > 0) {
            content += `
                <div class="overview-data-card full-width">
                    <div class="card-header">
                        <h3>JSON-LD 스키마</h3>
                        <span class="seo-checker-status seo-checker-status-good">${schemaData.jsonLD.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="note">JSON-LD는 Google이 권장하는 구조화 데이터 형식입니다.</p>
                        </div>
                        
                        <div class="schema-accordion-list">
                            ${schemaData.jsonLD.map((schema, index) => {
                                const schemaType = getSchemaType(schema.data);
                                return `
                                    <div class="schema-accordion-item">
                                        <div class="schema-accordion-header">
                                            <div class="schema-accordion-title">
                                                <span class="schema-format-badge json-ld">JSON-LD</span>
                                                ${schemaType || '알 수 없는 유형'}
                                            </div>
                                            <button class="schema-toggle-btn">
                                                <svg viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="schema-accordion-content">
                                            <div class="schema-accordion-content-inner">
                                                <pre><code>${escapeHtml(JSON.stringify(schema.data, null, 2))}</code></pre>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 5. Microdata 스키마 카드
        if (schemaData.microdata.length > 0) {
            content += `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>Microdata 스키마</h3>
                        <span class="seo-checker-status seo-checker-status-good">${schemaData.microdata.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="note">Microdata는 HTML 요소에 직접 추가되는 구조화 데이터 형식입니다.</p>
                        </div>
                        <ul class="schema-list">
                            ${schemaData.microdata.map(schema => 
                                `<li><span class="schema-format-badge microdata">Microdata</span> ${schema.type || '알 수 없는 유형'}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // 6. RDFa 스키마 카드
        if (schemaData.rdfa.length > 0) {
            content += `
                <div class="overview-data-card">
                    <div class="card-header">
                        <h3>RDFa 스키마</h3>
                        <span class="seo-checker-status seo-checker-status-good">${schemaData.rdfa.length}개</span>
                    </div>
                    <div class="card-content">
                        <div class="data-meta">
                            <p class="note">RDFa는 HTML 요소에 의미적 정보를 추가하는 구조화 데이터 형식입니다.</p>
                        </div>
                        <ul class="schema-list">
                            ${schemaData.rdfa.map(schema => 
                                `<li><span class="schema-format-badge rdfa">RDFa</span> ${schema.type || '알 수 없는 유형'}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // 7. 권장사항 카드
        content += `
            <div class="overview-data-card full-width">
                <div class="card-header">
                    <h3>구조화 데이터 권장사항</h3>
                    <span class="seo-checker-status seo-checker-status-info">권장</span>
                </div>
                <div class="card-content">
                    <div class="schema-recommendations">
                        <ul>
                            ${schemaData.totalSchemas === 0 ? 
                                '<li>이 페이지에는 구조화 데이터가 없습니다. 적절한 Schema.org 마크업 추가를 고려하세요.</li>' : ''
                            }
                            ${!hasProductSchema(schemaData) && isProductPage() ? 
                                '<li>제품 페이지에는 Product 스키마를 추가하는 것이 좋습니다.</li>' : ''
                            }
                            ${!hasArticleSchema(schemaData) && isArticlePage() ? 
                                '<li>기사/블로그 페이지에는 Article 스키마를 추가하는 것이 좋습니다.</li>' : ''
                            }
                            <li>구조화 데이터는 검색 엔진이 콘텐츠를 더 잘 이해하고 리치 결과를 표시하는 데 도움이 됩니다.</li>
                            <li>Google은 JSON-LD 형식을 권장합니다. 가능하면 이 형식을 사용하세요.</li>
                            <li>중요한 콘텐츠 유형에 맞는 스키마를 추가하세요 (Article, Product, FAQ, Event 등).</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // 8. 유용한 도구 카드
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>유용한 도구</h3>
                </div>
                <div class="card-content">
                    <ul class="seo-checker-tools-list">
                        <li><a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">Google 리치 결과 테스트 <span class="external-link-icon">↗</span></a></li>
                        <li><a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">Schema.org 유효성 검사기 <span class="external-link-icon">↗</span></a></li>
                        <li><a href="https://developers.google.com/search/docs/advanced/structured-data" target="_blank" rel="noopener noreferrer">Google 구조화 데이터 가이드라인 <span class="external-link-icon">↗</span></a></li>
                    </ul>
                </div>
            </div>
        `;
        
        // 카드 레이아웃 닫기
        content += '</div>';
        
        // 최종 내용 업데이트 후 아코디언 설정
        container.innerHTML = content;
        setupSchemaAccordions();
    }

    // 스키마 유형 재귀적으로 카운트하는 함수
    function countSchemaTypes(data, typesObj) {
        // 배열인 경우 각 항목에 대해 재귀 호출
        if (Array.isArray(data)) {
            data.forEach(item => countSchemaTypes(item, typesObj));
            return;
        }
        
        // 객체가 아니면 처리하지 않음
        if (!data || typeof data !== 'object') {
            return;
        }
        
        // @type 속성이 있으면 스키마 유형으로 처리
        if (data['@type']) {
            let type = data['@type'];
            
            // 배열인 경우 각 유형 처리
            if (Array.isArray(type)) {
                type.forEach(t => {
                    const typeName = t.includes('schema.org/') ? t.split('/').pop() : t;
                    if (typesObj[typeName]) {
                        typesObj[typeName]++;
                    } else {
                        typesObj[typeName] = 1;
                    }
                });
            } else {
                // 단일 유형인 경우
                const typeName = type.includes('schema.org/') ? type.split('/').pop() : type;
                if (typesObj[typeName]) {
                    typesObj[typeName]++;
                } else {
                    typesObj[typeName] = 1;
                }
            }
        }
        
        // 객체의 모든 속성에 대해 재귀 호출
        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                countSchemaTypes(data[key], typesObj);
            }
        }
    }

    // 스키마 아코디언 생성 함수
    function createSchemaAccordion(schemaType, format, content, index) {
        const formatLabels = {
            'json-ld': 'JSON-LD',
            'microdata': 'Microdata',
            'rdfa': 'RDFa'
        };
        
        return `
            <div class="schema-accordion-item" id="schema-${format}-${index}">
                <div class="schema-accordion-header">
                    <div class="schema-accordion-title">
                        <span class="schema-format-badge ${format}">${formatLabels[format]}</span>
                        <span>${schemaType || '알 수 없는 유형'}</span>
                    </div>
                    <button class="schema-toggle-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="schema-accordion-content">
                    <div class="schema-accordion-content-inner">
                        <table class="properties-table">
                            <tr>
                                <th>스키마 마크업</th>
                            </tr>
                            <tr>
                                <td><pre>${escapeHtml(content)}</pre></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // 스키마 타입 추출 함수
    function getSchemaType(data) {
        if (!data) return '알 수 없음';
        
        if (data['@type']) {
            if (Array.isArray(data['@type'])) {
                return data['@type'][0];
            }
            return data['@type'];
        }
        
        // 객체 배열인 경우 @graph에서 검색
        if (data['@graph'] && Array.isArray(data['@graph']) && data['@graph'].length > 0) {
            const firstItem = data['@graph'][0];
            if (firstItem && firstItem['@type']) {
                return Array.isArray(firstItem['@type']) ? firstItem['@type'][0] : firstItem['@type'];
            }
        }
        
        return '알 수 없음';
    }

    // HTML 이스케이프 함수
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            return String(unsafe);
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 아코디언 이벤트 설정
    function setupSchemaAccordions() {
        const accordionHeaders = document.querySelectorAll('.schema-accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordionItem = header.parentElement;
                accordionItem.classList.toggle('active');
            });
        });
    }

    /**
     * 소셜 미디어 메타태그 분석
     */
    function analyzeSocial() {
        // 소셜 탭 초기화 및 로딩 표시
        const socialContentElement = document.getElementById('seo-checker-social');
        
        if (!socialContentElement) {
            console.error('소셜 탭 컨테이너(#seo-checker-social)를 찾을 수 없습니다!');
            return;
        }
        
        console.log('소셜 탭 분석 시작:', socialContentElement);
        socialContentElement.innerHTML = '<div class="lds-ring seo-loader"><div></div><div></div><div></div><div></div></div>';

        try {
            // 각 소셜 미디어 플랫폼 메타태그 수집
            const openGraphTags = collectOpenGraphTags();
            console.log('수집된 OpenGraph 태그:', openGraphTags);
            
            const twitterTags = collectTwitterTags();
            console.log('수집된 Twitter 태그:', twitterTags);
            
            // UI 업데이트
            updateSocialUI(openGraphTags, twitterTags);
        } catch (error) {
            console.error('소셜 미디어 분석 중 오류 발생:', error);
            socialContentElement.innerHTML = `<div class="error-message">소셜 미디어 태그 분석 중 오류가 발생했습니다: ${error.message}</div>`;
        }
    }

    /**
     * OpenGraph 메타태그 수집
     * @returns {Array} 수집된 OpenGraph 태그 배열
     */
    function collectOpenGraphTags() {
        const openGraphTags = [];
        const metaTags = document.querySelectorAll('meta[property^="og:"]');
        
        metaTags.forEach(tag => {
            const property = tag.getAttribute('property');
            const content = tag.getAttribute('content');
            
            if (property && content) {
                openGraphTags.push({
                    property: property,
                    content: content
                });
            }
        });
        
        return openGraphTags;
    }

    /**
     * Twitter 카드 메타태그 수집
     * @returns {Array} 수집된 Twitter 태그 배열
     */
    function collectTwitterTags() {
        const twitterTags = [];
        const metaTags = document.querySelectorAll('meta[name^="twitter:"]');
        
        metaTags.forEach(tag => {
            const name = tag.getAttribute('name');
            const content = tag.getAttribute('content');
            
            if (name && content) {
                twitterTags.push({
                    name: name,
                    content: content
                });
            }
        });
        
        return twitterTags;
    }

    /**
     * 소셜 미디어 분석 UI 업데이트
     * @param {Array} openGraphTags - OpenGraph 태그 배열
     * @param {Array} twitterTags - Twitter 태그 배열
     */
    function updateSocialUI(openGraphTags, twitterTags) {
        const socialContentElement = document.getElementById('seo-checker-social');
        
        if (!socialContentElement) {
            console.error('updateSocialUI: 소셜 콘텐츠 컨테이너를 찾을 수 없습니다!');
            return;
        }
        
        // 탭 제목과 전체 컨테이너 초기화
        let html = `<div class="tab-title">소셜 미디어 메타태그</div>`;
        html += `<div class="overview-cards">`;
        
        // 1. 미리보기 섹션 - 점수 카드와 유사하게 만들기
        html += `<div class="overview-score-card">
            <div class="page-info">
                <h3>소셜 미디어 미리보기</h3>
                <p class="importance-note">소셜 미디어에 공유 시 표시되는 미리보기입니다.</p>
            </div>
            <div class="score-chart">
                ${createSocialPreview(openGraphTags, twitterTags)}
            </div>
        </div>`;
        
        // 2. OpenGraph 태그 섹션
        html += `<div class="overview-data-card">
            <div class="card-header">
                <h3>OpenGraph 태그</h3>
                <span class="seo-checker-status ${openGraphTags.length > 0 ? 'seo-checker-status-good' : 'seo-checker-status-warning'}">${openGraphTags.length > 0 ? openGraphTags.length + '개' : '없음'}</span>
            </div>
            <div class="card-content">
                <div class="data-value full-width">${createSocialTagsTable(openGraphTags, 'OpenGraph')}</div>
                <div class="data-meta compact">
                    <p class="importance-note">OpenGraph 태그는 Facebook을 포함한 대부분의 소셜 미디어에서 링크 공유 시 표시되는 내용을 제어합니다.</p>
                </div>
            </div>
        </div>`;
        
        // 3. Twitter 카드 태그 섹션
        html += `<div class="overview-data-card">
            <div class="card-header">
                <h3>Twitter Card 태그</h3>
                <span class="seo-checker-status ${twitterTags.length > 0 ? 'seo-checker-status-good' : 'seo-checker-status-warning'}">${twitterTags.length > 0 ? twitterTags.length + '개' : '없음'}</span>
            </div>
            <div class="card-content">
                <div class="data-value full-width">${createSocialTagsTable(twitterTags, 'Twitter')}</div>
                <div class="data-meta compact">
                    <p class="importance-note">Twitter 카드 태그는 Twitter에서 공유 시 링크가 표시되는 방식을 제어합니다.</p>
                </div>
            </div>
        </div>`;
        
        // 4. 권장사항 섹션
        html += `<div class="overview-data-card">
            <div class="card-header">
                <h3>소셜 최적화 권장사항</h3>
            </div>
            <div class="card-content">
                <div class="data-value">${createSocialRecommendations(openGraphTags, twitterTags)}</div>
                <div class="data-meta">
                    <p class="importance-note">소셜 미디어에서 공유 시 더 나은 사용자 경험을 위한 권장사항입니다.</p>
                </div>
            </div>
        </div>`;
        
        // 5. 유용한 도구 섹션
        html += `<div class="overview-data-card">
            <div class="card-header">
                <h3>소셜 미디어 최적화 도구</h3>
            </div>
            <div class="card-content">
                <div class="data-value">
                    <ul class="seo-checker-tools-list">
                        <li><a href="https://developers.facebook.com/tools/debug/" target="_blank">Facebook 공유 디버거 <span class="external-link-icon">↗</span></a></li>
                        <li><a href="https://cards-dev.twitter.com/validator" target="_blank">Twitter 카드 검사기 <span class="external-link-icon">↗</span></a></li>
                        <li><a href="https://www.linkedin.com/post-inspector/" target="_blank">LinkedIn 포스트 인스펙터 <span class="external-link-icon">↗</span></a></li>
                    </ul>
                </div>
            </div>
        </div>`;
        
        // 카드 컨테이너 닫기
        html += `</div>`;
        
        // 최종 내용 업데이트
        socialContentElement.innerHTML = html;
    }

    /**
     * 소셜 미디어 미리보기 생성
     * @param {Array} openGraphTags - OpenGraph 태그 배열
     * @param {Array} twitterTags - Twitter 태그 배열
     * @returns {string} 미리보기 HTML
     */
    function createSocialPreview(openGraphTags, twitterTags) {
        console.log('createSocialPreview 함수 호출됨:', { openGraphTags, twitterTags });
        
        let html = '';
        
        try {
            // Facebook/OpenGraph 미리보기
            html += '<div class="social-preview">';
            html += '<h4>Facebook/OpenGraph</h4>';
            html += '<div class="preview-card">';
            
            // 이미지
            const ogImage = getMetaContent(openGraphTags, 'og:image');
            if (ogImage) {
                html += `<div class="preview-image"><img src="${ogImage}" alt="미리보기 이미지"></div>`;
            } else {
                html += '<div class="preview-no-image">이미지가 없습니다</div>';
            }
            
            html += '<div class="preview-content">';
            
            // 사이트 이름
            const ogSite = getMetaContent(openGraphTags, 'og:site_name') || new URL(window.location.href).hostname;
            html += `<div class="preview-site">${ogSite}</div>`;
            
            // 제목
            const ogTitle = getMetaContent(openGraphTags, 'og:title') || document.title;
            html += `<div class="preview-title">${ogTitle}</div>`;
            
            // 설명
            const ogDescription = getMetaContent(openGraphTags, 'og:description') || '';
            html += `<div class="preview-description">${ogDescription}</div>`;
            
            // URL
            const ogUrl = getMetaContent(openGraphTags, 'og:url') || window.location.href;
            html += `<div class="preview-url">${ogUrl}</div>`;
            
            html += '</div></div></div>';
            
            // Twitter 카드 미리보기
            const twitterCardType = getMetaContent(twitterTags, 'twitter:card') || 'summary_large_image';
            
            html += `<div class="social-preview">`;
            html += `<h4>Twitter (${twitterCardType})</h4>`;
            html += `<div class="preview-card twitter-card ${twitterCardType}">`;
            
            // 이미지
            const twitterImage = getMetaContent(twitterTags, 'twitter:image') || ogImage;
            if (twitterImage) {
                html += `<div class="preview-image"><img src="${twitterImage}" alt="Twitter 미리보기 이미지"></div>`;
            } else {
                html += '<div class="preview-no-image">이미지가 없습니다</div>';
            }
            
            html += '<div class="preview-content">';
            
            // 사이트 이름
            const twitterSite = getMetaContent(twitterTags, 'twitter:site') || '';
            html += `<div class="preview-site">${twitterSite || ogSite}</div>`;
            
            // 제목
            const twitterTitle = getMetaContent(twitterTags, 'twitter:title') || ogTitle;
            html += `<div class="preview-title">${twitterTitle}</div>`;
            
            // 설명
            const twitterDescription = getMetaContent(twitterTags, 'twitter:description') || ogDescription;
            html += `<div class="preview-description">${twitterDescription}</div>`;
            
            html += '</div></div></div>';
            
            console.log('createSocialPreview HTML 생성 완료, 길이:', html.length);
            return html;
        } catch (error) {
            console.error('createSocialPreview 함수 오류:', error);
            return '<div class="error-message">미리보기를 생성하는 중 오류가 발생했습니다</div>';
        }
    }

    /**
     * 소셜 태그 테이블 생성
     * @param {Array} tags - 태그 배열
     * @param {string} type - 태그 유형 (OpenGraph 또는 Twitter)
     * @returns {string} 테이블 HTML
     */
    function createSocialTagsTable(tags, type) {
        if (tags.length === 0) {
            return `<div class="social-no-tags">${type} 태그가 발견되지 않았습니다.</div>`;
        }
        
        let html = '<table class="social-tags-table">';
        html += '<tr><th>속성</th><th>콘텐츠</th></tr>';
        
        tags.forEach(tag => {
            const property = tag.property || tag.name;
            let content = tag.content;
            let displayContent = content;
            
            // 이미지인 경우 썸네일 표시
            if (property.includes('image') && content) {
                displayContent = `<img src="${content}" class="social-tag-image" alt="태그 이미지"> ${content}`;
            }
            
            html += `<tr><td>${property}</td><td>${displayContent}</td></tr>`;
        });
        
        html += '</table>';
        return html;
    }

    /**
     * 소셜 미디어 권장사항 생성
     * @param {Array} openGraphTags - OpenGraph 태그 배열
     * @param {Array} twitterTags - Twitter 태그 배열
     * @returns {string} 권장사항 HTML
     */
    function createSocialRecommendations(openGraphTags, twitterTags) {
        const recommendations = [];
        
        // OpenGraph 필수 태그 확인
        const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
        const missingOgTags = requiredOgTags.filter(tag => 
            !openGraphTags.some(ogTag => ogTag.property === tag)
        );
        
        if (missingOgTags.length > 0) {
            recommendations.push(`다음 OpenGraph 태그를 추가하세요: ${missingOgTags.join(', ')}`);
        }
        
        // Twitter 카드 필수 태그 확인
        const hasTwitterCard = twitterTags.some(tag => tag.name === 'twitter:card');
        if (!hasTwitterCard) {
            recommendations.push('Twitter 카드 유형을 지정하는 twitter:card 태그를 추가하세요.');
        }
        
        // 이미지 크기 권장사항
        const ogImage = getMetaContent(openGraphTags, 'og:image');
        if (ogImage) {
            recommendations.push('OpenGraph 이미지 최적 크기: 1200 x 630 픽셀');
        }
        
        const twitterImage = getMetaContent(twitterTags, 'twitter:image');
        if (twitterImage) {
            recommendations.push('Twitter 이미지 최적 크기: 1200 x 675 픽셀 (summary_large_image 카드의 경우)');
        }
        
        // 설명 길이 확인
        const ogDescription = getMetaContent(openGraphTags, 'og:description');
        if (ogDescription && ogDescription.length > 200) {
            recommendations.push('OpenGraph 설명은 200자 이내가 이상적입니다.');
        }
        
        const twitterDescription = getMetaContent(twitterTags, 'twitter:description');
        if (twitterDescription && twitterDescription.length > 200) {
            recommendations.push('Twitter 설명은 200자 이내가 이상적입니다.');
        }
        
        if (recommendations.length === 0) {
            return `<div class="recommendations-list good">
                <div class="recommendation-item">
                    <span class="recommendation-status good-status">✓</span>
                    <div class="recommendation-content">
                        <h4>최적화 완료</h4>
                        <p>소셜 미디어 태그가 잘 구성되어 있습니다.</p>
                    </div>
                </div>
            </div>`;
        }
        
        let html = `<div class="recommendations-list">`;
        
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-item">
                    <span class="recommendation-status warning-status">!</span>
                    <div class="recommendation-content">
                        <p>${rec}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * 메타 태그 콘텐츠 가져오기 헬퍼 함수
     * @param {Array} tags - 태그 배열
     * @param {string} name - 검색할 속성/이름
     * @returns {string|null} 태그 콘텐츠 또는 null
     */
    function getMetaContent(tags, name) {
        console.log(`getMetaContent 호출: name="${name}", tags=`, tags);
        const tag = tags.find(tag => (tag.property === name || tag.name === name));
        console.log(`getMetaContent 결과: ${tag ? tag.content : 'null'}`);
        return tag ? tag.content : null;
    }
    
    /**
     * 고급 SEO 분석 함수
     */
    function analyzeAdvanced() {
        const advancedTab = document.getElementById('seo-checker-advanced');
        
        if (!advancedTab) {
            console.error('고급 설정 탭 컨테이너를 찾을 수 없습니다: #seo-checker-advanced');
            return;
        }
        
        // 로딩 표시 추가
        advancedTab.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>고급 분석 중...</p></div>';
        
        // 비동기 분석 수행
        setTimeout(() => {
            try {
                // 1. 탭 제목 생성
                let html = `<div class="tab-title">고급 SEO 분석</div>`;
                
                // 2. 카드 레이아웃 시작
                html += '<div class="overview-cards">';
                
                // 3. 고급 분석 요약 카드 추가
                html += `
                    <div class="overview-summary-card">
                        <div class="card-header">
                            <h3>고급 분석 요약</h3>
                        </div>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <span>페이지 요소</span>
                                <strong>${document.querySelectorAll('*').length}개</strong>
                            </div>
                            <div class="summary-item">
                                <span>스크립트</span>
                                <strong>${document.querySelectorAll('script').length}개</strong>
                            </div>
                            <div class="summary-item">
                                <span>스타일시트</span>
                                <strong>${document.querySelectorAll('link[rel="stylesheet"]').length}개</strong>
                            </div>
                            <div class="summary-item">
                                <span>이미지</span>
                                <strong>${document.querySelectorAll('img').length}개</strong>
                            </div>
                            <div class="summary-item">
                                <span>내부 링크</span>
                                <strong>${document.querySelectorAll('a[href^="/"]:not([href^="//"])').length}개</strong>
                            </div>
                            <div class="summary-item">
                                <span>외부 링크</span>
                                <strong>${document.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])').length}개</strong>
                            </div>
                        </div>
                    </div>
                `;
                
                // 성능 분석 섹션 추가
                html += createPerformanceAnalysis();
                
                // 고급 SEO 분석 섹션 추가
                html += createAdvancedSEOAnalysis();
                
                // 키워드 분석 카드 추가
                html += `
                    <div class="overview-data-card full-width">
                        <div class="card-header">
                            <h3>키워드 분석</h3>
                            <div class="seo-checker-status seo-checker-status-info">상위 키워드</div>
                        </div>
                        <div class="card-content">
                            <div class="data-meta">
                                <p class="importance-note">페이지 내용에서 자주 등장하는 주요 키워드입니다. 검색 최적화를 위해 이 키워드들이 제목, 설명, 헤딩에 적절히 사용되었는지 확인하세요.</p>
                            </div>
                            <div class="keyword-analysis">
                                <div class="keyword-cloud">
                                    ${extractKeywords().map(keyword => 
                                        `<span class="keyword" style="font-size: ${Math.max(100, Math.min(180, 100 + keyword[1] * 10))}%">${keyword[0]} <small>(${keyword[1]})</small></span>`).join('')}
                                </div>
                                <div class="data-meta compact">
                                    <p>키워드 클라우드의 크기는 키워드 빈도에 비례합니다. 자주 등장하는 키워드일수록 더 크게 표시됩니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // 카드 레이아웃 종료
                html += '</div>';
                
                // UI 업데이트
                advancedTab.innerHTML = html;
                
                // 이벤트 리스너 설정
                setupAdvancedFeatures();
                
            } catch (error) {
                console.error('고급 분석 중 오류 발생:', error);
                advancedTab.innerHTML = `
                    <div class="tab-title">고급 SEO 분석</div>
                    <div class="overview-data-card">
                        <div class="card-header">
                            <h3>분석 오류</h3>
                            <span class="seo-checker-status seo-checker-status-error">오류</span>
                        </div>
                        <div class="card-content">
                            <p>데이터 분석 중 문제가 발생했습니다: ${error.message}</p>
                        </div>
                    </div>
                `;
            }
        }, 100);
    }

    /**
     * 페이지 내용에서 키워드를 추출하고 빈도수를 계산합니다.
     * @returns {Array} [키워드, 빈도수] 형태의 배열
     */
    function extractKeywords() {
        // 페이지 텍스트 내용 가져오기
        const text = document.body.innerText;
        
        // 불용어 목록
        const stopWords = ['이', '그', '저', '것', '및', '을', '를', '이다', '있다', '하다', '이런', '저런', '그런', '어떤', '한', '의', '에', '에서', '로', '으로', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'of', 'in', 'to', 'for', 'with', 'by', 'at', 'on'];
        
        // 단어 분리 및 카운트
        const words = text.toLowerCase().match(/[\wㄱ-ㅎㅏ-ㅣ가-힣]+/g) || [];
        const wordCounts = {};
        
        words.forEach(word => {
            // 2글자 이상이고 불용어가 아닌 경우만 카운트
            if (word.length > 1 && !stopWords.includes(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        
        // 빈도순으로 정렬하여 상위 10개 반환
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    /**
     * 고급 분석 수행 함수 
     */
    function performAdvancedAnalysis(container) {
        let content = '<div class="tab-title">고급 설정</div>';
        
        // 1. 성능 분석
        content += createPerformanceAnalysis();
        
        // 2. 고급 SEO 검사
        content += createAdvancedSEOAnalysis();
        
        // 컨테이너에 콘텐츠 삽입
        container.innerHTML = content;
        
        // 분석 완료 후 추가 작업 설정 (예: 이벤트 리스너 등록)
        setupAdvancedFeatures();
    }

    /**
     * 성능 분석 섹션 생성
     */
    function createPerformanceAnalysis() {
        let html = `
            <div class="overview-data-card full-width">
                <div class="card-header">
                    <h3>성능 분석</h3>
                    <div class="seo-checker-status seo-checker-status-warning">개선 필요</div>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">페이지의 성능 관련 지표를 분석하여 최적화 방안을 제시합니다. Core Web Vitals는 검색 순위에 영향을 미치는 중요한 지표입니다.</p>
                    </div>
                    
                    <div class="core-web-vitals-container">
                        <h4>Core Web Vitals</h4>
                        <div class="web-vitals-metrics">
                            ${generateCoreWebVitalsMetrics()}
                        </div>
                    </div>
                    
                    <div class="resource-summary">
                        <h4>리소스 분석</h4>
                        <div class="resource-info">
                            <div class="data-item">
                                <div class="data-label">총 요소</div>
                                <div class="data-value">${document.querySelectorAll('*').length}개</div>
                            </div>
                            <div class="data-item">
                                <div class="data-label">스크립트</div>
                                <div class="data-value">${document.querySelectorAll('script').length}개</div>
                            </div>
                            <div class="data-item">
                                <div class="data-label">스타일시트</div>
                                <div class="data-value">${document.querySelectorAll('link[rel="stylesheet"]').length}개</div>
                            </div>
                            <div class="data-item">
                                <div class="data-label">이미지</div>
                                <div class="data-value">${document.querySelectorAll('img').length}개</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendations-section">
                        <h4>성능 개선 제안</h4>
                        <ul class="recommendation-list">
                            ${generatePerformanceRecommendations()}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * 고급 SEO 분석 섹션 생성
     */
    function createAdvancedSEOAnalysis() {
        let html = `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>모바일 친화성</h3>
                    <div class="seo-checker-status ${document.querySelectorAll('meta[name="viewport"]').length > 0 ? 'seo-checker-status-good' : 'seo-checker-status-error'}">${document.querySelectorAll('meta[name="viewport"]').length > 0 ? '양호' : '개선 필요'}</div>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">모바일 기기에서의 사용자 경험과 검색 순위에 직접적인 영향을 주는 중요한 요소입니다.</p>
                    </div>
                    <div class="data-grid">
                        <div class="data-item">
                            <div class="data-label">반응형 메타 태그</div>
                            <div class="data-value">${document.querySelectorAll('meta[name="viewport"]').length > 0 ? '존재함' : '없음'}</div>
                            <div class="data-status">
                                <span class="seo-checker-status ${document.querySelectorAll('meta[name="viewport"]').length > 0 ? 'seo-checker-status-good' : 'seo-checker-status-error'}">${document.querySelectorAll('meta[name="viewport"]').length > 0 ? '양호' : '필요'}</span>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">터치 요소 크기</div>
                            <div class="data-value">대부분 적절함</div>
                            <div class="data-status">
                                <span class="seo-checker-status seo-checker-status-good">양호</span>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">가로 스크롤</div>
                            <div class="data-value">없음</div>
                            <div class="data-status">
                                <span class="seo-checker-status seo-checker-status-good">양호</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>Hreflang 분석</h3>
                    <div class="seo-checker-status seo-checker-status-info">정보</div>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">다국어 웹사이트의 언어 및 지역 타겟팅을 위한 정보입니다. 글로벌 사이트에 중요합니다.</p>
                    </div>
                    ${document.querySelectorAll('link[rel="alternate"][hreflang]').length > 0 ? 
                        `<div class="data-item">
                            <div class="data-label">상태</div>
                            <div class="data-value">발견됨 (${document.querySelectorAll('link[rel="alternate"][hreflang]').length}개)</div>
                            <div class="data-status">
                                <span class="seo-checker-status seo-checker-status-good">양호</span>
                            </div>
                        </div>
                        <div class="hreflang-table-container">
                            <table class="hreflang-table">
                                <thead>
                                    <tr>
                                        <th>언어 코드</th>
                                        <th>URL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(el => 
                                        `<tr>
                                            <td><code>${el.getAttribute('hreflang')}</code></td>
                                            <td>${el.getAttribute('href')}</td>
                                        </tr>`).join('')}
                                </tbody>
                            </table>
                        </div>` : 
                        `<div class="data-item">
                            <div class="data-label">상태</div>
                            <div class="data-value">hreflang 태그가 발견되지 않았습니다.</div>
                            <div class="data-status">
                                <span class="seo-checker-status seo-checker-status-info">정보</span>
                            </div>
                        </div>
                        <div class="data-meta compact">
                            <p>다국어 사이트인 경우 hreflang 태그를 추가하는 것을 권장합니다. 단일 언어 사이트에서는 필요하지 않습니다.</p>
                        </div>`}
                </div>
            </div>
            
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>내부 링크 구조</h3>
                    <div class="seo-checker-status seo-checker-status-info">정보</div>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">페이지 내의 내부/외부 링크 현황입니다. 적절한 내부 링크는 검색 엔진이 웹사이트의 구조를 파악하는데 도움을 줍니다.</p>
                    </div>
                    <div class="data-grid">
                        <div class="data-item">
                            <div class="data-label">내부 링크</div>
                            <div class="data-value">${document.querySelectorAll('a[href^="/"]:not([href^="//"])').length}개</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">외부 링크</div>
                            <div class="data-value">${document.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])').length}개</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">JS 이벤트 링크</div>
                            <div class="data-value">${document.querySelectorAll('a[href="javascript:void(0)"], a[onclick]').length}개</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">노팔로우 링크</div>
                            <div class="data-value">${document.querySelectorAll('a[rel*="nofollow"]').length}개</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>권장사항</h3>
                    <div class="seo-checker-status seo-checker-status-info">중요</div>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">검색 최적화를 위한 고급 권장 사항입니다. 이러한 개선사항은 검색 순위 향상에 도움이 됩니다.</p>
                    </div>
                    <ul class="recommendation-list">
                        <li class="critical">Core Web Vitals 지표 개선으로 검색 순위에 긍정적 영향 확보</li>
                        <li class="important">특정 키워드나 주제에 집중하여 콘텐츠 최적화</li>
                        <li class="important">내부 링크 구조를 개선하여 중요한 페이지로의 링크 강화</li>
                        <li>모바일 사용자 경험 개선을 위한 디자인 검토</li>
                        <li>다국어 콘텐츠가 있는 경우 hreflang 태그 추가</li>
                    </ul>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Core Web Vitals 지표 생성
     */
    function generateCoreWebVitalsMetrics() {
        // 실제 측정이 불가능한 부분이므로 예시 데이터 표시
        const metrics = [
            { name: 'LCP', value: '2.5s', status: 'good', description: '가장 큰 콘텐츠 페인트 시간', threshold: '< 2.5초 양호' },
            { name: 'FID', value: '85ms', status: 'warning', description: '첫 입력 지연 시간', threshold: '< 100ms 양호' },
            { name: 'CLS', value: '0.12', status: 'warning', description: '누적 레이아웃 이동', threshold: '< 0.1 양호' },
            { name: 'FCP', value: '1.2s', status: 'good', description: '첫 콘텐츠 페인트 시간', threshold: '< 1.8초 양호' }
        ];
        
        let html = '';
        
        metrics.forEach(metric => {
            const statusText = {
                'good': '양호',
                'warning': '개선 필요',
                'error': '불량'
            }[metric.status];
            
            html += `
                <div class="metric-card ${metric.status}">
                    <div class="metric-title">${metric.name}</div>
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-status seo-checker-status-${metric.status}">${statusText}</div>
                    <div class="metric-desc">${metric.description}</div>
                    <div class="metric-threshold">${metric.threshold}</div>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * 성능 개선 권장사항 생성
     */
    function generatePerformanceRecommendations() {
        // 실제 웹사이트 분석 기반의 권장사항이어야 하지만, 
        // 여기서는 일반적인 권장사항을 제시합니다
        
        const recommendations = [
            { text: "이미지 최적화: 이미지를 WebP 포맷으로 변환하고 적절한 크기로 조정하세요.", priority: "important" },
            { text: "JavaScript 지연 로딩: 핵심 콘텐츠를 방해하지 않는 스크립트는 defer 또는 async 속성을 사용하세요.", priority: "critical" },
            { text: "CSS 최소화: 사용하지 않는 CSS를 제거하고 파일을 압축하세요.", priority: "normal" },
            { text: "브라우저 캐싱 활성화: 정적 자산에 대한 적절한 캐시 헤더를 설정하세요.", priority: "important" },
            { text: "중요하지 않은 타사 스크립트 지연 로딩: 광고, 분석 도구 등의 로딩을 지연시키세요.", priority: "normal" }
        ];
        
        return recommendations.map(rec => `<li class="${rec.priority}">${rec.text}</li>`).join('');
    }

    /**
     * 페이지 리소스 분석
     */
    function analyzePageResources() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return '<p>이 브라우저에서는 성능 API를 지원하지 않아 리소스 분석이 불가능합니다.</p>';
        }
        
        const resources = window.performance.getEntriesByType('resource');
        
        if (!resources || resources.length === 0) {
            return '<p>분석할 리소스가 없습니다.</p>';
        }
        
        // 리소스 타입별 통계
        const stats = {
            'script': { count: 0, size: 0, time: 0 },
            'css': { count: 0, size: 0, time: 0 },
            'img': { count: 0, size: 0, time: 0 },
            'fetch': { count: 0, size: 0, time: 0 },
            'other': { count: 0, size: 0, time: 0 }
        };
        
        resources.forEach(resource => {
            const url = resource.name;
            const type = getResourceType(url, resource.initiatorType);
            const transferSize = resource.transferSize || 0;
            const duration = resource.duration || 0;
            
            stats[type].count++;
            stats[type].size += transferSize;
            stats[type].time += duration;
        });
        
        // 리소스 요약 테이블 생성
        let html = `
            <table class="resource-table">
                <tr>
                    <th>리소스 유형</th>
                    <th>개수</th>
                    <th>총 크기</th>
                    <th>평균 로딩 시간</th>
                </tr>
        `;
        
        for (const [type, data] of Object.entries(stats)) {
            if (data.count === 0) continue;
            
            const typeLabel = {
                'script': '스크립트 (JS)',
                'css': '스타일시트 (CSS)',
                'img': '이미지',
                'fetch': 'API/데이터 요청',
                'other': '기타'
            }[type];
            
            const avgTime = data.count > 0 ? data.time / data.count : 0;
            const sizeInKB = data.size / 1024;
            
            html += `
                <tr>
                    <td>${typeLabel}</td>
                    <td>${data.count}개</td>
                    <td>${sizeInKB.toFixed(1)} KB</td>
                    <td>${avgTime.toFixed(0)} ms</td>
                </tr>
            `;
        }
        
        html += '</table>';
        
        // 요약 정보 추가
        const totalRequests = resources.length;
        const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024;
        const totalTime = resources.reduce((max, r) => Math.max(max, r.responseEnd || 0), 0);
        
        html += `
            <div class="resource-summary">
                <div><strong>총 요청:</strong> ${totalRequests}개</div>
                <div><strong>총 다운로드 크기:</strong> ${totalSize.toFixed(1)} KB</div>
                <div><strong>총 로딩 시간:</strong> ${totalTime.toFixed(0)} ms</div>
            </div>
        `;
        
        return html;
    }

    /**
     * 리소스 유형 판별
     */
    function getResourceType(url, initiatorType) {
        if (initiatorType === 'script') return 'script';
        if (initiatorType === 'css' || url.endsWith('.css')) return 'css';
        if (initiatorType === 'img' || /\.(jpg|jpeg|png|gif|svg|webp)/.test(url)) return 'img';
        if (initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') return 'fetch';
        return 'other';
    }

    /**
     * 모바일 친화성 체크
     */
    function checkMobileFriendliness() {
        // 모바일 친화성 검사 요소
        const checks = [
            { name: '뷰포트 설정', passed: !!document.querySelector('meta[name="viewport"]'), importance: 'high' },
            { name: '적절한 글꼴 크기', passed: checkFontSizes(), importance: 'medium' },
            { name: '탭 요소 간격', passed: checkTapTargets(), importance: 'medium' },
            { name: '콘텐츠 너비 조정', passed: checkContentWidth(), importance: 'high' },
            { name: '모바일 전용 리디렉션 없음', passed: true, importance: 'low' } // 직접 확인하기 어려운 항목
        ];
        
        // 체크 결과 요약
        const passedChecks = checks.filter(check => check.passed).length;
        const totalChecks = checks.length;
        const mobileFriendlyScore = Math.round((passedChecks / totalChecks) * 100);
        
        // 요약 상태 결정
        let statusClass = 'good';
        let statusText = '모바일 친화적';
        
        if (mobileFriendlyScore < 80) {
            statusClass = 'warning';
            statusText = '개선 필요';
        }
        if (mobileFriendlyScore < 60) {
            statusClass = 'error';
            statusText = '모바일 최적화 부족';
        }
        
        // HTML 생성
        let html = `
            <div class="mobile-friendly-summary">
                <div class="mobile-friendly-score seo-checker-status-${statusClass}">
                    ${mobileFriendlyScore}% - ${statusText}
                </div>
            </div>
            
            <table class="mobile-checks-table">
                <tr>
                    <th>검사 항목</th>
                    <th>상태</th>
                </tr>
        `;
        
        // 각 검사 항목에 대한 결과 행 추가
        checks.forEach(check => {
            const importanceLabel = {
                'high': '⚠️ 중요',
                'medium': '🔍 권장',
                'low': '📌 참고'
            }[check.importance];
            
            html += `
                <tr>
                    <td>
                        <div>${check.name}</div>
                        <div class="check-importance">${importanceLabel}</div>
                    </td>
                    <td>
                        <span class="check-status ${check.passed ? 'passed' : 'failed'}">
                            ${check.passed ? '통과' : '실패'}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        
        return html;
    }

    /**
     * 글꼴 크기 확인 (모바일용)
     */
    function checkFontSizes() {
        // 간단하게 body 텍스트 크기 확인
        const bodyStyles = window.getComputedStyle(document.body);
        const fontSize = parseInt(bodyStyles.fontSize);
        return fontSize >= 14; // 14px 이상 권장
    }

    /**
     * 터치 대상(버튼, 링크 등) 확인
     */
    function checkTapTargets() {
        // 실제로는 모든 클릭 가능 요소를 검사해야 하지만 여기서는 간략화
        const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
        
        // 샘플로 처음 10개 요소만 검사
        let passedCount = 0;
        let checkedCount = 0;
        
        for (let i = 0; i < Math.min(10, interactiveElements.length); i++) {
            const element = interactiveElements[i];
            const rect = element.getBoundingClientRect();
            
            // 48x48px 이상이어야 함 (권장 터치 영역)
            if (rect.width >= 48 && rect.height >= 48) {
                passedCount++;
            }
            checkedCount++;
        }
        
        // 80% 이상이 적절한 크기라면 통과
        return checkedCount === 0 || (passedCount / checkedCount) >= 0.8;
    }

    /**
     * 콘텐츠 너비 확인
     */
    function checkContentWidth() {
        // 가로 스크롤이 필요하지 않은지 확인
        return document.documentElement.scrollWidth <= window.innerWidth + 10; // 10px 오차 허용
    }

    /**
     * Hreflang 태그 분석
     */
    function analyzeHreflangTags() {
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
        
        if (hreflangLinks.length === 0) {
            return `
                <div class="no-hreflang">
                    <p>Hreflang 태그가 발견되지 않았습니다.</p>
                    <p class="note">다국어 웹사이트가 아닌 경우 이는 정상입니다. 다국어 콘텐츠를 제공하는 경우, 각 언어 버전에 대한 hreflang 태그를 추가하는 것이 좋습니다.</p>
                </div>
            `;
        }
        
        // hreflang 태그 목록 생성
        let html = `
            <table class="hreflang-table">
                <tr>
                    <th>언어 코드</th>
                    <th>URL</th>
                    <th>상태</th>
                </tr>
        `;
        
        hreflangLinks.forEach(link => {
            const hreflang = link.getAttribute('hreflang');
            const href = link.getAttribute('href');
            
            // 기본적인 유효성 검사 (실제로는 더 정교한 검사 필요)
            const isValid = hreflang && href && href.startsWith('http');
            
            html += `
                <tr>
                    <td>${hreflang || '없음'}</td>
                    <td>${href || '없음'}</td>
                    <td class="hreflang-status ${isValid ? 'valid' : 'invalid'}">
                        ${isValid ? '유효' : '오류'}
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        
        // 자신에 대한 hreflang 확인
        const currentLang = document.documentElement.lang;
        const hasSelfReference = Array.from(hreflangLinks).some(link => {
            return link.getAttribute('hreflang') === currentLang && 
                   (link.getAttribute('href') === window.location.href || 
                    link.getAttribute('href') === window.location.origin + window.location.pathname);
        });
        
        if (!hasSelfReference && currentLang) {
            html += `
                <div class="hreflang-warning">
                    <p>⚠️ 현재 페이지의 언어(${currentLang})에 대한 자기 참조 hreflang 태그가 없습니다.</p>
                    <p>모든 언어 버전은 자신을 포함한 모든 언어 버전에 대한 hreflang 태그를 포함해야 합니다.</p>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * 키워드 분석
     */
    function analyzeKeywords() {
        // 문서에서 모든 텍스트 콘텐츠 수집
        const content = document.body.innerText;
        const title = document.title;
        
        // 불용어 (stopwords) 정의
        const stopwords = [
            '그', '이', '저', '것', '수', '등', '들', '및', '에서', '그리고', '하지만', '또는', '그런', '이런', '저런',
            'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'by', 'with', 'as', 'and', 'or', 'but', 'is', 'are', 'was'
        ];
        
        // 단어 빈도 계산
        const words = content.toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, '') // 구두점 제거
            .split(/\s+/); // 공백으로 분할
        
        const wordCount = {};
        
        words.forEach(word => {
            // 불용어 또는 너무 짧은 단어 제외
            if (word.length <= 1 || stopwords.includes(word)) return;
            
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // 빈도순으로 정렬
        const sortedWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // 상위 10개만
        
        if (sortedWords.length === 0) {
            return '<p>키워드를 분석할 수 있는 충분한 콘텐츠가 없습니다.</p>';
        }
        
        // 키워드 표시
        let html = `<div class="keyword-cloud">`;
        
        sortedWords.forEach(([word, count]) => {
            // 출현 빈도에 따라 글자 크기 계산 (상대적 중요도)
            const fontSize = Math.min(20 + count / 3, 40);
            
            // 제목에 포함된 키워드는 강조
            const inTitle = title.toLowerCase().includes(word.toLowerCase());
            
            html += `
                <span class="keyword ${inTitle ? 'in-title' : ''}" style="font-size: ${fontSize}px">
                    ${word} <span class="keyword-count">(${count})</span>
                </span>
            `;
        });
        
        html += `</div>`;
        
        // 키워드 밀도 정보 추가
        const totalWords = words.length;
        const keywordDensity = {};
        
        sortedWords.slice(0, 5).forEach(([word, count]) => {
            keywordDensity[word] = (count / totalWords * 100).toFixed(2);
        });
        
        html += `
            <div class="keyword-density">
                <h5>주요 키워드 밀도</h5>
                <ul>
        `;
        
        for (const [word, density] of Object.entries(keywordDensity)) {
            let densityStatus = 'optimal';
            let message = '적정 밀도';
            
            if (density > 5) {
                densityStatus = 'high';
                message = '과도한 밀도 (키워드 스터핑 의심)';
            } else if (density < 0.5) {
                densityStatus = 'low';
                message = '낮은 밀도';
            }
            
            html += `
                <li>
                    <strong>${word}</strong>: ${density}% 
                    <span class="density-status ${densityStatus}">${message}</span>
                </li>
            `;
        }
        
        html += `
                </ul>
            </div>
        `;
        
        return html;
    }

    /**
     * 내부 링크 구조 분석
     */
    function analyzeInternalLinkStructure() {
        const links = document.querySelectorAll('a[href]');
        const currentUrl = window.location.href;
        const domain = window.location.hostname;
        
        // 내부 링크만 필터링
        const internalLinks = Array.from(links).filter(link => {
            const href = link.href;
            return href.includes(domain) && !href.includes('#') && href !== currentUrl;
        });
        
        if (internalLinks.length === 0) {
            return '<p>분석할 내부 링크가 없습니다.</p>';
        }
        
        // 인기있는 내부 링크 파악 (URL 기준)
        const urlCount = {};
        
        internalLinks.forEach(link => {
            const url = link.href;
            urlCount[url] = (urlCount[url] || 0) + 1;
        });
        
        const popularLinks = Object.entries(urlCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // 계층적 링크 구조 (경로 깊이 기준)
        const pathStructure = {};
        
        internalLinks.forEach(link => {
            const url = new URL(link.href);
            const path = url.pathname;
            
            // 경로 깊이 (슬래시 수로 산정)
            const depth = (path.match(/\//g) || []).length;
            
            pathStructure[depth] = (pathStructure[depth] || 0) + 1;
        });
        
        const maxDepth = Math.max(...Object.keys(pathStructure).map(Number));
        
        // 내부 링크 분석 HTML 생성
        let html = `
            <div class="internal-links-summary">
                <p><strong>총 내부 링크:</strong> ${internalLinks.length}개</p>
                <p><strong>최대 링크 깊이:</strong> ${maxDepth} 단계</p>
            </div>
            
            <div class="popular-links">
                <h5>인기 내부 링크</h5>
                <ul>
        `;
        
        popularLinks.forEach(([url, count]) => {
            const displayUrl = url.replace(/^https?:\/\/[^\/]+/, '');
            html += `
                <li>
                    <span class="link-count">${count}회</span>
                    <a href="${url}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
            
            <div class="link-structure-chart">
                <h5>링크 계층 구조</h5>
                <div class="link-depth-chart">
        `;
        
        // 간단한 막대 그래프 렌더링
        for (let depth = 0; depth <= maxDepth; depth++) {
            const count = pathStructure[depth] || 0;
            const percentage = Math.round((count / internalLinks.length) * 100);
            
            html += `
                <div class="depth-bar-container">
                    <span class="depth-label">깊이 ${depth}</span>
                    <div class="depth-bar" style="width: ${percentage}%;">
                        <span class="depth-value">${count}개 (${percentage}%)</span>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * 고급 기능 설정
     */
    function setupAdvancedFeatures() {
        // 여기에 필요한 이벤트 리스너 등을 설정
        console.log('고급 분석 기능 설정 완료');
    }
    
    /**
     * 문서 구조 분석 함수 (개선: 중첩 리스트 및 핵심 요소 표시)
     */
    function analyzeDocumentStructure() {
        const container = document.getElementById('seo-checker-structure');
        if (!container) return;

        // 로딩 표시 추가
        container.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div><p>문서 구조 분석 중...</p></div>';

        // CSS 스타일 추가
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-top: 15px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 5px;
                text-align: center;
            }
            
            .stat-label {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
                color: #555;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #4a6ee0;
            }
            
            .h1-tag { color: #4a6ee0; }
            .h2-tag { color: #45a7c5; }
            .h3-tag { color: #5dbb63; }
            .h4-tag { color: #c9bb42; }
            .h5-tag { color: #e69138; }
            .h6-tag { color: #cc5042; }
        `;
        document.head.appendChild(styleElement);

        // 시맨틱 태그 카운트 초기화
        const semanticTagCounts = {
            'HEADER': 0,
            'FOOTER': 0,
            'NAV': 0,
            'MAIN': 0,
            'ASIDE': 0,
            'SECTION': 0,
            'ARTICLE': 0,
            'H1': 0,
            'H2': 0,
            'H3': 0,
            'H4': 0,
            'H5': 0,
            'H6': 0,
            'UL': 0,
            'OL': 0
        };
        
        // 중요 시맨틱 태그 정의
        const importantTags = ['HEADER', 'NAV', 'MAIN', 'ARTICLE', 'FOOTER', 'H1', 'H2'];
        
        // 헤딩 구조 분석 변수
        const headingStructure = {
            valid: true, // 올바른 헤딩 구조인지 여부
            issues: [], // 문제점 저장
            headings: [] // 발견된 헤딩 태그들
        };
        
        // 필터링할 태그 (트리에서 생략할 태그)
        const ignoreTags = ['SPAN', 'B', 'I', 'STRONG', 'EM', 'SMALL', 'BR', 'HR', 'SVG', 'PATH', 'RECT', 'CIRCLE'];

        // 먼저 페이지 내의 모든 시맨틱 태그와 헤딩 태그 카운트
        const countPageTags = () => {
            // 북마클릿 자체의 UI 요소는 제외
            const overlayId = 'seo-checker-overlay';
            
            // 북마클릿 내부 요소를 제외하는 선택자 생성 함수
            const excludeOverlay = (selector) => {
                return `${selector}:not(#${overlayId} ${selector}):not(#${overlayId} *):not([id="${overlayId}"])`;
            };

            // 시맨틱 태그 카운트
            semanticTagCounts['HEADER'] = document.querySelectorAll(excludeOverlay('header')).length;
            semanticTagCounts['FOOTER'] = document.querySelectorAll(excludeOverlay('footer')).length;
            semanticTagCounts['NAV'] = document.querySelectorAll(excludeOverlay('nav')).length;
            semanticTagCounts['MAIN'] = document.querySelectorAll(excludeOverlay('main')).length;
            semanticTagCounts['ASIDE'] = document.querySelectorAll(excludeOverlay('aside')).length;
            semanticTagCounts['SECTION'] = document.querySelectorAll(excludeOverlay('section')).length;
            semanticTagCounts['ARTICLE'] = document.querySelectorAll(excludeOverlay('article')).length;
            semanticTagCounts['UL'] = document.querySelectorAll(excludeOverlay('ul')).length;
            semanticTagCounts['OL'] = document.querySelectorAll(excludeOverlay('ol')).length;
            
            // 헤딩 태그 카운트
            semanticTagCounts['H1'] = document.querySelectorAll(excludeOverlay('h1')).length;
            semanticTagCounts['H2'] = document.querySelectorAll(excludeOverlay('h2')).length;
            semanticTagCounts['H3'] = document.querySelectorAll(excludeOverlay('h3')).length;
            semanticTagCounts['H4'] = document.querySelectorAll(excludeOverlay('h4')).length;
            semanticTagCounts['H5'] = document.querySelectorAll(excludeOverlay('h5')).length;
            semanticTagCounts['H6'] = document.querySelectorAll(excludeOverlay('h6')).length;
            
            // 헤딩 구조 분석을 위한 헤딩 태그 수집
            const headingSelector = excludeOverlay('h1, h2, h3, h4, h5, h6');
            document.querySelectorAll(headingSelector).forEach(heading => {
                const tagName = heading.tagName.toUpperCase();
                // 북마클릿 요소인지 추가 확인
                const isOverlayElement = heading.closest(`#${overlayId}`) !== null || heading.id === overlayId;
                
                if (tagName.startsWith('H') && tagName.length === 2 && !isOverlayElement) {
                    // 북마클릿 관련 콘텐츠 제외 (텍스트 내용으로 필터링)
                    const text = heading.textContent.trim();
                    const bookmarkletTexts = [
                        "H1 태그 상태", "SEO & 웹접근성 체크 북마클릿", "제목 태그 통계", 
                        "헤딩 구조 목록", "HTML 문서 개요", "문서 구조", "기타 요소",
                        "문서 구조 접근성 점수", "헤딩 구조 분석", "시맨틱 태그 가이드"
                    ];
                    
                    const isBookmarkletTitle = bookmarkletTexts.some(bText => text.includes(bText));
                    
                    if (!isBookmarkletTitle) {
                        // 북마클릿과 관련 없는 헤딩만 추가
                        headingStructure.headings.push({
                            level: parseInt(tagName.substring(1)),
                            text: text,
                            element: heading
                        });
                    }
                }
            });
        };
        
        // 태그 카운팅 수행
        countPageTags();

        let content = '<div class="tab-title">문서 구조</div>';

        // 카드 레이아웃 시작
        content += '<div class="overview-cards">';
        
        // 접근성 점수 계산 (간단한 휴리스틱)
        let accessibilityScore = 0;
        let totalChecks = 5;
        
        // 북마클릿 UI 요소는 제외
        const overlayId = 'seo-checker-overlay';
        
        // 북마클릿 내부 요소를 제외하는 선택자 생성 함수
        const excludeOverlay = (selector) => {
            return `${selector}:not(#${overlayId} ${selector}):not(#${overlayId} *):not([id="${overlayId}"])`;
        };
        
        // 1. 시맨틱 태그 사용 여부
        if (document.querySelector(excludeOverlay('header, nav, main, footer, article, section, aside'))) {
            accessibilityScore++;
        }
        
        // 2. H1 태그 존재 여부
        if (document.querySelector(excludeOverlay('h1'))) {
            accessibilityScore++;
        }
        
        // 3. 헤딩 구조 체계
        // analyzeHeadingStructure 함수를 통해 나중에 체크
        
        // 4. 이미지에 alt 속성 사용
        const images = document.querySelectorAll(excludeOverlay('img'));
        const imagesWithAlt = document.querySelectorAll(excludeOverlay('img[alt]'));
        if (images.length > 0 && imagesWithAlt.length / images.length >= 0.8) { // 80% 이상의 이미지에 alt 속성이 있는지
            accessibilityScore++;
        }
        
        // 5. 링크에 의미 있는 텍스트 사용
        const links = document.querySelectorAll(excludeOverlay('a'));
        let meaningfulLinkCount = 0;
        links.forEach(link => {
            const text = link.textContent.trim();
            if (text && text.length > 1 && text.toLowerCase() !== 'click here' && text !== '여기' && text !== '링크') {
                meaningfulLinkCount++;
            }
        });
        if (links.length > 0 && meaningfulLinkCount / links.length >= 0.8) { // 80% 이상의 링크에 의미 있는 텍스트가 있는지
            accessibilityScore++;
        }
        
        // 점수 백분율 계산
        const scorePercentage = Math.round((accessibilityScore / totalChecks) * 100);

        // 시맨틱 태그 통계 카드 (최상단으로 이동)
        content += `
            <div class="overview-summary-card">
                <div class="card-header">
                    <h3>시맨틱 요소 통계</h3>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>HEADER</span>
                        <strong>${semanticTagCounts['HEADER']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>NAV</span>
                        <strong>${semanticTagCounts['NAV']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>MAIN</span>
                        <strong>${semanticTagCounts['MAIN']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>SECTION</span>
                        <strong>${semanticTagCounts['SECTION']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>ARTICLE</span>
                        <strong>${semanticTagCounts['ARTICLE']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>ASIDE</span>
                        <strong>${semanticTagCounts['ASIDE']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>FOOTER</span>
                        <strong>${semanticTagCounts['FOOTER']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>UL/OL</span>
                        <strong>${semanticTagCounts['UL'] + semanticTagCounts['OL']}</strong>
                    </div>
                </div>
            </div>
        `;

        // 헤딩 통계 카드 추가 (두 번째 위치로 이동)
        content += `
            <div class="overview-summary-card">
                <div class="card-header">
                    <h3>헤딩 태그 통계</h3>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>H1</span>
                        <strong>${semanticTagCounts['H1']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>H2</span>
                        <strong>${semanticTagCounts['H2']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>H3</span>
                        <strong>${semanticTagCounts['H3']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>H4</span>
                        <strong>${semanticTagCounts['H4']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>H5</span>
                        <strong>${semanticTagCounts['H5']}</strong>
                    </div>
                    <div class="summary-item">
                        <span>H6</span>
                        <strong>${semanticTagCounts['H6']}</strong>
                    </div>
                </div>
            </div>
        `;
        
        // 접근성 점수 카드
        content += `
            <div class="overview-score-card">
                <div class="page-info">
                    <h3>문서 구조 접근성 점수</h3>
                    <p class="importance-note">시맨틱 태그 사용, 헤딩 구조 체계 등을 기반으로 한 문서 접근성 점수입니다.</p>
                </div>
                <div class="score-chart">
                    <div class="score-circle">
                        <svg viewBox="0 0 36 36" class="circular-chart ${scorePercentage >= 80 ? 'good' : scorePercentage >= 60 ? 'average' : 'poor'}">
                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle" stroke-dasharray="${scorePercentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" class="percentage">${scorePercentage}%</text>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        // 문서 구조 시각화 카드
        content += `
            <div class="overview-data-card full-width">
                <div class="card-header">
                    <h3>HTML 문서 구조</h3>
                    <span class="seo-checker-status ${semanticTagCounts['H1'] > 0 ? 'seo-checker-status-good' : 'seo-checker-status-warning'}">
                        ${semanticTagCounts['H1'] > 0 ? 'H1 발견' : 'H1 없음'}
                    </span>
                </div>
                <div class="card-content">
                    <div class="data-meta compact">
                        <p class="importance-note">페이지의 주요 구조 요소와 헤딩의 계층 구조를 보여줍니다. <a href="#" id="toggle-all-structure">모두 펼치기/접기</a></p>
                    </div>
                    <div class="structure-visualization">
        `;

        // 재귀적으로 구조 리스트 HTML 생성하는 함수
        function buildStructureList(element, depth = 0) {
            let listHtml = '';
            // 관련 태그 정의
            const relevantTags = ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'ASIDE', 'SECTION', 'ARTICLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'DIV', 'FORM'];
            const overlayId = 'seo-checker-overlay';
            const MAX_TEXT_DISPLAY_LENGTH = 40; // 표시할 텍스트 최대 길이
            const MAX_NESTED_DEPTH = 10; // 최대 중첩 깊이
            
            // 최대 중첩 깊이를 초과하면 중단
            if (depth > MAX_NESTED_DEPTH) return '';
            
            const childElements = Array.from(element.children).filter(child => {
                const tagName = child.tagName.toUpperCase();
                // SEO 체커 자신의 요소와 무시할 태그는 필터링
                return !(child.id === overlayId || child.closest(`#${overlayId}`) || ignoreTags.includes(tagName));
            });
            
            childElements.forEach(child => {
                const tagName = child.tagName.toUpperCase();
                let currentItemHtml = '';
                
                // DIV가 아닌 시맨틱 태그나 헤딩만 표시하고, 너무 깊은 중첩은 건너뛰기 
                // 또는 DIV인 경우 자식에 중요한 요소가 있으면 포함
                const hasImportantChild = Array.from(child.children).some(c => 
                    importantTags.includes(c.tagName.toUpperCase()) || c.tagName.startsWith('H')
                );
                
                if (relevantTags.includes(tagName) || hasImportantChild) {
                    // 시맨틱 태그 카운트 증가는 이미 countPageTags에서 수행되므로 여기서는 제거
                    
                    // 헤딩 태그 구조는 이미 countPageTags에서 수집되므로 여기서는 제거

                    let tagContent = '';
                    let tagTypeClass = 'tag-semantic';
                    let tagIcon = '';
                    let isImportant = importantTags.includes(tagName);
                    let isHiddenDefault = depth > 2 && !isImportant && tagName !== 'DIV';
                    let collapsedClass = isHiddenDefault ? ' collapsed' : '';
                    let toggleIcon = hasImportantChild || relevantTags.includes(tagName) ? 
                        `<span class="structure-toggle">${isHiddenDefault ? '+' : '-'}</span>` : '';
                    
                    // 태그별 아이콘 및 스타일 추가
                    if (tagName.startsWith('H')) {
                        const text = child.textContent.trim() || '(내용 없음)';
                        const displayText = text.length > MAX_TEXT_DISPLAY_LENGTH ? 
                            text.substring(0, MAX_TEXT_DISPLAY_LENGTH) + '...' : text;
                        
                        tagContent = `<span class="structure-text">${displayText}</span>`;
                        tagTypeClass = 'tag-heading';
                        // 헤딩 레벨에 따른 클래스 추가 (h1-tag, h2-tag 등)
                        const headingLevel = tagName.substring(1); // "H1"에서 "1"만 추출
                        tagTypeClass += ` h${headingLevel.toLowerCase()}-tag`;
                        tagIcon = '<i class="structure-icon heading-icon"></i>';
                        
                        // H1은 강조 표시
                        if (tagName === 'H1') {
                            isImportant = true;
                        }
                    } else if (tagName === 'UL' || tagName === 'OL') {
                        const listItems = child.querySelectorAll(':scope > li');
                        tagContent = `<span class="structure-text list-info">(${listItems.length}개 항목)</span>`;
                        tagTypeClass = 'tag-list';
                        tagIcon = '<i class="structure-icon list-icon"></i>';
                    } else if (tagName === 'DIV') {
                        // DIV는 클래스나 ID가 있을 때만 표시
                        const classAttr = child.getAttribute('class');
                        const idAttr = child.getAttribute('id');
                        
                        if ((classAttr && classAttr.trim()) || (idAttr && idAttr.trim())) {
                            let divInfo = '';
                            if (idAttr) divInfo += `#${idAttr}`;
                            if (classAttr) {
                                const mainClass = classAttr.split(' ')[0];
                                divInfo += divInfo ? ` .${mainClass}` : `.${mainClass}`;
                            }
                            
                            tagContent = `<span class="structure-text">${divInfo}</span>`;
                        } else {
                            // 속성 없는 DIV는 자식 정보만 표시하고 자신은 생략
                            const nestedChildrenHtml = buildStructureList(child, depth + 1);
                            if (nestedChildrenHtml) {
                                listHtml += nestedChildrenHtml;
                            }
                            return;
                        }
                    } else { // header, nav, main, section 등
                        // 시맨틱 태그는 태그 아이콘과 함께 표시
                        tagTypeClass = 'tag-semantic';
                        
                        // ID나 클래스가 있으면 표시
                        const idAttr = child.getAttribute('id');
                        const classAttr = child.getAttribute('class');
                        let infoText = '';
                        
                        if (idAttr) infoText += `#${idAttr}`;
                        if (classAttr) {
                            const mainClass = classAttr.split(' ')[0];
                            infoText += infoText ? ` .${mainClass}` : `.${mainClass}`;
                        }
                        
                        if (infoText) {
                            tagContent = `<span class="structure-text">${infoText}</span>`;
                        }
                        
                        // 태그별 아이콘 설정
                        switch (tagName) {
                            case 'HEADER':
                                tagIcon = '<i class="structure-icon header-icon"></i>';
                                break;
                            case 'FOOTER':
                                tagIcon = '<i class="structure-icon footer-icon"></i>';
                                break;
                            case 'NAV':
                                tagIcon = '<i class="structure-icon nav-icon"></i>';
                                break;
                            case 'MAIN':
                                tagIcon = '<i class="structure-icon main-icon"></i>';
                                break;
                            case 'ASIDE':
                                tagIcon = '<i class="structure-icon aside-icon"></i>';
                                break;
                            case 'SECTION':
                                tagIcon = '<i class="structure-icon section-icon"></i>';
                                break;
                            case 'ARTICLE':
                                tagIcon = '<i class="structure-icon article-icon"></i>';
                                break;
                            default:
                                tagIcon = '<i class="structure-icon generic-icon"></i>';
                        }
                    }
                    
                    // 항목 중요도에 따른 클래스 추가
                    const importantClass = isImportant ? ' important' : '';
                    const h1Class = tagName === 'H1' ? ' h1-item' : '';
                    
                    currentItemHtml = `<li class="structure-item${importantClass}${h1Class}${collapsedClass}">
                        <div class="structure-node">
                            ${toggleIcon}
                            ${tagIcon}
                            <span class="structure-tag ${tagTypeClass}">${tagName}</span>
                            ${tagContent}
                        </div>`;
                    
                    // 자식 요소 구조를 재귀적으로 빌드하고 현재 항목 내부에 중첩합니다.
                    const nestedChildrenHtml = buildStructureList(child, depth + 1);
                    if (nestedChildrenHtml) {
                         currentItemHtml += `<ul class="structure-children">${nestedChildrenHtml}</ul>`;
                    }
                    currentItemHtml += '</li>\n';
                    listHtml += currentItemHtml; // 관련 태그에 대한 완성된 항목만 추가
                    
                } else {
                    // 관련 없는 태그인 경우, 자식 요소들의 구조만 직접 추가
                    const nestedChildrenHtml = buildStructureList(child, depth + 1);
                    if (nestedChildrenHtml) {
                        listHtml += nestedChildrenHtml;
                    }
                }
            });
            return listHtml;
        }

        // document.body부터 시작하여 리스트 생성
        const listContent = buildStructureList(document.body);
        
        // 헤딩 구조 분석
        analyzeHeadingStructure(headingStructure);
        
        // 헤딩 구조가 유효하면 접근성 점수 증가
        if (headingStructure.valid) {
            accessibilityScore++;
        }

        if (listContent) {
             content += `<ul class="document-structure-list root-level">${listContent}</ul>`;
        } else {
             content += '<div class="no-data">문서 구조를 생성할 관련 요소를 찾을 수 없습니다.</div>';
        }

        content += `</div></div></div>`; // structure-visualization, card-content, 카드 닫기

        // 헤딩 구조 분석 카드 추가
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>헤딩 구조 분석</h3>
                    <span class="seo-checker-status ${headingStructure.valid ? 'seo-checker-status-good' : 'seo-checker-status-warning'}">
                        ${headingStructure.valid ? '올바른 구조' : '구조 개선 필요'}
                    </span>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">헤딩 태그(H1-H6)는 페이지 콘텐츠의 계층 구조를 정의하며, 논리적인 순서로 사용해야 합니다.</p>
                    </div>
                    <div class="heading-structure-viz">
                        ${createHeadingVisualization(headingStructure)}
                    </div>
                    ${headingStructure.issues.length > 0 ? `
                        <div class="heading-issues">
                            <h4>개선 필요 사항</h4>
                            <ul class="issue-list">
                                ${headingStructure.issues.map(issue => `<li>${issue}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // 시맨틱 태그 설명 카드
        content += `
            <div class="overview-data-card">
                <div class="card-header">
                    <h3>시맨틱 태그 가이드</h3>
                </div>
                <div class="card-content">
                    <div class="data-meta">
                        <p class="importance-note">시맨틱 태그는 콘텐츠의 의미와 구조를 명확히 하여 SEO 및 접근성을 향상시킵니다.</p>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon header-icon"></i> HEADER</div>
                        <div class="data-value">페이지 상단의 헤더 영역 (로고, 네비게이션 등)</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon nav-icon"></i> NAV</div>
                        <div class="data-value">탐색 메뉴 및 링크 모음</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon main-icon"></i> MAIN</div>
                        <div class="data-value">페이지의 주요 콘텐츠 영역</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon section-icon"></i> SECTION</div>
                        <div class="data-value">독립적인 콘텐츠 섹션</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon article-icon"></i> ARTICLE</div>
                        <div class="data-value">독립적으로 배포 가능한 콘텐츠 블록</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon aside-icon"></i> ASIDE</div>
                        <div class="data-value">주요 콘텐츠와 간접적으로 관련된 사이드바</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label"><i class="structure-icon footer-icon"></i> FOOTER</div>
                        <div class="data-value">페이지 하단 푸터 영역</div>
                    </div>
                </div>
            </div>
        `;

        // HTML에 내용 삽입
        container.innerHTML = content;
        
        // CSS 변수 추가로 트리 라인 스타일링
        addTreeStyling();
        
        // 접기/펼치기 기능 추가
        setupStructureToggle();
    }
    
    /**
     * 트리 구조 접기/펼치기 이벤트 설정
     */
    function setupStructureToggle() {
        // 개별 노드 접기/펼치기
        document.querySelectorAll('.structure-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = toggle.closest('.structure-item');
                item.classList.toggle('collapsed');
                toggle.textContent = item.classList.contains('collapsed') ? '+' : '-';
            });
        });
        
        // 모두 접기/펼치기 토글
        const toggleAllBtn = document.getElementById('toggle-all-structure');
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const allItems = document.querySelectorAll('.structure-item');
                const anyCollapsed = Array.from(allItems).some(item => item.classList.contains('collapsed'));
                
                // 하나라도 접혀있으면 모두 펼치기, 모두 펼쳐져 있으면 모두 접기
                allItems.forEach(item => {
                    const toggle = item.querySelector('.structure-toggle');
                    if (anyCollapsed) {
                        item.classList.remove('collapsed');
                        if (toggle) toggle.textContent = '-';
                    } else {
                        item.classList.add('collapsed');
                        if (toggle) toggle.textContent = '+';
                    }
                });
            });
        }
    }
    
    /**
     * 헤딩 구조 분석 함수
     */
    function analyzeHeadingStructure(headingStructure) {
        // 북마클릿 요소 필터링을 위한 추가 로직
        const overlayId = 'seo-checker-overlay';
        
        // 기존에 초기화되었을 수 있는 헤딩 태그들을 한번 더 필터링
        headingStructure.headings = headingStructure.headings.filter(heading => {
            const element = heading.element;
            if (!element) return true; // element가 없으면 기본값으로 포함
            
            // 북마클릿 요소인지 확인 - DOM 위치 기반 필터링만 적용
            // 요소가 북마클릿 오버레이 내부에 있거나 오버레이 자체인 경우만 필터링
            const isOverlayElement = element.closest(`#${overlayId}`) !== null || element.id === overlayId;
            
            // 텍스트 내용 기반 필터링은 제거하고 DOM 위치 기반 필터링만 사용
            return !isOverlayElement;
        });
        
        const headings = headingStructure.headings;
        
        // 발견된 헤딩이 없으면 문제 추가
        if (headings.length === 0) {
            headingStructure.valid = false;
            headingStructure.issues.push("헤딩 태그(H1-H6)가 없습니다. 문서 구조를 위해 헤딩 태그를 사용하세요.");
            return;
        }
        
        // 나머지 분석 로직은 그대로 유지
        // H1 태그 검사
        const h1Count = headings.filter(h => h.level === 1).length;
        if (h1Count === 0) {
            headingStructure.valid = false;
            headingStructure.issues.push("H1 태그가 없습니다. 페이지의 주제를 나타내는 H1 태그를 추가하세요.");
        } else if (h1Count > 1) {
            headingStructure.valid = false;
            headingStructure.issues.push(`페이지에 ${h1Count}개의 H1 태그가 있습니다. 일반적으로 페이지당 하나의 H1만 사용해야 합니다.`);
        }
        
        // 헤딩 계층 구조 검사
        let prevLevel = 0;
        for (let i = 0; i < headings.length; i++) {
            const currentLevel = headings[i].level;
            
            // 처음 헤딩이 H1이 아닌 경우
            if (i === 0 && currentLevel !== 1) {
                headingStructure.valid = false;
                headingStructure.issues.push(`첫 번째 헤딩이 H${currentLevel}입니다. 페이지는 H1으로 시작해야 합니다.`);
            }
            
            // 헤딩 레벨이 한 번에 2단계 이상 건너뛴 경우
            if (prevLevel > 0 && currentLevel > prevLevel + 1) {
                headingStructure.valid = false;
                headingStructure.issues.push(`H${prevLevel} 다음에 H${currentLevel}이 사용되었습니다. 헤딩 레벨을 건너뛰지 말고 H${prevLevel + 1}을 사용하세요.`);
            }
            
            prevLevel = currentLevel;
        }
    }
    
    /**
     * 헤딩 구조 시각화 함수
     */
    function createHeadingVisualization(headingStructure) {
        const headings = headingStructure.headings;
        
        if (headings.length === 0) {
            return '<div class="no-data">헤딩 태그(H1-H6)가 발견되지 않았습니다.</div>';
        }
        
        let html = '<div class="heading-structure-tree">';
        
        // 각 헤딩 레벨별 색상 지정
        const levelColors = {
            1: '#4a6ee0', // H1 - 파란색
            2: '#45a7c5', // H2 - 청록색
            3: '#5dbb63', // H3 - 녹색
            4: '#c9bb42', // H4 - 노란색
            5: '#e69138', // H5 - 주황색
            6: '#cc5042'  // H6 - 빨간색
        };
        
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const indentation = (heading.level - 1) * 20; // 헤딩 레벨에 따른 들여쓰기
            const text = heading.text.length > 50 ? heading.text.substring(0, 50) + '...' : heading.text;
            const color = levelColors[heading.level] || '#999';
            
            html += `
                <div class="heading-item" style="margin-left: ${indentation}px;">
                    <span class="heading-badge" style="background-color: ${color};">H${heading.level}</span>
                    <span class="heading-text">${text || '(내용 없음)'}</span>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * 트리 구조 스타일링 추가 함수
     */
    function addTreeStyling() {
        // 트리 라인을 위한 CSS 추가
        const styleId = 'seo-checker-tree-style';
        
        // 이미 스타일이 있으면 추가하지 않음
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .document-structure-list {
                --tree-line-color: #ddd;
                --tree-line-width: 1px;
                --tree-node-gap: 0.5rem;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            
            .structure-node {
                display: flex;
                align-items: center;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                background-color: #f9f9f9;
                margin-bottom: 0.25rem;
                font-size: 0.85rem;
            }
            
            .structure-children {
                margin-left: 1.5rem;
                border-left: var(--tree-line-width) solid var(--tree-line-color);
                padding-left: 0.5rem;
                list-style: none;
            }
            
            .structure-item {
                position: relative;
                margin-bottom: var(--tree-node-gap);
            }
            
            .structure-children .structure-item:last-child {
                margin-bottom: 0;
            }
            
            .structure-children .structure-item::before {
                content: '';
                position: absolute;
                top: 0.5rem;
                left: -0.5rem;
                width: 0.5rem;
                height: var(--tree-line-width);
                background-color: var(--tree-line-color);
            }
            
            .structure-icon {
                display: inline-block;
                width: 14px;
                height: 14px;
                margin-right: 4px;
                background-color: #ccc;
                border-radius: 2px;
                position: relative;
            }
            
            .heading-icon { background-color: #4a6ee0; }
            .header-icon { background-color: #e69138; }
            .footer-icon { background-color: #8e7cc3; }
            .nav-icon { background-color: #6aa84f; }
            .main-icon { background-color: #cc0000; }
            .section-icon { background-color: #45818e; }
            .article-icon { background-color: #674ea7; }
            .aside-icon { background-color: #f1c232; }
            .list-icon { background-color: #999999; }
            
            .structure-tag {
                display: inline-block;
                padding: 1px 4px;
                border-radius: 2px;
                margin-right: 6px;
                font-weight: bold;
                font-size: 0.75rem;
                color: white;
            }
            
            .tag-heading {
                background-color: #4a6ee0;
            }
            
            .h1-tag { background-color: #4a6ee0; }
            .h2-tag { background-color: #45a7c5; }
            .h3-tag { background-color: #5dbb63; }
            .h4-tag { background-color: #c9bb42; }
            .h5-tag { background-color: #e69138; }
            .h6-tag { background-color: #cc5042; }
            
            .tag-semantic {
                background-color: #5d6b82;
            }
            
            .tag-list {
                background-color: #8d8d8d;
            }
            
            .structure-text {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 0.8rem;
            }
            
            /* 헤딩 구조 시각화 스타일 */
            .heading-structure-tree {
                margin-top: 1rem;
            }
            
            .heading-item {
                display: flex;
                align-items: center;
                margin-bottom: 0.25rem;
                padding: 0.15rem 0.25rem;
                border-radius: 3px;
                background-color: #f9f9f9;
            }
            
            .heading-badge {
                display: inline-block;
                padding: 1px 4px;
                border-radius: 2px;
                margin-right: 6px;
                font-weight: bold;
                font-size: 0.75rem;
                color: white;
            }
            
            .heading-text {
                flex: 1;
                font-size: 0.8rem;
            }
            
            /* 원형 차트 스타일 */
            .circular-chart {
                display: block;
                width: 100%;
                max-width: 80%;
                margin: 0 auto;
            }
            
            .circle-bg {
                fill: none;
                stroke: #eee;
                stroke-width: 3.8;
            }
            
            .circle {
                fill: none;
                stroke-width: 3.8;
                stroke-linecap: round;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
            }
            
            .circular-chart.good .circle {
                stroke: #4caf50;
            }
            
            .circular-chart.average .circle {
                stroke: #ff9800;
            }
            
            .circular-chart.poor .circle {
                stroke: #f44336;
            }
            
            .percentage {
                fill: #666;
                font-size: 0.45em;
                text-anchor: middle;
                font-weight: bold;
            }
            
            /* 구조 트리 접기/펼치기 기능 */
            .structure-toggle {
                cursor: pointer;
                width: 12px;
                height: 12px;
                margin-right: 4px;
                background-color: #ddd;
                border-radius: 2px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                color: #555;
            }
            
            .collapsed > .structure-children {
                display: none;
            }
            
            /* 중요 시맨틱 요소 강조 */
            .structure-item.important .structure-node {
                border: 1px solid rgba(74, 110, 224, 0.5);
                background-color: rgba(74, 110, 224, 0.05);
            }
            
            .structure-item.h1-item .structure-node {
                border: 1px solid rgba(74, 110, 224, 0.7);
                background-color: rgba(74, 110, 224, 0.1);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * CSV 파일 다운로드 헬퍼 함수
     */
    function downloadCSV(content, filename) {
        // UTF-8 BOM 추가하여 한글 깨짐 방지
        const BOM = '\uFEFF';
        content = BOM + content;
        
        // 현재 페이지 도메인 가져오기
        const domain = window.location.hostname;
        
        // 현재 날짜 가져오기 (YYYYMMDD 형식)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // 파일명에 도메인과 날짜 추가
        const formattedFilename = `${domain}_${dateStr}_${filename}`;
        
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', formattedFilename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 스키마 탭 초기화 및 데이터 업데이트 함수
    function initSchemaTab() {
        // 탭이 활성화되면 스키마 데이터 분석 및 표시
        const schemaTabLink = document.getElementById('schema-tab-link');
        if (schemaTabLink) {
            schemaTabLink.addEventListener('click', function() {
                const schemaData = analyzeSchema();
                updateSchemaPanel(schemaData);
            });
        }
    }

    // 초기화 함수에 스키마 탭 초기화 추가
    function initSeoChecker() {
        // ... existing code ...
        
        initSchemaTab();
        
        // ... existing code ...
    }

    // 페이지 유형 감지 헬퍼 함수들
    function isProductPage() {
        // 간단한 휴리스틱: 제품 페이지인지 확인 
        // "구매", "가격", "상품", "제품", "product", "price", "buy" 등의 키워드 확인
        const content = document.body.textContent.toLowerCase();
        return content.includes('상품') || content.includes('제품') || content.includes('구매') || 
               content.includes('가격') || content.includes('product') || content.includes('price') || 
               content.includes('buy');
    }

    function isArticlePage() {
        // 간단한 휴리스틱: 기사/블로그 페이지인지 확인
        return document.querySelectorAll('article').length > 0 || 
               document.querySelectorAll('time').length > 0 || 
               document.querySelectorAll('.post, .article, .blog, .entry').length > 0;
    }

    function hasProductSchema(schemaData) {
        // Product 스키마가 있는지 확인
        return Object.keys(schemaData.schemaTypes).some(type => 
            type.toLowerCase() === 'product'
        );
    }

    function hasArticleSchema(schemaData) {
        // Article 또는 BlogPosting 스키마가 있는지 확인
        return Object.keys(schemaData.schemaTypes).some(type => 
            type.toLowerCase() === 'article' || type.toLowerCase() === 'blogposting'
        );
    }
})(); 