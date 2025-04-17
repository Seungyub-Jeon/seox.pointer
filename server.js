const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// CORS 설정 - 모든 도메인에서 접근할 수 있도록 허용
app.use(cors());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(port, () => {
  console.log(`SEO & 웹접근성 체크 북마클릿 서버가 http://localhost:${port}에서 실행 중입니다`);
}); 