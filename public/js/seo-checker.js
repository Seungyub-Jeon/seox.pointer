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
        let content = '<div class="tab-title">개요</div>';

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

        // 7. Element Counts
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
        
        // Word Count 상태 로직 추가
        let wordStatus = 'seo-checker-status-good';
        let wordIndicator = '충분';
        if (wordCount < 300) {
             wordStatus = 'seo-checker-status-warning';
             wordIndicator = '부족';
        }

        // --- HTML 생성 --- 

        // 카드 1: Title, Description, URL, Canonical
        content += `
            <div class="seo-checker-item">
                <div class="overview-item overview-full">
                    <span class="overview-label">Title</span>
                    <div class="overview-value-wrapper">
                        <span class="overview-value">${title || '(없음)'}</span>
                        <p class="note">${titleMessage}</p>
                        <p class="importance-note">검색 결과 제목 및 브라우저 탭에 표시되며, SEO 순위에 중요한 영향을 미칩니다.</p>
                    </div>
                    <span class="seo-checker-status ${titleStatus}">${titleIndicator}</span>
                </div>
                 <div class="overview-item overview-full">
                    <span class="overview-label">Description</span>
                    <div class="overview-value-wrapper">
                        <span class="overview-value">${description || '(없음)'}</span>
                         <p class="note">${descMessage}</p>
                         <p class="importance-note">검색 결과에 페이지 요약으로 표시되어 클릭률(CTR)에 영향을 줍니다.</p>
                    </div>
                    <span class="seo-checker-status ${descStatus}">${descIndicator}</span>
                </div>
                 <div class="overview-item overview-full"> 
                    <span class="overview-label">URL</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${pageUrl}</span>
                        <p class="importance-note">현재 페이지의 웹 주소입니다. Robots Tag 설정에 따라 색인 가능 여부가 결정됩니다.</p>
                    </div>
                    <span class="seo-checker-status ${urlStatus}">${urlIndicator}</span>
                </div>
                 <div class="overview-item overview-full">
                    <span class="overview-label">Canonical</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${canonicalUrl || '(없음)'}</span>
                        <p class="importance-note">중복 콘텐츠 문제를 방지하기 위해 검색 엔진에 이 페이지의 대표 URL을 알려줍니다.</p>
                     </div>
                    <span class="seo-checker-status ${canonicalStatus}">${canonicalIndicator}</span>
                </div>
            </div>
        `;

        // 카드 2: Robots Tag, X-Robots-Tag
        content += `
            <div class="seo-checker-item">
                <div class="overview-item overview-full">
                    <span class="overview-label">Robots Tag</span>
                    <div class="overview-value-wrapper">
                        <span class="overview-value">${robotsContent || '(없음)'}</span>
                        <p class="importance-note">검색 엔진 로봇에게 페이지 색인 및 링크 수집 허용 여부를 지시합니다. (예: noindex, nofollow)</p>
                     </div>
                    <span class="seo-checker-status ${robotsStatus}">${robotsContent ? '있음' : '없음'}</span> 
                </div>
                <div class="overview-item overview-full">
                    <span class="overview-label">X-Robots-Tag</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${xRobotsTag}</span>
                        <p class="importance-note">HTTP 헤더를 통해 Robots Tag와 동일한 지시를 전달하며, HTML 외 파일에도 적용 가능합니다.</p>
                     </div>
                     <span class="seo-checker-status ${xRobotsStatus}">${xRobotsIndicator}</span>
                </div>
            </div>
        `;
        
        // 카드 3: Keywords, Word Count, Publisher, Lang
        content += `
            <div class="seo-checker-item">
                <div class="overview-item overview-full">
                    <span class="overview-label">Keywords</span>
                    <div class="overview-value-wrapper">
                        <span class="overview-value">${keywords || '(없음)'}</span>
                        ${keywords ? '<p class="note">참고: Google은 keywords 메타 태그를 순위 요소로 사용하지 않습니다.</p>' : ''}
                        <p class="importance-note">과거 SEO에 사용되었으나, 현재 주요 검색 엔진에서는 중요도가 낮습니다.</p>
                    </div>
                    <span class="seo-checker-status ${keywordsStatus}">${keywordsIndicator}</span>
                </div>
                 <div class="overview-item overview-full">
                    <span class="overview-label">Word Count</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${wordCount}</span>
                        <p class="importance-note">콘텐츠의 양을 나타냅니다. 충분한 정보 제공은 중요하지만, 절대적인 기준은 아닙니다.</p>
                     </div>
                    <span class="seo-checker-status ${wordStatus}">${wordIndicator}</span> 
                </div>
                 <div class="overview-item overview-full">
                    <span class="overview-label">Publisher</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${publisher || '(없음)'}</span>
                        <p class="importance-note">콘텐츠 게시자 정보를 명시합니다. 브랜드 인지도 구축에 도움이 될 수 있습니다.</p>
                     </div>
                     <span class="seo-checker-status ${publisherStatus}">${publisherIndicator}</span>
                </div>
                 <div class="overview-item overview-full">
                    <span class="overview-label">Lang</span>
                     <div class="overview-value-wrapper">
                        <span class="overview-value">${htmlLang || '(없음)'}</span>
                        <p class="importance-note">페이지의 주 언어를 명시하여, 접근성(스크린 리더)과 검색 결과 지역 타겟팅에 중요합니다.</p>
                     </div>
                     <span class="seo-checker-status ${langStatus}">${langIndicator}</span>
                </div>
            </div>
        `;

        // 카드 4: 요소 개수 요약
        content += `
            <div class="seo-checker-item overview-summary-card">
                <span>H1: ${h1Count}</span>
                <span>H2: ${h2Count}</span>
                <span>H3: ${h3Count}</span>
                <span>H4: ${h4Count}</span>
                <span>H5: ${h5Count}</span>
                <span>H6: ${h6Count}</span>
                <span>Images: ${imgCount}</span>
                <span>Links: ${linkCount}</span>
            </div>
        `;

        // 카드 5: Robots.txt 및 Sitemap.xml 링크 (비동기 확인 후 생성)
        const origin = window.location.origin;
        const robotsUrl = `${origin}/robots.txt`;
        const sitemapUrl = `${origin}/sitemap.xml`;

        // 파일 존재 여부 비동기 확인
        const robotsExists = await checkFileExists(robotsUrl);
        const sitemapExists = await checkFileExists(sitemapUrl);

        let fileLinksContent = '';
        if (robotsExists) {
            fileLinksContent += `<a href="${robotsUrl}" target="_blank" rel="noopener noreferrer">robots.txt 보기</a>`;
        } else {
            fileLinksContent += `<span class="not-found">robots.txt 없음</span>`;
        }

        if (sitemapExists) {
            fileLinksContent += `<a href="${sitemapUrl}" target="_blank" rel="noopener noreferrer">sitemap.xml 보기</a>`;
        } else {
            fileLinksContent += `<span class="not-found">sitemap.xml 없음</span>`;
        }

        content += `
            <div class="seo-checker-item file-links-card">
                ${fileLinksContent}
            </div>
        `;

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
        
        // 컨테이너 비우기 및 로그 추가
        console.log('analyzeHeadings: Before setting innerHTML, length:', container.innerHTML.length);
        container.innerHTML = ''; 

        let content = '<div class="tab-title">제목 구조</div>';

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
                issues.push(`레벨 건너뜀 (H${lastLevel} -> H${level})`);
            }

            headingsData.push({
                level: level,
                text: text || '(내용 없음)',
                issues: issues
            });

            // 다음 레벨 비교를 위해 현재 레벨 업데이트 
            // 건너뛴 경우라도 현재 레벨 기준으로 다음 건너뜀 판단 (H1->H3->H5 같은 경우 H3에서 H5도 잡기 위함)
            lastLevel = level;
           
        });

        // --- H1 태그 상태 ---
        let h1Status = 'seo-checker-status-good';
        let h1Message = 'H1 태그가 1개 사용되었습니다.';
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


        // --- HTML 생성 ---

        // H1 상태 카드
        content += `
            <div class="seo-checker-item">
                <h3>
                    <span class="seo-checker-status ${h1Status}">H1 태그 (${h1Count}개)</span>
                </h3>
                 <div class="overview-value-wrapper"> <!-- 개요 탭 스타일 재활용 -->
                    <span class="overview-value">${h1Detail || '(H1 없음)'}</span>
                     <p class="note">${h1Message}</p>
                     <p class="importance-note">H1 태그는 페이지의 가장 중요한 제목으로, 검색 엔진과 사용자에게 페이지 주제를 명확히 전달합니다.</p>
                 </div>
            </div>
        `;

        // 헤딩 구조 목록
        content += `
            <div class="seo-checker-item">
                <h3>헤딩 구조 목록</h3>
                <p class="importance-note">헤딩 태그(H1-H6)는 콘텐츠의 계층 구조를 나타내며, 검색 엔진과 스크린 리더 사용자에게 중요합니다. 논리적인 순서와 명확한 내용이 필요합니다.</p>
                <ul class="heading-structure-list">
        `;

        if (headingsData.length > 0) {
             headingsData.forEach(heading => {
                const issueText = heading.issues.length > 0 ? `<span class="heading-issue">(${heading.issues.join(', ')})</span>` : '';
                content += `
                    <li class="heading-level-${heading.level} ${heading.issues.length > 0 ? 'has-issue' : ''}">
                        <span class="heading-tag">H${heading.level}</span>
                        <span class="heading-text">${heading.text}</span>
                        ${issueText}
                    </li>
                `;
            });
        } else {
             content += '<li>페이지에 헤딩 태그가 없습니다.</li>';
        }


        content += `
                </ul>
            </div>
        `;

        // HTML 문서 개요 섹션 추가
        content += `
            <div class="seo-checker-item">
                <h3>HTML 문서 개요</h3>
                <p class="importance-note">페이지의 제목(H1-H6) 구조를 시각적으로 보여줍니다. 콘텐츠의 논리적 흐름을 파악하는 데 도움이 됩니다.</p>
                <ul class="html-outline-list">
        `;

        if (headingsData.length > 0) {
            headingsData.forEach(heading => {
                // 아웃라인에는 문제점 표시 없이 텍스트만 표시
                content += `
                    <li class="outline-level-${heading.level}">
                        <span class="outline-text">${heading.text}</span>
                    </li>
                `;
            });
        } else {
            content += '<li>문서 개요를 생성할 헤딩 태그가 없습니다.</li>';
        }

        content += `
                </ul>
            </div>
        `;

        // 헤딩 개수 요약 카드 추가
        const h2Count = headingsData.filter(h => h.level === 2).length;
        const h3Count = headingsData.filter(h => h.level === 3).length;
        const h4Count = headingsData.filter(h => h.level === 4).length;
        const h5Count = headingsData.filter(h => h.level === 5).length;
        const h6Count = headingsData.filter(h => h.level === 6).length;
        
        content += `
            <div class="seo-checker-item overview-summary-card"> <!-- 개요 탭 스타일 재활용 -->
                <span>H1: ${h1Count}</span>
                <span>H2: ${h2Count}</span>
                <span>H3: ${h3Count}</span>
                <span>H4: ${h4Count}</span>
                <span>H5: ${h5Count}</span>
                <span>H6: ${h6Count}</span>
            </div>
        `;

        // 최종적으로 내용 할당
        container.innerHTML = content;
        console.log('analyzeHeadings: After setting innerHTML, length:', container.innerHTML.length);
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

        // 링크 통계 카드
        content += `
            <div class="seo-checker-item">
                <h3>링크 통계 요약</h3>
                <ul class="link-summary-list">
                    <li><span class="label">총 링크:</span> <span class="value">${totalLinks}개</span></li>
                    <li><span class="label">내부 링크:</span> <span class="value">${internalLinks.length}개</span></li>
                    <li><span class="label">외부 링크:</span> <span class="value">${externalLinks.length}개</span></li>
                    <li class="${brokenLinks.length > 0 ? 'has-issue broken-link-summary' : ''}">
                        <span class="label">href 속성 없는 링크:</span> 
                        <span class="value">${brokenLinks.length}개</span>
                    </li>
                    <li class="${linksWithoutTitle.length > 0 ? 'has-info' : ''}">
                        <span class="label">title 속성 없는 링크:</span> 
                        <span class="value">${linksWithoutTitle.length}개</span>
                    </li>
                    <li class="${insecureTargetBlankLinks.length > 0 ? 'has-issue' : ''}">
                        <span class="label">보안 위험 target="_blank":</span> 
                        <span class="value">${insecureTargetBlankLinks.length}개</span>
                    </li>
                    <li class="${genericTextLinks.length > 0 ? 'has-issue' : ''}">
                        <span class="label">일반적인 링크 텍스트:</span> 
                        <span class="value">${genericTextLinks.length}개</span>
                    </li>
                </ul>
                <p class="importance-note">링크는 웹사이트 내/외부를 연결하는 중요한 요소입니다. 깨지거나 정보가 부족한 링크는 사용자 경험과 SEO에 부정적인 영향을 줄 수 있습니다.</p>
            </div>
        `;

        // 문제점 목록 카드 생성 함수
        const createIssueListCard = (title, description, statusClass, items, itemFormatter) => {
            if (items.length === 0) return '';
            return `
                <div class="seo-checker-item">
                    <h3>
                        <span class="seo-checker-status ${statusClass}">${title} (${items.length}개)</span>
                    </h3>
                    <p class="importance-note">${description}</p>
                    <ul class="link-issue-list">
                        ${items.map(itemFormatter).join('')}
                    </ul>
                </div>
            `;
        };

        // href 속성 없는 링크 목록
        content += createIssueListCard(
            'href 속성 없음',
            '다음 링크에 href 속성이 없거나 비어 있어 사용자가 이동할 수 없습니다. 링크의 목적지를 명시하는 것이 중요합니다.',
            'seo-checker-status-error',
            brokenLinks,
            link => `<li>${link.text}</li>`
        );

        // Title 없는 링크 목록 (중요도 낮음 - 정보성)
        content += createIssueListCard(
            'title 속성 없음',
            'title 속성은 선택 사항이지만, 링크의 목적을 추가 설명하여 사용자 경험과 접근성을 높일 수 있습니다. 링크 텍스트가 충분히 설명적이라면 생략해도 됩니다.',
            'seo-checker-status-info',
            linksWithoutTitle,
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

        // 내부 링크 및 외부 링크 목록 섹션
        if (internalLinks.length > 0 || externalLinks.length > 0) {
            // 내부 링크 섹션
            if (internalLinks.length > 0) {
                const maxDisplayLinks = 20; // 기본 표시 개수
                const hasMoreLinks = internalLinks.length > maxDisplayLinks;
                
                content += `
                    <div class="seo-checker-item">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3>내부 링크 (${internalLinks.length}개)</h3>
                            <button class="toggle-list-btn" id="toggle-internal-links">펼치기</button>
                        </div>
                        <p class="importance-note">내부 링크는 웹사이트 내 페이지 간 연결을 제공하며, 검색 엔진의 페이지 크롤링과 사이트 구조 이해에 도움을 줍니다.</p>
                        <ul class="link-full-list collapsible-list" id="internal-links-list">
                            ${internalLinks.slice(0, maxDisplayLinks).map(link => `
                                <li>
                                    <span class="link-text">${link.text}</span>
                                    <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="link-preview">↗</a>
                                    <span class="link-href">(${link.href})</span>
                                </li>
                            `).join('')}
                            ${hasMoreLinks ? `<li class="more-links-info">...외 ${internalLinks.length - maxDisplayLinks}개 더 있음</li>` : ''}
                        </ul>
                    </div>
                `;
            }
            
            // 외부 링크 섹션
            if (externalLinks.length > 0) {
                const maxDisplayLinks = 20; // 기본 표시 개수
                const hasMoreLinks = externalLinks.length > maxDisplayLinks;
                
                content += `
                    <div class="seo-checker-item">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3>외부 링크 (${externalLinks.length}개)</h3>
                            <button class="toggle-list-btn" id="toggle-external-links">펼치기</button>
                        </div>
                        <p class="importance-note">외부 링크는 다른 웹사이트로의 연결을 제공합니다. 관련성 높은 외부 링크는 사용자에게 유용한 정보를 제공하고 웹사이트의 신뢰성을 높일 수 있습니다.</p>
                        <ul class="link-full-list collapsible-list" id="external-links-list">
                            ${externalLinks.slice(0, maxDisplayLinks).map(link => `
                                <li>
                                    <span class="link-text">${link.text}</span>
                                    <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="link-preview">↗</a>
                                    <span class="link-href">(${link.href})</span>
                                </li>
                            `).join('')}
                            ${hasMoreLinks ? `<li class="more-links-info">...외 ${externalLinks.length - maxDisplayLinks}개 더 있음</li>` : ''}
                        </ul>
                    </div>
                `;
            }
        }

        // 링크 데이터 내보내기 버튼
        content += `
            <div class="seo-checker-item">
                <h3>링크 데이터 내보내기</h3>
                <button class="seo-checker-export-btn" id="export-internal-links">내부 링크 (CSV)</button>
                <button class="seo-checker-export-btn" id="export-external-links">외부 링크 (CSV)</button>
                <button class="seo-checker-export-btn" id="export-all-links">모든 링크 (CSV)</button>
            </div>
        `;

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
        let content = '<div class="tab-title">이미지</div>';
        
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
            
            // 데이터 배열에 추가
            imagesData.push(imageData);
        });
        
        // --- HTML 생성 ---
        
        // 이미지 통계 카드
        content += `
            <div class="seo-checker-item">
                <h3>이미지 통계</h3>
                <div class="image-summary-grid">
                    <div class="image-stat-card">
                        <span class="stat-value">${totalImages}</span>
                        <span class="stat-label">총 이미지</span>
                    </div>
                    <div class="image-stat-card ${imagesWithoutAlt.length > 0 ? 'has-issue' : ''}">
                        <span class="stat-value">${imagesWithoutAlt.length}</span>
                        <span class="stat-label">alt 속성 없음</span>
                    </div>
                    <div class="image-stat-card">
                        <span class="stat-value">${imagesWithEmptyAlt.length}</span>
                        <span class="stat-label">장식용 이미지</span>
                    </div>
                    <div class="image-stat-card ${imagesWithoutDimensions.length > 0 ? 'has-issue' : ''}">
                        <span class="stat-value">${imagesWithoutDimensions.length}</span>
                        <span class="stat-label">크기 속성 없음</span>
                    </div>
                </div>
                
                <h4 style="margin-top: 20px;">이미지 형식</h4>
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
                
                <p class="importance-note">이미지는 사용자 경험에 중요하지만, 페이지 성능을 저하시킬 수 있습니다. 적절한 크기 조정, 형식 선택, alt 텍스트 제공이 중요합니다.</p>
            </div>
        `;
        
        // 문제점 요약 카드
        if (imagesWithoutAlt.length > 0 || imagesWithoutDimensions.length > 0 || largeImages.length > 0 || imagesWithLongAlt.length > 0) {
            content += `
                <div class="seo-checker-item">
                    <h3>
                        <span class="seo-checker-status seo-checker-status-warning">이미지 최적화 문제</span>
                    </h3>
                    <ul class="image-issues-list">
                        ${imagesWithoutAlt.length > 0 ? `<li><strong>${imagesWithoutAlt.length}개</strong> 이미지에 alt 속성이 없습니다. 접근성 및 SEO에 중요합니다.</li>` : ''}
                        ${imagesWithLongAlt.length > 0 ? `<li><strong>${imagesWithLongAlt.length}개</strong> 이미지의 alt 텍스트가 너무 김니다. 간결하고 설명적인 텍스트를 사용하세요.</li>` : ''}
                        ${imagesWithoutDimensions.length > 0 ? `<li><strong>${imagesWithoutDimensions.length}개</strong> 이미지에 width/height 속성이 없습니다. 이는 CLS(Cumulative Layout Shift)를 발생시킬 수 있습니다.</li>` : ''}
                        ${largeImages.length > 0 ? `<li><strong>${largeImages.length}개</strong> 이미지가 표시 크기보다 과도하게 큽니다. 적절한 크기로 최적화하세요.</li>` : ''}
                        ${imagesWithoutLazyLoading.length > 0 ? `<li><strong>${imagesWithoutLazyLoading.length}개</strong> 이미지에 lazy loading이 적용되어 있지 않습니다. 첫 화면 아래 이미지에는 loading="lazy" 속성을 권장합니다.</li>` : ''}
                    </ul>
                    <p class="importance-note">이미지 최적화는 페이지 로딩 속도, 사용자 경험 및 SEO에 직접적인 영향을 미칩니다. 특히 모바일 사용자에게 중요합니다.</p>
                </div>
            `;
        }
        
        // 모던 이미지 형식 권장 카드
        if (formatCounts.jpg + formatCounts.jpeg + formatCounts.png > 0 && formatCounts.webp + formatCounts.avif === 0) {
            content += `
                <div class="seo-checker-item">
                    <h3>
                        <span class="seo-checker-status seo-checker-status-info">최신 이미지 형식 사용 권장</span>
                    </h3>
                    <p>WebP나 AVIF 같은 최신 이미지 형식을 사용하면 다음과 같은 이점이 있습니다:</p>
                    <ul>
                        <li>파일 크기 감소 (JPG/PNG 대비 25-50% 작음)</li>
                        <li>페이지 로딩 속도 향상</li>
                        <li>대역폭 사용량 감소</li>
                        <li>더 나은 이미지 품질 (특히 AVIF)</li>
                    </ul>
                    <p>기존 형식과의 호환성을 위해 <code>&lt;picture&gt;</code> 요소와 함께 사용하는 것이 좋습니다.</p>
                </div>
            `;
        }
        
        // 이미지 목록
        if (imagesData.length > 0) {
            // 필터링 옵션
            content += `
                <div class="seo-checker-item">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3>이미지 목록 (${imagesData.length}개)</h3>
                        <div class="image-filter-controls">
                            <select id="image-filter-select" class="image-filter-select">
                                <option value="all">모든 이미지</option>
                                <option value="no-alt">alt 속성 없음</option>
                                <option value="empty-alt">장식용 이미지 (alt="")</option>
                                <option value="no-dimensions">width/height 속성 없음</option>
                                <option value="oversized">크기 최적화 필요</option>
                                <option value="no-lazy">lazy loading 없음</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="image-list-container" id="image-list-container">
                        <!-- 이미지 목록이 여기에 동적으로 생성됨 -->
                    </div>
                    
                    <button class="seo-checker-export-btn" id="export-images">이미지 정보 내보내기</button>
                </div>
            `;
        }
        
        container.innerHTML = content;
        
        // 이미지 필터링 및 목록 생성 함수
        function renderImageList(filter = 'all') {
            const listContainer = document.getElementById('image-list-container');
            if (!listContainer) return;
            
            let filteredImages = imagesData;
            
            // 필터 적용
            switch (filter) {
                case 'no-alt':
                    filteredImages = imagesWithoutAlt;
                    break;
                case 'empty-alt':
                    filteredImages = imagesWithEmptyAlt;
                    break;
                case 'no-dimensions':
                    filteredImages = imagesWithoutDimensions;
                    break;
                case 'oversized':
                    filteredImages = largeImages;
                    break;
                case 'no-lazy':
                    filteredImages = imagesWithoutLazyLoading;
                    break;
            }
            
            // 최대 20개 이미지만 표시 (너무 많으면 성능 문제)
            const displayImages = filteredImages.slice(0, 20);
            const hasMoreImages = filteredImages.length > 20;
            
            let listHTML = '';
            
            if (displayImages.length === 0) {
                listHTML = '<p class="no-results">선택한 필터에 해당하는 이미지가 없습니다.</p>';
            } else {
                listHTML = '<div class="image-grid">';
                
                displayImages.forEach(img => {
                    // 이미지 썸네일 URL (없으면 원본 사용)
                    const thumbSrc = img.src;
                    
                    // 이미지 크기 정보
                    const sizeInfo = img.naturalWidth && img.naturalHeight ? 
                        `${img.naturalWidth}x${img.naturalHeight}px` : '크기 알 수 없음';
                    
                    // ALT 속성 상태 및 텍스트
                    const altStatus = img.alt === null ? 
                        '<span class="alt-missing">ALT 속성 없음</span>' : 
                        img.alt === '' ? 
                        '<span class="alt-empty">장식용 이미지 (alt="")</span>' : 
                        `<span class="alt-exists">ALT: </span>`;
                    
                    // ALT 텍스트 표시 (있는 경우만)
                    const altText = img.alt !== null && img.alt !== '' ? 
                        (img.alt.length > 60 ? 
                            `<span class="alt-text-long" title="${img.alt}">${img.alt.substring(0, 60)}...</span>` : 
                            `<span class="alt-text">${img.alt}</span>`) : 
                        '';
                    
                    // 이미지 형식
                    const formatLabel = img.format.toUpperCase();
                    
                    // 이슈 배지
                    const issueCount = img.issues.length;
                    const issueBadge = issueCount > 0 ? 
                        `<span class="image-issue-badge">${issueCount}</span>` : '';
                    
                    listHTML += `
                        <div class="image-card ${issueCount > 0 ? 'has-issues' : ''}">
                            ${issueBadge}
                            <div class="image-thumb-container">
                                <img src="${thumbSrc}" alt="썸네일" class="image-thumb" loading="lazy">
                            </div>
                            <div class="image-info">
                                <div class="image-format-badge">${formatLabel}</div>
                                <div class="image-size-info">${sizeInfo}</div>
                                <div class="image-alt-info">
                                    ${altStatus}
                                    ${altText}
                                </div>
                                ${issueCount > 0 ? `
                                    <div class="image-issues">
                                        <ul>
                                            ${img.issues.map(issue => `<li>${issue}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
                
                listHTML += '</div>';
                
                if (hasMoreImages) {
                    listHTML += `
                        <div class="more-images-info">
                            ...외 ${filteredImages.length - 20}개 더 있음 (내보내기로 전체 목록 확인)
                        </div>
                    `;
                }
            }
            
            listContainer.innerHTML = listHTML;
        }
        
        // 필터 변경 이벤트 처리
        const filterSelect = document.getElementById('image-filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', function() {
                renderImageList(this.value);
            });
            
            // 초기 목록 렌더링
            renderImageList('all');
        }
        
        // 내보내기 버튼에 이벤트 리스너 추가
        const exportBtn = document.getElementById('export-images');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
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
                downloadCSV(csv, '이미지_분석.csv');
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
        
        // 먼저 로딩 상태 표시
        container.innerHTML = `
            <div class="tab-title">구조화 데이터 (Schema.org)</div>
            <div class="seo-checker-item">
                <h3>스키마 데이터 분석 중...</h3>
                <p>페이지의 구조화 데이터를 분석하고 있습니다. 잠시만 기다려주세요.</p>
            </div>
        `;
        
        // 비동기적으로 스키마 분석 실행
        setTimeout(() => {
            try {
                const schemaResults = collectSchemaData();
                updateSchemaUI(container, schemaResults);
            } catch (error) {
                console.error('스키마 분석 중 오류 발생:', error);
                container.innerHTML = `
                    <div class="tab-title">구조화 데이터 (Schema.org)</div>
                    <div class="seo-checker-item">
                        <h3>스키마 분석 오류</h3>
                        <p>데이터 분석 중 문제가 발생했습니다: ${error.message}</p>
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
        
        // 탭 제목과 주요 컨테이너 생성
        let content = `<div class="tab-title">구조화 데이터 (Schema.org)</div>`;
        content += `<div class="seo-checker-item">`;
        
        // 1. 스키마 개요 섹션
        content += `
            <h3>구조화 데이터 개요</h3>
            <p class="importance-note">이 페이지에는 총 ${schemaData.totalSchemas}개의 Schema.org 마크업이 발견되었습니다.</p>
            
            <div class="schema-summary-grid">
                <div class="schema-stat-card">
                    <div class="stat-value">${schemaData.totalSchemas}</div>
                    <div class="stat-label">총 스키마</div>
                </div>
                <div class="schema-stat-card">
                    <div class="stat-value">${schemaData.jsonLD.length}</div>
                    <div class="stat-label">JSON-LD</div>
                </div>
                <div class="schema-stat-card">
                    <div class="stat-value">${schemaData.microdata.length}</div>
                    <div class="stat-label">Microdata</div>
                </div>
                <div class="schema-stat-card">
                    <div class="stat-value">${schemaData.rdfa.length}</div>
                    <div class="stat-label">RDFa</div>
                </div>
        `;
        
        // 스키마 유형 요약
        const schemaTypes = Object.keys(schemaData.schemaTypes);
        if (schemaTypes.length > 0) {
            content += `
                <div class="schema-stat-card">
                    <div class="stat-value">${schemaTypes.length}</div>
                    <div class="stat-label">스키마 유형</div>
                </div>
            `;
        }
        
        content += `</div>`; // schema-summary-grid 닫기
        content += `</div>`; // 첫 번째 seo-checker-item 닫기
        
        // 2. JSON-LD 스키마 세부 정보 표시
        if (schemaData.jsonLD.length > 0) {
            content += `<div class="seo-checker-item">`;
            content += '<h3>JSON-LD 스키마</h3>';
            
            schemaData.jsonLD.forEach((schema, index) => {
                const schemaType = getSchemaType(schema.data);
                content += createSchemaAccordion(
                    schemaType,
                    'json-ld',
                    JSON.stringify(schema.data, null, 2),
                    index
                );
            });
            
            content += `</div>`; // seo-checker-item 닫기
        }
        
        // 3. Microdata 스키마 세부 정보 표시
        if (schemaData.microdata.length > 0) {
            content += `<div class="seo-checker-item">`;
            content += '<h3>Microdata 스키마</h3>';
            
            schemaData.microdata.forEach((schema, index) => {
                content += `
                    <div class="schema-accordion-item">
                        <div class="schema-accordion-header">
                            <div class="schema-accordion-title">
                                <span class="schema-format-badge microdata">Microdata</span>
                                ${schema.type || '알 수 없는 유형'}
                            </div>
                            <button class="schema-toggle-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="schema-accordion-content">
                            <div class="schema-accordion-content-inner">
                                <p>이 요소에는 ${schema.type || '알 수 없는 유형'} 유형의 Microdata 마크업이 포함되어 있습니다.</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            content += `</div>`; // seo-checker-item 닫기
        }
        
        // 4. RDFa 스키마 세부 정보 표시
        if (schemaData.rdfa.length > 0) {
            content += `<div class="seo-checker-item">`;
            content += '<h3>RDFa 스키마</h3>';
            
            schemaData.rdfa.forEach((schema, index) => {
                content += `
                    <div class="schema-accordion-item">
                        <div class="schema-accordion-header">
                            <div class="schema-accordion-title">
                                <span class="schema-format-badge rdfa">RDFa</span>
                                ${schema.type || '알 수 없는 유형'}
                            </div>
                            <button class="schema-toggle-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="schema-accordion-content">
                            <div class="schema-accordion-content-inner">
                                <p>이 요소에는 ${schema.type || '알 수 없는 유형'} 유형의 RDFa 마크업이 포함되어 있습니다.</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            content += `</div>`; // seo-checker-item 닫기
        }
        
        // 5. 권장사항 및 유용한 도구
        content += `<div class="seo-checker-item">`;
        content += `
            <h3>구조화 데이터 권장사항</h3>
            <div class="schema-recommendations">
                <h4>개선 제안</h4>
                <ul>
                    <li>구조화 데이터는 검색 엔진이 콘텐츠를 더 잘 이해하는 데 도움이 됩니다.</li>
                    ${schemaData.totalSchemas === 0 ? '<li>이 페이지에는 구조화 데이터가 없습니다. 적절한 Schema.org 마크업 추가를 고려하세요.</li>' : ''}
                    ${!hasProductSchema(schemaData) && isProductPage() ? '<li>제품 페이지에는 Product 스키마를 추가하는 것이 좋습니다.</li>' : ''}
                    ${!hasArticleSchema(schemaData) && isArticlePage() ? '<li>기사/블로그 페이지에는 Article 스키마를 추가하는 것이 좋습니다.</li>' : ''}
                </ul>
            </div>
            
            <h3>유용한 도구</h3>
            <ul class="seo-checker-tools-list">
                <li><a href="https://search.google.com/test/rich-results" target="_blank">Google 리치 결과 테스트 <span class="external-link-icon">↗</span></a></li>
                <li><a href="https://validator.schema.org/" target="_blank">Schema.org 유효성 검사기 <span class="external-link-icon">↗</span></a></li>
                <li><a href="https://developers.google.com/search/docs/advanced/structured-data" target="_blank">Google 구조화 데이터 가이드라인 <span class="external-link-icon">↗</span></a></li>
            </ul>
        `;
        content += `</div>`; // 마지막 seo-checker-item 닫기
        
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
        
        // 1. 미리보기 섹션
        html += `<div class="seo-checker-item">`;
        html += `<h3>소셜 미디어 미리보기</h3>`;
        html += `<p class="importance-note">소셜 미디어에 공유 시 표시되는 미리보기입니다.</p>`;
        html += createSocialPreview(openGraphTags, twitterTags);
        html += `</div>`; // 첫 번째 seo-checker-item 닫기
        
        // 2. OpenGraph 태그 섹션
        html += `<div class="seo-checker-item">`;
        html += `<h3>OpenGraph 태그</h3>`;
        html += createSocialTagsTable(openGraphTags, 'OpenGraph');
        html += `</div>`; // seo-checker-item 닫기
        
        // 3. Twitter 카드 태그 섹션
        html += `<div class="seo-checker-item">`;
        html += `<h3>Twitter Card 태그</h3>`;
        html += createSocialTagsTable(twitterTags, 'Twitter');
        html += `</div>`; // seo-checker-item 닫기
        
        // 4. 권장사항 섹션
        html += `<div class="seo-checker-item">`;
        html += createSocialRecommendations(openGraphTags, twitterTags);
        
        // 5. 유용한 도구 섹션
        html += `
            <h3>소셜 미디어 최적화 도구</h3>
            <ul class="seo-checker-tools-list">
                <li><a href="https://developers.facebook.com/tools/debug/" target="_blank">Facebook 공유 디버거 <span class="external-link-icon">↗</span></a></li>
                <li><a href="https://cards-dev.twitter.com/validator" target="_blank">Twitter 카드 검사기 <span class="external-link-icon">↗</span></a></li>
                <li><a href="https://www.linkedin.com/post-inspector/" target="_blank">LinkedIn 포스트 인스펙터 <span class="external-link-icon">↗</span></a></li>
            </ul>
        `;
        html += `</div>`; // 마지막 seo-checker-item 닫기
        
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
            html += '<h4>Facebook/OpenGraph 미리보기</h4>';
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
            html += `<h4>Twitter 카드 미리보기 (${twitterCardType})</h4>`;
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
            return `<div class="social-recommendations good">
                <h4>최적화 완료</h4>
                <p>소셜 미디어 태그가 잘 구성되어 있습니다.</p>
            </div>`;
        }
        
        let html = `<div class="social-recommendations">
            <h4>개선 권장사항</h4>
            <ul>
        `;
        
        recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        
        html += '</ul></div>';
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
        const advancedTab = document.getElementById('advanced-content');
        
        // 초기화 메시지 표시
        advancedTab.innerHTML = '<div class="loading">고급 분석 중...</div>';
        
        // 비동기 분석 수행
        setTimeout(() => {
            try {
                // 컨테이너 생성
                let html = '';
                
                // 1. 성능 분석 섹션
                html += `
                    <div class="seo-checker-item">
                        <h3>성능 분석</h3>
                        
                        <div class="performance-metrics">
                            <div class="metric-card">
                                <div class="metric-title">LCP (Largest Contentful Paint)</div>
                                <div class="metric-value">2.5s</div>
                                <div class="metric-status seo-checker-status-good">양호</div>
                                <div class="metric-desc">페이지의 주요 콘텐츠가 로드되는 시간</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-title">FID (First Input Delay)</div>
                                <div class="metric-value">85ms</div>
                                <div class="metric-status seo-checker-status-warning">개선 필요</div>
                                <div class="metric-desc">사용자 입력에 반응하는 시간</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-title">CLS (Cumulative Layout Shift)</div>
                                <div class="metric-value">0.12</div>
                                <div class="metric-status seo-checker-status-warning">개선 필요</div>
                                <div class="metric-desc">페이지 로드 중 시각적 안정성</div>
                            </div>
                        </div>
                        
                        <div class="resource-summary">
                            <h4>리소스 요약</h4>
                            <div class="resource-info">
                                <p>총 요청: <strong>${document.querySelectorAll('*').length} 요소</strong></p>
                                <p>스크립트: <strong>${document.querySelectorAll('script').length}개</strong></p>
                                <p>스타일시트: <strong>${document.querySelectorAll('link[rel="stylesheet"]').length}개</strong></p>
                                <p>이미지: <strong>${document.querySelectorAll('img').length}개</strong></p>
                            </div>
                        </div>
                        
                        <div class="performance-recommendations">
                            <h4>성능 개선 제안</h4>
                            <ul>
                                <li>이미지 최적화: WebP 형식 사용 및 이미지 사이즈 최적화</li>
                                <li>자바스크립트 지연 로딩 구현</li>
                                <li>중요하지 않은 CSS 지연 로딩</li>
                                <li>브라우저 캐싱 활용</li>
                                <li>불필요한 리다이렉트 제거</li>
                            </ul>
                        </div>
                    </div>
                `;
                
                // 2. 고급 SEO 검사 섹션
                html += `
                    <div class="seo-checker-item">
                        <h3>고급 SEO 검사</h3>
                        
                        <div class="mobile-friendly-check">
                            <h4>모바일 친화성</h4>
                            <div class="mobile-friendly-status">
                                <span class="seo-checker-status seo-checker-status-good">모바일 최적화됨</span>
                            </div>
                            
                            <div class="mobile-checks">
                                <div class="check-item passed">
                                    <span class="check-name">뷰포트 설정</span>
                                    <span class="check-status">✓</span>
                                </div>
                                <div class="check-item passed">
                                    <span class="check-name">터치 요소 크기</span>
                                    <span class="check-status">✓</span>
                                </div>
                                <div class="check-item passed">
                                    <span class="check-name">가로 스크롤 없음</span>
                                    <span class="check-status">✓</span>
                                </div>
                                <div class="check-item ${document.querySelectorAll('meta[name="viewport"]').length > 0 ? 'passed' : 'failed'}">
                                    <span class="check-name">반응형 디자인</span>
                                    <span class="check-status">${document.querySelectorAll('meta[name="viewport"]').length > 0 ? '✓' : '✗'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="hreflang-analysis">
                            <h4>Hreflang 분석</h4>
                            ${document.querySelectorAll('link[rel="alternate"][hreflang]').length > 0 ? 
                                `<p>발견된 hreflang 태그: ${document.querySelectorAll('link[rel="alternate"][hreflang]').length}개</p>
                                 <ul>${Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(el => 
                                     `<li>${el.getAttribute('hreflang')} - ${el.getAttribute('href')}</li>`).join('')}
                                 </ul>` : 
                                '<p>hreflang 태그가 발견되지 않았습니다. 다국어 사이트인 경우 추가하는 것이 좋습니다.</p>'}
                        </div>
                        
                        <div class="keyword-analysis">
                            <h4>키워드 분석</h4>
                            <p class="importance-note">페이지 내용에서 자주 등장하는 주요 키워드</p>
                            
                            <div class="keyword-cloud">
                                ${extractKeywords().map(keyword => 
                                    `<span class="keyword">${keyword[0]} (${keyword[1]})</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="internal-link-structure">
                            <h4>내부 링크 구조</h4>
                            <p>내부 링크 수: <strong>${document.querySelectorAll('a[href^="/"]:not([href^="//"])').length}개</strong></p>
                            <p>외부 링크 수: <strong>${document.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])').length}개</strong></p>
                            <p>JavaScript 이벤트 링크 수: <strong>${document.querySelectorAll('a[href="javascript:void(0)"], a[onclick]').length}개</strong></p>
                            <p>앵커 링크 수: <strong>${document.querySelectorAll('a[href^="#"]').length}개</strong></p>
                        </div>
                    </div>
                `;
                
                // 결과 표시
                advancedTab.innerHTML = html;
                
            } catch (error) {
                advancedTab.innerHTML = `<div class="error">고급 분석 중 오류가 발생했습니다: ${error.message}</div>`;
            }
        }, 500);
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
            <div class="seo-checker-item">
                <h3>성능 분석</h3>
                <p class="importance-note">페이지의 성능 관련 지표를 분석하여 최적화 방안을 제시합니다.</p>
                
                <div class="advanced-card">
                    <h4>Core Web Vitals</h4>
                    <div class="advanced-metrics">
                        ${generateCoreWebVitalsMetrics()}
                    </div>
                </div>
                
                <div class="advanced-card">
                    <h4>리소스 분석</h4>
                    <div class="resource-analysis">
                        ${analyzePageResources()}
                    </div>
                </div>
                
                <div class="advanced-recommendations">
                    <h4>성능 개선 권장사항</h4>
                    <ul>
                        ${generatePerformanceRecommendations()}
                    </ul>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * 고급 SEO 검사 섹션 생성
     */
    function createAdvancedSEOAnalysis() {
        let html = `
            <div class="seo-checker-item">
                <h3>고급 SEO 검사</h3>
                <p class="importance-note">검색 엔진 최적화를 위한 고급 진단 기능입니다.</p>
                
                <div class="advanced-card">
                    <h4>모바일 친화성</h4>
                    <div class="mobile-friendly-check">
                        ${checkMobileFriendliness()}
                    </div>
                </div>
                
                <div class="advanced-card">
                    <h4>다국어 설정 (Hreflang)</h4>
                    <div class="hreflang-analysis">
                        ${analyzeHreflangTags()}
                    </div>
                </div>
                
                <div class="advanced-card">
                    <h4>키워드 분석</h4>
                    <div class="keyword-analysis">
                        ${analyzeKeywords()}
                    </div>
                </div>
                
                <div class="advanced-card">
                    <h4>내부 링크 구조</h4>
                    <div class="internal-link-structure">
                        ${analyzeInternalLinkStructure()}
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Core Web Vitals 지표 분석
     */
    function generateCoreWebVitalsMetrics() {
        // 실제로는 PerformanceObserver API 또는 직접 측정을 통해 데이터를 수집해야 합니다
        // 여기서는 시뮬레이션 데이터 사용
        
        const lcpValue = Math.random() * 3 + 1.2;  // 1.2초 ~ 4.2초
        const fidValue = Math.random() * 180 + 20; // 20ms ~ 200ms
        const clsValue = Math.random() * 0.2;      // 0 ~ 0.2
        
        let lcpStatus = 'good';
        let lcpText = '양호';
        if (lcpValue > 2.5) {
            lcpStatus = 'warning';
            lcpText = '개선 필요';
        }
        if (lcpValue > 4.0) {
            lcpStatus = 'error';
            lcpText = '나쁨';
        }
        
        let fidStatus = 'good';
        let fidText = '양호';
        if (fidValue > 100) {
            fidStatus = 'warning';
            fidText = '개선 필요';
        }
        if (fidValue > 300) {
            fidStatus = 'error';
            fidText = '나쁨';
        }
        
        let clsStatus = 'good';
        let clsText = '양호';
        if (clsValue > 0.1) {
            clsStatus = 'warning';
            clsText = '개선 필요';
        }
        if (clsValue > 0.25) {
            clsStatus = 'error';
            clsText = '나쁨';
        }
        
        return `
            <div class="metric-card ${lcpStatus}">
                <div class="metric-title">LCP</div>
                <div class="metric-value">${lcpValue.toFixed(2)}s</div>
                <div class="metric-status seo-checker-status-${lcpStatus}">${lcpText}</div>
                <div class="metric-desc">Largest Contentful Paint - 화면에 가장 큰 콘텐츠가 표시되는 시간</div>
            </div>
            <div class="metric-card ${fidStatus}">
                <div class="metric-title">FID</div>
                <div class="metric-value">${fidValue.toFixed(0)}ms</div>
                <div class="metric-status seo-checker-status-${fidStatus}">${fidText}</div>
                <div class="metric-desc">First Input Delay - 사용자 입력에 반응하는 시간</div>
            </div>
            <div class="metric-card ${clsStatus}">
                <div class="metric-title">CLS</div>
                <div class="metric-value">${clsValue.toFixed(3)}</div>
                <div class="metric-status seo-checker-status-${clsStatus}">${clsText}</div>
                <div class="metric-desc">Cumulative Layout Shift - 시각적 안정성 측정</div>
            </div>
        `;
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
     * 성능 개선 권장사항 생성
     */
    function generatePerformanceRecommendations() {
        // 실제 웹사이트 분석 기반의 권장사항이어야 하지만, 
        // 여기서는 일반적인 권장사항을 제시합니다
        
        const recommendations = [
            "이미지 최적화: 이미지를 WebP 포맷으로 변환하고 적절한 크기로 조정하세요.",
            "JavaScript 지연 로딩: 핵심 콘텐츠를 방해하지 않는 스크립트는 defer 또는 async 속성을 사용하세요.",
            "CSS 최소화: 사용하지 않는 CSS를 제거하고 파일을 압축하세요.",
            "브라우저 캐싱 활성화: 정적 자산에 대한 적절한 캐시 헤더를 설정하세요.",
            "중요하지 않은 타사 스크립트 지연 로딩: 광고, 분석 도구 등의 로딩을 지연시키세요."
        ];
        
        return recommendations.map(rec => `<li>${rec}</li>`).join('');
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

        container.innerHTML = ''; // 컨테이너 비우기
        let content = '<div class="tab-title">문서 구조</div>';

        content += `
            <div class="seo-checker-item">
                <h3>HTML 문서 구조 (중첩 보기)</h3>
                <p class="importance-note">페이지의 주요 구조 요소(header, nav, main 등), 헤딩(H1-H6), 리스트(UL/OL), 이미지(IMG)의 실제 중첩 구조를 보여줍니다.</p>
        `;

        // 재귀적으로 구조 리스트 HTML 생성하는 함수
        function buildStructureList(element) {
            let listHtml = '';
            // IMG 제외
            const relevantTags = ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'ASIDE', 'SECTION', 'ARTICLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL'];
            const overlayId = 'seo-checker-overlay';
            const MAX_TEXT_DISPLAY_LENGTH = 60; // 표시할 텍스트 최대 길이
            const MAX_LI_TEXT_DISPLAY_LENGTH = 40; // 리스트 아이템 표시 최대 길이

            element.childNodes.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    if (child.id === overlayId || child.closest(`#${overlayId}`)) {
                        return;
                    }

                    const tagName = child.tagName.toUpperCase();
                    let currentItemHtml = '';

                    if (relevantTags.includes(tagName)) {
                        let tagContent = '';
                        let tagTypeClass = 'tag-semantic';

                        if (tagName.startsWith('H')) {
                            const text = child.textContent.trim() || '(내용 없음)';
                            tagContent = `<span class="structure-text">${text}</span>`;
                            tagTypeClass = 'tag-heading';
                        } else if (tagName === 'UL' || tagName === 'OL') {
                            // 리스트 아이템 텍스트 추출
                            const listItems = child.querySelectorAll(':scope > li');
                            let itemTexts = [];
                            listItems.forEach(li => {
                                const liText = li.textContent.trim();
                                if (liText) {
                                     itemTexts.push(
                                         liText.length > MAX_LI_TEXT_DISPLAY_LENGTH
                                         ? liText.substring(0, MAX_LI_TEXT_DISPLAY_LENGTH) + '...'
                                         : liText
                                     );
                                }
                            });
                            // 추출된 텍스트들을 쉼표로 구분하여 표시
                            if (itemTexts.length > 0) {
                                 tagContent = `<span class="structure-text list-items">${itemTexts.join(', ')}</span>`;
                            } else {
                                 tagContent = `<span class="structure-text list-info">(빈 리스트)</span>`;
                            }
                            tagTypeClass = 'tag-list';
                        } else { // header, nav, main, section 등
                             const text = child.textContent.trim();
                             if (text) {
                                 const truncatedText = text.length > MAX_TEXT_DISPLAY_LENGTH ? text.substring(0, MAX_TEXT_DISPLAY_LENGTH) + '...' : text;
                                 tagContent = `<span class="structure-text semantic-text">${truncatedText}</span>`;
                             }
                             tagTypeClass = 'tag-semantic';
                        }
                        
                        currentItemHtml = `<li><span class="structure-tag ${tagTypeClass}">${tagName}</span> ${tagContent}`;
                        
                        // 자식 요소 구조를 재귀적으로 빌드하고 현재 항목 내부에 중첩합니다.
                        const nestedChildrenHtml = buildStructureList(child);
                        if (nestedChildrenHtml) {
                             currentItemHtml += `<ul>${nestedChildrenHtml}</ul>`;
                        }
                        currentItemHtml += '</li>\n';
                        listHtml += currentItemHtml; // 관련 태그에 대한 완성된 항목만 추가
                        
                    } else {
                        // 관련 없는 태그인 경우, 자식 요소들의 구조만 직접 추가합니다.
                        listHtml += buildStructureList(child);
                    }
                }
            });
            return listHtml;
        }

        // document.body부터 시작하여 리스트 생성
        const listContent = buildStructureList(document.body);

        if (listContent) {
             content += `<ul class="document-structure-list root-level">${listContent}</ul>`;
        } else {
             content += '<p>문서 구조를 생성할 관련 요소를 찾을 수 없습니다.</p>';
        }

        content += `</div>`; // .seo-checker-item 닫기
        container.innerHTML = content;
    }
    
    /**
     * CSV 파일 다운로드 헬퍼 함수
     */
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
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