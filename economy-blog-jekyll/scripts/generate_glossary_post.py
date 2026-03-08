#!/usr/bin/env python3
import re
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "_posts"

CATEGORY_NAME = "삼촌이 쉽게 알려주는 경제용어"
TERM_LIST = [
    "기준금리", "물가상승률", "CPI", "PPI", "환율", "실질금리", "명목금리", "국채", "회사채", "신용스프레드",
    "유동성", "통화량", "양적완화", "양적긴축", "경기침체", "경기선행지수", "GDP", "실업률", "연착륙", "경착륙",
    "리세션", "스태그플레이션", "디스인플레이션", "기저효과", "무역수지", "경상수지", "외환보유액", "원자재", "유가", "공급망"
]


def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"[^a-z0-9가-힣\s-]", "", t)
    t = re.sub(r"\s+", "-", t)
    return t[:50] or "economic-term"


def used_terms() -> set[str]:
    used = set()
    for p in POSTS.glob("*.md"):
        try:
            raw = p.read_text(encoding="utf-8")
        except Exception:
            continue

        if CATEGORY_NAME not in raw:
            continue

        m = re.search(r'title:\s*"?(.+?)"?\n', raw)
        if not m:
            continue
        title = m.group(1)
        for term in TERM_LIST:
            if term in title:
                used.add(term)
    return used


def pick_next_term() -> str:
    used = used_terms()
    for term in TERM_LIST:
        if term not in used:
            return term
    # 모두 소진되면 다시 순환
    return TERM_LIST[0]


