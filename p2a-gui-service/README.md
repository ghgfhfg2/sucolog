# P2A GUI Service (MVP Skeleton)

웹은 입력/관리 UI, 실제 처리는 Agent Worker가 담당하는 구조의 초기 골격입니다.

## 포함된 것

- `apps/api`: Express + BullMQ 기반 잡 API
- 입력 검증: Zod
- 포맷 출력: JSON/CSV/XLSX/PDF
- 잡 상태: queued/running/success/failed
- AI 호출 대신 **Agent Bridge** 구조

## 빠른 실행

```bash
cd p2a-gui-service
npm install
cp apps/api/.env.example apps/api/.env
# redis 필요
npm run dev:api
```

대시보드: `http://localhost:4000`

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

## Agent Bridge

`apps/api/src/services/agentBridge.ts`

지원 모드:

- `AGENT_BRIDGE_MODE=mock`
  - 서버 내부 mock 데이터 생성
- `AGENT_BRIDGE_MODE=webhook`
  - 외부 브리지 엔드포인트로 위임
  - 요청 바디: `{ prompt, outputCount }`
  - 응답 바디: `{ items: Record<string, unknown>[] }`
- `AGENT_BRIDGE_MODE=openclaw-cli`
  - 로컬 OpenClaw CLI(`openclaw agent --json`)를 호출해서 직접 생성
  - `.env` 설정:
    - `OPENCLAW_BIN` (기본: `openclaw`)
    - `OPENCLAW_AGENT_SESSION_ID` (기본: `p2a-worker`)
    - `OPENCLAW_AGENT_TIMEOUT_SECONDS` (기본: `120`)

## 다음 작업

1. PostgreSQL 영속 저장 (현재 in-memory)
2. 스케줄러(Cron/Bull repeat) 및 종료 조건 구현
3. `apps/web` UI 연결 (Next.js)
