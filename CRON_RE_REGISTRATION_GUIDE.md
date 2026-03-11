# CRON 재등록 가이드 (수동 복구/재구성용)

이 문서는 크론잡을 지우거나 꼬였을 때 **빠르게 동일 구성으로 재등록**하기 위한 운영 문서다.

## 1) 사전 확인

```bash
openclaw cron list --all --json
```

- 현재 잡 상태/이름/스케줄/전달 대상 확인
- 중복 등록 방지

---

## 2) 현재 기준 운영 정책

### A. 개발로그 (sooyaBlg)
- 시간: 매일 **08:00**, **20:00**
- 용도: 개발 블로그 자동 발행
- 전달: 일반적으로 `delivery.mode=none` (조용히 실행)

### B. 경제블로그 (sucolog)
- 시간: 매일 **09:00**, **18:00**
- 용도: `economy-blog-jekyll`에 글 발행 + 배포 확인
- 전달: Telegram 토픽 `-1003831870251:topic:419`로 결과 공지
- 카테고리 규칙: **기존 경제블로그 카테고리 내에서만 선택** (신규 카테고리 임의 생성 금지)

---

## 3) 재등록 명령어 템플릿

> 아래 명령은 `/home/sooya/.openclaw/workspace` 기준.

### 3-1) sucolog 09:00 등록

```bash
openclaw cron add \
  --name "sucolog-post-0900" \
  --cron "0 9 * * *" \
  --tz "Asia/Seoul" \
  --session isolated \
  --announce \
  --channel telegram \
  --to "-1003831870251:topic:419" \
  --message "다음 작업을 순서대로 수행해줘.
1) /home/sooya/.openclaw/workspace/GLOBAL_BLOG_GUIDELINES.md 와 /home/sooya/.openclaw/workspace/blog-kit/COMMON_BLOG_GUIDELINES.md 기준을 따른다.
2) 경제 블로그(sucolog) 신규 글 1개를 작성한다. 카테고리는 현재 운영 중인 경제블로그의 기존 카테고리 안에서 자유 선택한다(신규 카테고리 임의 생성 금지).
3) 저장소 /home/sooya/.openclaw/workspace/economy-blog-jekyll 의 _posts 에 Jekyll 포스트 파일을 생성한다.
4) 최종 점검 후 /home/sooya/.openclaw/workspace/economy-blog-jekyll 에서 git add -A && git commit -m \"chore: publish sucolog post (09:00)\" && git push origin main 을 수행한다.
5) 배포 완료까지 확인한다(푸시 성공 + 배포 반영 여부 확인).
6) 실행 결과(제목, 파일경로, 커밋해시, 배포 반영 상태, 게시 URL)를 이 토픽에 간단히 보고한다." \
  --json
```

### 3-2) sucolog 18:00 등록

```bash
openclaw cron add \
  --name "sucolog-post-1800" \
  --cron "0 18 * * *" \
  --tz "Asia/Seoul" \
  --session isolated \
  --announce \
  --channel telegram \
  --to "-1003831870251:topic:419" \
  --message "다음 작업을 순서대로 수행해줘.
1) /home/sooya/.openclaw/workspace/GLOBAL_BLOG_GUIDELINES.md 와 /home/sooya/.openclaw/workspace/blog-kit/COMMON_BLOG_GUIDELINES.md 기준을 따른다.
2) 경제 블로그(sucolog) 신규 글 1개를 작성한다. 카테고리는 현재 운영 중인 경제블로그의 기존 카테고리 안에서 자유 선택한다(신규 카테고리 임의 생성 금지).
3) 저장소 /home/sooya/.openclaw/workspace/economy-blog-jekyll 의 _posts 에 Jekyll 포스트 파일을 생성한다.
4) 최종 점검 후 /home/sooya/.openclaw/workspace/economy-blog-jekyll 에서 git add -A && git commit -m \"chore: publish sucolog post (18:00)\" && git push origin main 을 수행한다.
5) 배포 완료까지 확인한다(푸시 성공 + 배포 반영 여부 확인).
6) 실행 결과(제목, 파일경로, 커밋해시, 배포 반영 상태, 게시 URL)를 이 토픽에 간단히 보고한다." \
  --json
```

### 3-3) 개발로그 08:00 등록(참고)

```bash
openclaw cron add \
  --name "sooyablg-post-0800" \
  --cron "0 8 * * *" \
  --tz "Asia/Seoul" \
  --session isolated \
  --no-deliver \
  --message "(개발로그 자동 발행 프롬프트)" \
  --json
```

### 3-4) 개발로그 20:00 등록(참고)

```bash
openclaw cron add \
  --name "sooyablg-post-2000" \
  --cron "0 20 * * *" \
  --tz "Asia/Seoul" \
  --session isolated \
  --no-deliver \
  --message "(개발로그 자동 발행 프롬프트)" \
  --json
```

---

## 4) 수정/비활성화/활성화 빠른 명령

### 이름/메시지/전달대상 수정
```bash
openclaw cron edit <JOB_ID> --name "새이름"
openclaw cron edit <JOB_ID> --message "새 프롬프트"
openclaw cron edit <JOB_ID> --channel telegram --to "-1003831870251:topic:419" --announce
```

### 비활성화/활성화
```bash
openclaw cron disable <JOB_ID>
openclaw cron enable <JOB_ID>
```

> 주의: `disable/enable`은 **ID 기반**이다. (name 옵션 없음)

---

## 5) 검증 체크리스트

재등록 직후 아래를 확인:

1. `openclaw cron list --all --json` 결과에서
   - `enabled: true`
   - `schedule.expr` / `tz` 정확
   - `delivery.to`가 기대 토픽인지
2. `nextRunAtMs`가 정상 계산됐는지
3. 필요 시 수동 테스트

```bash
openclaw cron run <JOB_ID>
```

---

## 6) 운영 팁

- 이름 규칙 통일: `서비스-작업-시간`
  - 예: `sucolog-post-0900`
- 목적이 다른 잡(개발로그/경제블로그)은 절대 묶어서 disable 하지 말 것
- 토픽 전달이 필요한 잡은 반드시 `--to <chatId:topic:id>` 지정
- 배포형 잡은 프롬프트에 `git push` + `배포 반영 확인` 문구를 명시

---

## 7) 장애 시 복구 순서(요약)

1. `cron list --all --json`으로 상태 파악
2. 잘못된 잡은 `disable`
3. 필요한 잡은 `edit` 또는 `add`로 재구성
4. `cron run`으로 1회 검증
5. 결과 보고
