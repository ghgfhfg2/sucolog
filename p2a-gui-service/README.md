# P2A GUI Service (MVP Skeleton)

웹은 입력/관리 UI, 실제 처리는 Agent Worker가 담당하는 구조의 초기 골격입니다.

## 포함된 것

- `apps/api`: Express + BullMQ 기반 잡 API
- 입력 검증: Zod
- 포맷 출력: JSON/CSV/XLSX/PDF
- 잡 상태: queued/running/success/failed

## 빠른 실행

```bash
cd p2a-gui-service
npm install
cp apps/api/.env.example apps/api/.env
# redis 필요
npm run dev:api
```

### API

- `GET /health`
- `POST /jobs`
  - body:

```json
{
  "prompt": "마케팅 카피 5개",
  "outputCount": 5,
  "format": "json"
}
```

- `GET /jobs`
- `GET /jobs/:id`

## 다음 작업

1. OpenAI 실제 연동 (`aiService.ts`)
2. PostgreSQL 영속 저장 (현재 in-memory)
3. 스케줄러(Cron/Bull repeat) 및 종료 조건 구현
4. `apps/web` UI 연결 (Next.js)
