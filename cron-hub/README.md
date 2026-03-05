# Cron Hub (MVP)

주제별로 크론잡 상태를 보고, 간단하게 관리하는 웹 대시보드입니다.

## 기능
- 주제 목록/생성
- 주제별 잡 목록 조회
- 잡 추가
- 잡 즉시 실행(수동 실행 이력 기록)
- 잡 중지/재개
- 잡 이름/스케줄 수정
- 잡 삭제
- 필터(전체/실패/활성), 검색
- **시스템 crontab 자동 반영** (cron-hub 관리 블록)
- **기존 crontab 가져오기(import)**

## 실행
```bash
cd cron-hub
npm install
npm run dev
```

브라우저: http://localhost:4000

## 참고
- 상단 `기존 크론 가져오기` 버튼으로 현재 사용자 crontab을 DB로 가져올 수 있습니다.
- 이 앱은 DB에 저장된 **활성 잡(enabled=1)** 을 모아서 현재 사용자 crontab에 반영합니다.
- crontab에는 아래 블록이 생성/갱신됩니다.
  - `# >>> cron-hub managed start >>>`
  - `# <<< cron-hub managed end <<<`
- 기존 crontab의 다른 라인은 유지됩니다.
- `실행` 버튼은 즉시 시스템 커맨드를 실행하는 기능이 아니라 실행 이력 기록용입니다.