def build_post(term: str):
    today = datetime.now(KST).date().isoformat()
    filename = f"{today}-경제용어-{slugify(term)}.md"

    rng = random.Random(f"{today}:{term}")

    title_templates = [
        "삼촌이 조카에게 알려주는 '{term}' 한 방 정리",
        "뉴스에서 자꾸 보이는 '{term}', 삼촌이 쉽게 풀어줌",
        "헷갈리는 '{term}' 10분 완전 이해 (삼촌 설명 버전)",
    ]
    title = rng.choice(title_templates).format(term=term)

    scenes = [
        "토요일 아침, 조카가 토스트를 굽다가 경제 뉴스를 보더니 갑자기 나를 불렀다.",
        "버스 기다리던 출근길, 조카가 휴대폰 화면을 들이밀며 물었다.",
        "저녁 먹고 설거지하던 중에, 조카가 뉴스 알림을 보고 표정이 굳었다.",
        "편의점 앞 벤치에서 아이스크림 먹다가 조카가 먼저 말을 꺼냈다.",
    ]

    opening_questions = [
        "삼촌, **{term}**가 오르면 진짜 우리 생활비도 바로 오르는 거야?",
        "요즘 기사마다 **{term}** 얘기인데, 이거 모르면 뉴스 이해 못 하는 수준이야?",
        "**{term}** 때문에 시장이 흔들린다는데, 그게 내 통장하고 무슨 상관이야?",
    ]

    uncle_openings = [
        "좋은 질문이다. 오늘은 외운다는 느낌 말고, 딱 이해되는 느낌으로 가보자.",
        "오케이, 오늘은 용어 암기 금지. 생활 비유로 끝까지 간다.",
        "이거 제대로 알면 뉴스 볼 때 멘붕이 확 줄어. 천천히 가자.",
    ]

    analogy_blocks = [
        "온도계 비유로 보면 쉬워.\n- 체온이 높아지면 몸 상태를 의심하듯\n- {term}가 급격히 변하면 시장 컨디션을 의심해야 해\n- 중요한 건 숫자 1회가 아니라 ‘며칠 연속 같은 방향’이야",
        "운전 비유로 보면 더 직관적이야.\n- 속도계만 보면 위험해, 앞차 거리랑 도로 상황도 같이 봐야 하잖아\n- 경제도 {term} 하나만 보면 오판하기 쉬워\n- 금리·환율·고용 같은 주변 지표를 같이 봐야 브레이크 타이밍이 보여",
        "가계부 비유도 좋아.\n- 카드값이 한 달만 튀면 이벤트일 수 있어\n- 3개월 연속이면 생활 패턴이 바뀐 신호지\n- {term}도 똑같아. 단기 변동보다 추세 확인이 먼저야",
    ]

    action_blocks = [
        "## 실전에서 이렇게 써먹자\n내일 뉴스에서 {term}가 나오면 이 순서로 보자.\n\n1. **전월/전분기 대비 변화 폭**이 큰가?\n2. 같은 기간에 **금리·환율·유가**도 같은 방향인가?\n3. 정부/중앙은행/기업이 **행동(멘트 말고 실제 조치)**을 했나?\n\n이 3개만 보면 ‘자극적 제목’에 덜 흔들린다.",
        "## 기사 읽기 체크리스트\n헤드라인 보기 전에 아래를 먼저 확인해.\n\n- 숫자가 **한 번만 튄 건지**, 연속 추세인지\n- 관련 업종 주가/채권/환율이 **같이 반응했는지**\n- 전문가 코멘트가 전망인지, 실제 데이터인지\n\n체크리스트를 습관으로 만들면 경제 뉴스 난도가 급격히 낮아진다.",
        "## 조카용 3문장 정리법\n기사 1개 읽고 아래 3문장을 바로 적어봐.\n\n- ""{term} 변화가 내 지출에 주는 영향은 OOO""\n- ""이건 단기 이벤트/중기 추세 중 OOO에 가깝다""\n- ""다음 확인할 지표는 OOO다""\n\n이 훈련을 2주만 하면 뉴스를 ‘읽는 수준’에서 ‘해석하는 수준’으로 올라가.",
    ]

    ending_lines = [
        "**{term}는 답안지가 아니라 방향 표지판**이야. 숫자 자체보다 맥락을 읽는 사람이 결국 덜 흔들린다.",
        "결론은 하나야. **{term}를 외우지 말고, 흐름을 읽는 도구로 써라.** 그게 진짜 실전 경제력이다.",
        "뉴스를 잘 보는 사람은 어려운 단어를 많이 아는 사람이 아니라, **{term}를 생활 언어로 번역할 줄 아는 사람**이야.",
    ]

    body = f'''---
layout: post
title: "{title}"
categories: ["{CATEGORY_NAME}"]
---

{rng.choice(scenes)}

**조카:**
{rng.choice(opening_questions).format(term=term)}

**삼촌:**
{rng.choice(uncle_openings)}

## 1) {term}, 핵심부터 잡자
**{term}는 경제 흐름을 해석하는 중요한 신호**야.
이 신호가 변하면 물가, 대출이자, 투자 심리, 소비 타이밍까지 연결돼서 움직인다.

여기서 중요한 건 “올랐냐/내렸냐” 한 줄이 아니고,
**왜 변했는지 + 얼마나 오래 갈지 + 다른 지표와 같이 움직이는지**를 함께 보는 거야.

## 2) 왜 기사에서 {term}를 반복해서 말할까?
이유는 세 가지로 정리된다.

1. **파급 범위가 넓다**: 가계, 기업, 정부 모두 영향을 받는다
2. **기대 심리를 건드린다**: 사람들의 소비·투자 행동이 먼저 반응한다
3. **정책 판단과 연결된다**: 중앙은행/정부의 메시지 해석에 핵심 기준이 된다

즉, {term}를 이해하면 기사 한 줄이 아니라
“지금 시장이 무엇을 걱정하는지”까지 읽힌다.

## 3) 생활 비유로 끝내기
{rng.choice(analogy_blocks).format(term=term)}

## 4) 사람들이 자주 헷갈리는 포인트
**오해 1.** {term} 하나만 보면 충분하다?
→ 단일 지표 해석은 위험해. 반드시 동행 지표를 같이 봐야 한다.

**오해 2.** 숫자 변동이 나오면 바로 위기다?
→ 변동의 ‘방향’보다 ‘지속성’이 더 중요하다. 하루치 데이터는 소음일 수 있다.

**오해 3.** 전문가 의견이 다르면 데이터도 무의미하다?
→ 관점이 다를 뿐 핵심 데이터는 같다. 공통 신호를 찾는 게 핵심이다.

{rng.choice(action_blocks).format(term=term)}

## 삼촌의 마지막 코멘트
{rng.choice(ending_lines).format(term=term)}
'''

    return filename, body


def main():
    term = pick_next_term()
    filename, content = build_post(term)
    target = POSTS / filename

    if target.exists():
        print(f"Skip: already exists {filename}")
        return

    target.write_text(content, encoding="utf-8")
    print(f"Created {target}")


if __name__ == "__main__":
    main()
