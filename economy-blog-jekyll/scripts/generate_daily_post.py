#!/usr/bin/env python3
import json
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "_data" / "hot_topics.json"
POSTS = ROOT / "_posts"

GENERIC_KEYWORDS = {"경제", "시장", "뉴스"}
FORMAT_LABEL_PREFIX = "포맷:"
FORMAT_TYPES = [
    "dialogue_explainer",
    "timeline_brief",
    "checklist",
    "mythbuster",
    "impact_map",
]


def slugify(text: str) -> str:
    t = text.lower()
    t = re.sub(r"[^a-z0-9가-힣\s-]", "", t)
    t = re.sub(r"\s+", "-", t).strip("-")
    if not t:
        t = "hot-topic"
    return t[:40]


def pick_topic(payload, recent_slugs=None):
    topics = payload.get("hot_topics", [])
    recent_slugs = set(recent_slugs or [])

    for t in topics:
        kw = t.get("keyword", "")
        if not kw:
            continue
        if kw.lower() in GENERIC_KEYWORDS:
            continue
        if len(t.get("articles", [])) < 2:
            continue
        if slugify(kw) in recent_slugs:
            continue
        return t

    for t in topics:
        kw = t.get("keyword", "")
        if kw and kw.lower() not in GENERIC_KEYWORDS and len(t.get("articles", [])) >= 2:
            return t

    return topics[0] if topics else None


def collect_recent_post_meta(limit=8):
    metas = []
    for p in sorted(POSTS.glob("*.md"), reverse=True)[:limit]:
        text = p.read_text(encoding="utf-8")
        title_match = re.search(r'^title:\s*"([^"]+)"', text, re.MULTILINE)
        cats_match = re.search(r"^categories:\s*\[(.*?)\]", text, re.MULTILINE)
        categories = []
        if cats_match:
            categories = [c.strip().strip('"\'') for c in cats_match.group(1).split(",") if c.strip()]

        format_name = None
        for cat in categories:
            if cat.startswith(FORMAT_LABEL_PREFIX):
                format_name = cat[len(FORMAT_LABEL_PREFIX) :]
                break

        metas.append(
            {
                "path": p,
                "title": title_match.group(1) if title_match else p.stem,
                "categories": categories,
                "format": format_name,
            }
        )
    return metas


def choose_format(recent_meta):
    recent_formats = [m["format"] for m in recent_meta if m.get("format")]
    recent_counter = Counter(recent_formats)
    last_two = recent_formats[:2]

    candidates = [fmt for fmt in FORMAT_TYPES if fmt not in last_two]
    if not candidates:
        candidates = list(FORMAT_TYPES)

    return sorted(candidates, key=lambda fmt: (recent_counter.get(fmt, 0), FORMAT_TYPES.index(fmt)))[0]


def build_refs(articles, limit=4):
    return "\n".join([f"- {a['title']} ({a['link']})" for a in articles[:limit]])


def build_dialogue_explainer(keyword, articles):
    title = f"요즘 '{keyword}' 뉴스가 많은 이유"
    categories = ["오늘의 핫이슈", "삼촌의 용어 과외", f"{FORMAT_LABEL_PREFIX}dialogue_explainer"]
    body = f"""퇴근길, 삼촌이랑 조카가 편의점 앞 벤치에 앉았다.

**조카:**  
삼촌, 뉴스에 **{keyword}**가 자꾸 나와. 이거 그냥 하루짜리 이슈야?

**삼촌:**  
그럴 수도 있고, 아닐 수도 있지. 중요한 건 **왜 갑자기 모두가 같은 단어를 말하기 시작했는지**야.

**조카:**  
맨날 숫자만 보면 되나 했는데, 그건 아닌가 보네?

**삼촌:**  
맞아. 경제 뉴스는 숫자보다 먼저 **맥락**을 봐야 해.  
오늘은 {keyword}를 딱 세 가지로만 정리해보자.

## 오늘의 핵심 한 줄
**{keyword} 이슈는 숫자 하나보다, 이 뉴스가 며칠짜리 흐름인지와 어떤 가격·정책 반응을 끌고 오는지를 같이 보는 게 핵심이다.**

## 왜 갑자기 {keyword}가 많이 보일까

### 1) 사건 자체보다 시장의 반응이 커졌기 때문
같은 뉴스라도 시장이 민감하게 반응하기 시작하면 기사량이 빠르게 늘어난다.  
즉, {keyword}는 단순 사건이 아니라 **사람들이 앞으로를 걱정하기 시작했다는 신호**로 읽을 수 있다.

### 2) 다른 변수와 연결되기 쉬운 주제이기 때문
{keyword}는 보통 유가·환율·금리·물가 같은 다른 변수와 연결돼 해석된다.  
이렇게 연결고리가 많을수록 언론도 후속 기사를 계속 붙이게 된다.

### 3) 하루 뉴스보다 ‘연속성’이 중요해졌기 때문
하루 헤드라인이면 금방 잊히지만, 며칠 연속 이어지면 시장은 방향성을 읽으려 한다.  
그래서 {keyword}는 **단발 이슈인지, 추세의 시작인지**가 중요하다.

## 이럴 때 개인이 보면 좋은 3가지
1. 관련 기사량이 하루 반짝인지, 며칠 연속인지  
2. 환율·금리·유가 같은 연결 변수도 같이 흔들리는지  
3. 정부·중앙은행·기업이 공식 대응을 내놓는지

## 참고한 오늘 뉴스
{build_refs(articles)}
"""
    return title, categories, body


