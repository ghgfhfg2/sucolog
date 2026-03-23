# JS Coding Blog

정적 블로그 기반의 JavaScript 코딩 연습 사이트 초안입니다.

## 현재 포함된 것
- Jekyll 기본 설정
- 문제 컬렉션(`_problems`)
- 문제 목록 페이지
- 트랙 / 난이도 / 주제 기준 검색·필터 UI
- 문제 상세 페이지
- 브라우저 내 실행기(JS 전용, Worker 기반 격리 실행 + fallback)
- Monaco Editor 기반 코드 작성 UI (로드 실패 시 textarea fallback)
- localStorage 기반 코드 임시 저장
- 커스텀 테스트 입력 실행
- 힌트/해설 토글 UI
- 문제별 시간 제한 표시 및 TIMEOUT 판정
- `js-basic` 트랙용 학습형 레슨 카드 UI
- 문제 작성 가이드 및 템플릿
- 큐레이션 구조 문서
- 샘플 문제 4개

## 트랙 구조
- `today` — 오늘의 코테
- `algorithm` — 알고리즘별 코테
- `js-basic` — JS 메서드 학습

## 구조
- `_config.yml` — Jekyll 설정
- `_layouts/default.html` — 기본 레이아웃
- `_layouts/problem.html` — 문제 상세 페이지 레이아웃
- `_problems/` — 문제 데이터/본문
- `PROBLEM_AUTHORING.md` — 문제 작성 가이드
- `CURATION.md` — 큐레이션 구조 문서
- `problems/index.md` — 문제 목록 페이지
- `assets/js/problem-runner.js` — 실행기 + 본문 학습/토글 처리
- `assets/js/problem-filters.js` — 문제 목록 필터/검색
- `assets/css/style.css` — 기본 스타일

## 참고
- 시간 제한은 브라우저 환경 기준의 근사치입니다.
- 기기 성능과 브라우저 차이에 따라 실제 체감 결과는 달라질 수 있습니다.
- 정식 온라인 저지 수준의 공정한 시간 측정은 아닙니다.
- `js-basic` 트랙은 일반 코테보다 학습 설명의 품질을 더 중요하게 다룹니다.

## 다음 단계
1. 트랙별 랜딩/큐레이션 페이지 추가
2. `js-basic` 전용 템플릿 문제 더 추가
3. 결과 패널 표현 개선
4. GitHub Pages 배포 준비
