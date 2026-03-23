# JS Coding Blog

정적 블로그 기반의 JavaScript 코딩 연습 사이트 초안입니다.

## 현재 포함된 것
- Jekyll 기본 설정
- 문제 컬렉션(`_problems`)
- 문제 목록 페이지
- 문제 상세 페이지
- 브라우저 내 실행기(JS 전용)
- localStorage 기반 코드 임시 저장
- 샘플 문제 1개

## 구조
- `_config.yml` — Jekyll 설정
- `_layouts/default.html` — 기본 레이아웃
- `_layouts/problem.html` — 문제 상세 페이지 레이아웃
- `_problems/` — 문제 데이터/본문
- `problems/index.md` — 문제 목록 페이지
- `assets/js/problem-runner.js` — 실행기
- `assets/css/style.css` — 기본 스타일

## 다음 단계
1. `bundle exec jekyll serve`
2. 문제 추가
3. textarea → Monaco Editor 업그레이드
4. sandbox iframe 기반 실행으로 격리 강화