def build_timeline_brief(keyword, articles):
    title = f"오늘 '{keyword}' 이슈, 순서대로 보면 이렇게 보인다"
    categories = ["오늘의 핫이슈", "뉴스 흐름 요약", f"{FORMAT_LABEL_PREFIX}timeline_brief"]
    bullets = []
    for idx, article in enumerate(articles[:4], start=1):
        bullets.append(f"{idx}. **{article['title']}**  \n   → 같은 키워드라도 시장이 어디에 반응하는지 확인할 단서")
    timeline = "\n".join(bullets)
    body = f"""오늘 {keyword} 관련 기사가 많아 보였다면, 한꺼번에 읽기보다 **순서대로 흐름을 보는 편**이 낫다.

## 오늘의 핵심 한 줄
**{keyword}는 기사 한 개보다 기사들이 어떤 순서로 쌓이는지를 보면 시장이 무엇을 걱정하는지 더 잘 보인다.**

## 오늘 흐름을 순서대로 보면
{timeline}

## 이 흐름이 중요한 이유

### 1) 헤드라인이 아니라 ‘반복되는 포인트’를 잡을 수 있다
여러 기사를 나란히 놓으면 언론사마다 표현은 달라도 공통으로 강조하는 지점이 보인다.  
그게 바로 시장이 실제로 긴장하는 핵심일 가능성이 크다.

### 2) 단순 소음과 추세 신호를 구분할 수 있다
하루짜리 잡음이면 기사 톤이 제각각인데, 추세 신호면 같은 논점이 반복된다.  
{keyword}도 이 반복 여부를 보면 훨씬 덜 휘둘린다.

### 3) 다음에 뭘 봐야 할지 정리된다
오늘 흐름을 정리해두면 내일은 **같은 포인트가 더 커지는지, 꺾이는지**만 보면 된다.

## 이렇게 읽으면 덜 흔들린다
- 첫 기사만 보고 결론 내리지 않기
- 반복해서 등장하는 변수 1~2개만 체크하기
- 내일 이어질 후속 기사 유무 확인하기

## 참고한 오늘 뉴스
{build_refs(articles)}
"""
    return title, categories, body


def build_checklist(keyword, articles):
    title = f"'{keyword}' 뉴스가 쏟아질 때 꼭 체크할 3가지"
    categories = ["오늘의 핫이슈", "체크리스트", f"{FORMAT_LABEL_PREFIX}checklist"]
    body = f"""{keyword} 관련 뉴스가 많아질수록 사람은 제목에 끌려가기 쉽다.  
그럴수록 기준이 필요하다.

## 오늘의 핵심 한 줄
**{keyword} 이슈는 많이 아는 것보다, 무엇을 먼저 확인할지 정해두는 편이 훨씬 덜 흔들린다.**

## 체크 1. 이 뉴스가 단발성인지 흐름인지
같은 키워드가 하루만 반짝하는지, 며칠 연속 누적되는지부터 봐야 한다.  
흐름이 이어질수록 파급력은 커진다.

## 체크 2. 연결 변수도 같은 방향으로 움직이는지
{keyword} 하나만 오르내리는지, 아니면 환율·금리·유가·물가 같은 변수도 같이 반응하는지 보면 된다.  
여러 변수가 동시에 흔들리면 의미가 더 커진다.

## 체크 3. 공식 대응이 나오는지
정부, 중앙은행, 기업, 업계 단체가 코멘트를 내놓기 시작하면 단순 화제에서 정책·실무 이슈로 넘어가는 경우가 많다.

## 결론
뉴스가 많을수록 오히려 볼 것은 줄어든다.  
**연속성, 연결 변수, 공식 대응**. 이 세 가지만 먼저 보면 된다.

## 참고한 오늘 뉴스
{build_refs(articles)}
"""
    return title, categories, body


