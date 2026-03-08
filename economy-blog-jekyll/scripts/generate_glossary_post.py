#!/usr/bin/env python3
import re
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
    title = f"삼촌이 조카에게 알려주는 '{term}' 한 방 정리"

    body = f'''---
layout: post
title: "{title}"
categories: ["{CATEGORY_NAME}"]
---

퇴근길에 조카가 묻더라.

**조카:**
삼촌, 뉴스에 **{term}**가 계속 나오는데 이게 왜 그렇게 중요해?

**삼촌:**
좋아, 오늘은 딱 1분 안에 핵심 잡고,
그다음 5분 안에 실전에서 써먹을 수 있게 알려줄게.
어렵게 말 안 하고, 진짜 생활 언어로 간다.

## 1) {term}, 한 줄로 뭐야?
**{term}는 경제 기사에서 상황을 해석하는 핵심 신호**야.
이 신호가 어디로 움직이느냐에 따라
물가, 대출이자, 투자심리, 소비 분위기가 같이 흔들려.

쉽게 말하면,
우리가 날씨 볼 때 “온도 + 강수확률” 같이 보듯,
경제에선 **{term}**를 보고 “지금 시장 체온이 어떤지” 판단하는 거야.

## 2) 왜 뉴스는 맨날 {term}를 강조할까?
이유는 단순해.

1. **영향 범위가 넓다**: 기업, 가계, 정부까지 동시에 영향 받음
2. **기대 심리를 바꾼다**: 사람들의 소비/투자 결정을 미리 움직임
3. **다른 지표와 연결된다**: 금리·환율·물가 같은 지표와 같이 해석됨

즉, {term} 하나만 보는 게 아니라,
{term}를 중심으로 주변 지표를 엮어 봐야 기사 이해도가 확 올라가.

## 3) 조카도 바로 이해되는 생활 비유
가계부로 비유해보자.

- 월급, 고정지출, 카드값 흐름을 보고 다음 달 소비를 정하잖아?
- 경제도 똑같이 주요 지표를 보고 다음 분기 전략을 정해.
- 여기서 **{term}는 ‘가계부의 빨간 줄’ 같은 경고/신호** 역할을 해.

그래서 뉴스에서 {term}가 튀어나오면,
“아, 지금 방향 전환 신호가 나오는 구간이구나”라고 보면 돼.

## 4) 기사 읽을 때 실전 체크리스트 (진짜 중요)
뉴스에서 {term}를 봤다면 아래 4가지를 같이 확인해.

- **방향**: 이전보다 올라가는지 / 내려가는지
- **속도**: 천천히 변하는지 / 급격한지
- **지속성**: 일시 이슈인지 / 몇 달 이어지는 흐름인지
- **연동 지표**: 금리, 환율, 유가, 고용 지표가 같은 방향인지

이 4개만 체크해도
“헤드라인 공포”에 흔들릴 확률이 크게 줄어.

## 5) 사람들이 자주 하는 오해
**오해 1.** {term} 하나만 보면 된다?
→ 아니야. 단일 지표는 오해를 만들 수 있어. 항상 맥락(다른 지표)과 같이 봐야 해.

**오해 2.** 숫자가 움직였으니 당장 위기다?
→ 변화의 폭·속도·기간이 더 중요해. 하루치 데이터로 결론 내리면 안 돼.

**오해 3.** 전문가 말이 다 다르니 의미 없다?
→ 관점이 다른 거지, 데이터가 없는 게 아냐. 공통분모를 찾으면 길이 보여.

## 6) 오늘부터 이렇게 써먹자
내일 뉴스에서 {term}가 나오면,
다음 질문 3개를 스스로 던져봐.

1. “이 변화가 내 지출(대출·물가·환율)에 어떤 영향을 줄까?”
2. “이게 일시 이벤트인지, 추세 전환인지?”
3. “정부·중앙은행·기업이 실제로 어떤 대응을 하고 있지?”

이 3문장만 반복하면
경제 뉴스가 ‘어려운 글’에서 ‘의사결정 도구’로 바뀐다.

## 삼촌의 한 줄 마무리
**{term}는 정답이 아니라 방향을 읽는 나침반**이야.
숫자 하나에 놀라지 말고,
흐름·맥락·지속성까지 같이 보면
뉴스가 훨씬 덜 무섭고, 훨씬 유용해진다.
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
