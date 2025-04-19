# 🔍 SEO & 웹접근성 체크 북마클릿 툴

북마클릿(bookmarklet)을 통해 웹사이트의 SEO와 웹 접근성 항목을 간편하게 진단할 수 있는 툴입니다. 별도의 설치 없이 북마클릿을 클릭만 하면 현재 페이지를 분석하고 진단 결과를 한눈에 확인할 수 있습니다.

## 📢 최신 업데이트

- **코드 최적화**: 모듈화를 통한 성능 개선 및 유지보수 편의성 증대
- **성능 개선**: 페이지 분석 속도 향상 및 리소스 사용 최적화
- **UI 개선**: 사용자 인터페이스 개선으로 분석 결과를 더 직관적으로 확인 가능
- **소셜 미디어 태그 분석 개선**: Open Graph 및 Twitter Card 분석 기능 강화
- **고급 분석 기능 추가**: 페이지 성능 및 고급 SEO 요소 분석 기능 추가

## 📌 목적

이 툴은 다음과 같은 목적을 가지고 개발되었습니다:

- 웹사이트의 주요 SEO 요소 및 웹 접근성 요소를 빠르게 진단
- 개발자, 디자이너, 기획자 누구나 쉽게 사용할 수 있도록 북마클릿 형태 제공
- 설치나 로그인 없이 실시간으로 진단 가능

## 🎯 주요 기능

### ✅ 진단 탭 구성

모든 분석 결과는 탭 UI를 통해 정리되어 표시됩니다:

1. **개요 (Overview)**
   - 페이지 타이틀 (길이 포함)
   - 메타 디스크립션 (길이 포함)
   - URL 및 index 가능 여부
   - Canonical URL 확인
   - Robots / X-Robots-Tag 유무
   - 키워드 메타 태그 유무
   - 본문 단어 수
   - 언어 속성(lang) 확인
   - Hreflang 지원 정보

2. **제목 구조 (Headings)**
   - 각 H1 ~ H6 태그 개수
   - 구조적 순서 진단
   - 빈 제목 요소 검출

3. **문서 구조 (Document Structure)**
   - 페이지의 구조적 요소 (Header, Nav, Main, Footer 등) 확인
   - 구조 중첩 관계 시각화
   - 시맨틱 태그 사용 분석

4. **링크 (Links)**
   - 총 링크 수 / 고유 링크 수
   - 내부 / 외부 링크 구분
   - 잘못된 링크(`href` 없음) 식별
   - 새 창으로 열리는 링크 검사
   - **내보내기**: 내부/외부 링크 리스트 CSV 내보내기

5. **이미지 (Images)**
   - 이미지 총 개수 및 유형별 분류
   - 접근성 속성 검사 (`alt` 속성 누락 이미지 식별)
   - 성능 최적화 속성 검사 (`loading="lazy"`, `srcset` 등)
   - 이미지 크기 및 형식 분석 (압축률, 최적화 여부)
   - 반응형 이미지 검사 (모바일 대응성)
   - **내보내기**: 모든 이미지 정보 CSV 파일로 저장

6. **스키마 (Schema)**
   - JSON-LD, Microdata, RDFa 형식 스키마 마크업 식별
   - 주요 스키마 타입 수집 및 출력
   - 스키마 구조 시각화

7. **소셜 (Social)**
   - Open Graph 메타 태그 (og:title, og:description 등) 분석
   - Twitter Card 메타 태그 분석
   - 소셜 미디어 미리보기 및 최적화 제안

8. **고급 설정 (Advanced)**
   - 성능 분석 (LCP, FID, CLS)
   - 모바일 친화성 검사
   - Hreflang 분석
   - 키워드 분석
   - 내부 링크 구조 분석

## 🧑‍💻 사용 방법

1. 북마클릿 스크립트를 브라우저 북마크에 등록
2. 진단하고 싶은 웹페이지에 접속
3. 북마크 클릭 → 페이지 우측에 탭 기반 UI로 진단 결과 출력

진단 결과는 항목별로 `양호`, `주의`, `오류` 상태로 표시되며, 각 항목에는 설명과 해결 가이드가 함께 제공됩니다.

## 🚀 시작하기

### 서버 설정 및 실행

1. 이 저장소를 클론합니다.

```bash
git clone https://github.com/your-username/seox.pointer.git
```

2. 프로젝트 폴더로 이동합니다.

```bash
cd seox.pointer
```

3. 필요한 패키지를 설치합니다.

```bash
npm install
```

4. 서버를 시작합니다.

```bash
npm start
```

5. 브라우저에서 `http://localhost:3000`으로 접속합니다.

### 북마클릿 설치 및 사용

1. `http://localhost:3000` 페이지에서 북마클릿 링크를 북마크바에 드래그합니다.
2. 분석하고 싶은 웹페이지로 이동합니다.
3. 북마크바에서 방금 저장한 북마클릿을 클릭합니다.
4. 북마클릿이 해당 페이지를 분석하고 결과를 화면 우측에 표시합니다.

### 서버 배포

실제 사용을 위해서는 서버를 배포해야 합니다:

1. Vercel, Netlify, Heroku 등의 호스팅 서비스에 배포합니다.
2. 배포 후 `bookmarklet.js` 파일의 URL 값을 실제 서버 URL로 변경합니다.
3. 변경된 북마클릿 코드를 사용자에게 제공합니다.

## 📂 프로젝트 구조

```typescript
seox.pointer/
├── server.js                 # Express 서버
├── package.json              # 프로젝트 의존성 정보
├── index.html                # 메인 페이지 (서버에서 제공)
├── bookmarklet.js            # 북마클릿 스크립트
├── styles.css                # 전역 스타일
├── public/                   # 정적 파일 디렉토리
│   ├── css/                  # CSS 파일
│   │   ├── style.css         # 메인 페이지 스타일
│   │   └── seo-checker.css   # 북마클릿 UI 스타일
│   ├── js/                   # JavaScript 파일
│   │   └── seo-checker.js    # 메인 분석 스크립트
│   └── bookmarklet.min.js    # 최소화된 북마클릿 스크립트
├── README.md                 # 프로젝트 문서
└── doc/                      # 추가 문서 디렉토리
    └── read.me               # 상세 기획 문서
```

## ⚠️ 제약 사항 및 주의

- 북마클릿은 보안 정책(CORS 등)에 따라 일부 기능 제한 가능
- iframe으로 구성된 사이트에서는 정상 동작하지 않을 수 있음
- 서버가 실행 중이고 접근 가능해야 북마클릿이 작동함
- 고급 웹 접근성 진단 기능(스크린리더, 키보드 시뮬레이션 등)은 미포함

## 🚀 향후 개선 방향

- Lighthouse API 연동하여 고급 SEO/접근성 분석 기능 추가
- 결과 PDF/CSV 내보내기 기능 추가
- 브라우저 확장 프로그램으로 기능 확장
- 구조화된 리포트 PDF 다운로드 기능
- 서버리스 함수로 변환하여 서버 의존성 줄이기

## 📬 기여 & 문의

Pull Request 및 Issue를 통해 피드백을 환영합니다.  
개선 아이디어나 버그 제보는 언제든지 알려주세요!