def build_mythbuster(keyword, articles):
    title = f"'{keyword}' 뉴스에서 자주 나오는 오해 3가지"
    categories = ["오늘의 핫이슈", "오해 바로잡기", f"{FORMAT_LABEL_PREFIX}mythbuster"]
    body = f"""{keyword} 이야기가 많아지면 설명보다 해석이 먼저 퍼진다.  
그래서 실제보다 과하게 받아들이는 경우도 많다.

## 오늘의 핵심 한 줄
**{keyword}는 뉴스량이 많을수록 단정이 쉬워지지만, 실제로는 팩트와 해석을 분리해서 봐야 덜 흔들린다.**

## 오해 1. 기사 수가 많으면 이미 결론이 난 것이다
기사량 증가는 관심이 커졌다는 뜻이지, 결론이 확정됐다는 뜻은 아니다.  
오히려 해석이 과열되는 구간일 수도 있다.

## 오해 2. 관련 변수 하나만 보면 충분하다
{keyword}는 단독으로 움직이기보다 다른 변수와 연결돼 읽히는 경우가 많다.  
하나만 보면 맥락을 놓치기 쉽다.

## 오해 3. 지금 반응이 곧 장기 추세다
시장은 종종 과민하게 먼저 반응한다.  
그래서 지금의 급한 반응이 며칠 뒤에도 유지되는지 확인이 필요하다.

## 그래서 어떻게 보면 되나
- 팩트: 실제로 무슨 일이 있었는지  
- 반응: 시장과 언론이 무엇에 민감했는지  
- 지속성: 이 흐름이 이어지는지

이 순서로 보면 과한 해석을 덜 하게 된다.

## 참고한 오늘 뉴스
{build_refs(articles)}
"""
    return title, categories, body


def build_impact_map(keyword, articles):
    title = f"'{keyword}' 이슈, 내 생활에는 어디부터 영향이 올까"
    categories = ["오늘의 핫이슈", "생활경제", f"{FORMAT_LABEL_PREFIX}impact_map"]
    body = f"""{keyword}가 뉴스에서 커질 때 가장 궁금한 건 결국 이거다.  
**그래서 내 돈과 생활에는 뭐가 먼저 달라지는데?**

## 오늘의 핵심 한 줄
**{keyword} 이슈는 멀어 보여도 보통 가격, 심리, 의사결정 순서로 생활에 스며든다.**

## 1단계. 가격 신호가 먼저 움직인다
뉴스가 커지면 가장 먼저 반응하는 건 시장 가격이다.  
사람들은 실제 변화가 다 오기 전에 먼저 가격표를 통해 불안을 반영한다.

## 2단계. 체감 심리가 따라온다
가격이 흔들리면 사람들은 소비, 투자, 대출, 환전 같은 결정을 더 조심하게 된다.  
즉 {keyword}는 숫자 문제이기도 하지만 동시에 **심리의 문제**이기도 하다.

## 3단계. 실무 결정이 바뀐다
기업이나 가계는 예상이 바뀌면 바로 계획을 손본다.  
지출을 미루거나, 가격을 조정하거나, 보수적으로 움직이는 식이다.

## 한 번에 기억할 포인트
{keyword}가 커질수록 "무슨 일이 벌어졌나"보다 **"내가 어떤 결정을 다시 보게 되나"**를 생각하면 이해가 빨라진다.

## 참고한 오늘 뉴스
{build_refs(articles)}
"""
    return title, categories, body


def build_content(topic, recent_meta):
    keyword = topic["keyword"]
    articles = topic.get("articles", [])
    format_name = choose_format(recent_meta)

    builders = {
        "dialogue_explainer": build_dialogue_explainer,
        "timeline_brief": build_timeline_brief,
        "checklist": build_checklist,
        "mythbuster": build_mythbuster,
        "impact_map": build_impact_map,
    }

    title, categories, body = builders[format_name](keyword, articles)
    content = f"""---
layout: post
title: \"{title}\"
categories: {json.dumps(categories, ensure_ascii=False)}
---

{body}
"""
    return title, content, format_name


def main():
    if not DATA.exists():
        raise SystemExit("hot_topics.json not found. Run hot_topics.py first.")

    payload = json.loads(DATA.read_text(encoding="utf-8"))

    recent_meta = collect_recent_post_meta(limit=8)
    recent_slugs = []
    for meta in recent_meta[:3]:
        m = re.match(r"^\d{4}-\d{2}-\d{2}-(.+)$", meta["path"].stem)
        if m:
            recent_slugs.append(m.group(1))

    topic = pick_topic(payload, recent_slugs=recent_slugs)
    if not topic:
        raise SystemExit("No topic available.")

    today = datetime.now(KST).date().isoformat()
    slug = slugify(topic["keyword"])
    post_path = POSTS / f"{today}-{slug}.md"

    if post_path.exists():
        print(f"Skip: already exists {post_path.name}")
        return

    title, content, format_name = build_content(topic, recent_meta)
    post_path.write_text(content, encoding="utf-8")
    print(f"Created {post_path} with format={format_name} title={title}")


if __name__ == "__main__":
    main()
