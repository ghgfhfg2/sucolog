#!/usr/bin/env python3
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "_data" / "hot_topics.json"
POSTS = ROOT / "_posts"


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

    # 1) 품질 조건 + 최근 중복 회피
    for t in topics:
        kw = t.get("keyword", "")
        if not kw:
            continue
        if kw.lower() in {"경제", "시장", "뉴스"}:
            continue
        if len(t.get("articles", [])) < 2:
            continue
        if slugify(kw) in recent_slugs:
            continue
        return t

    # 2) 최근 중복만 예외로 하고 품질 조건 우선
    for t in topics:
        kw = t.get("keyword", "")
        if kw and kw.lower() not in {"경제", "시장", "뉴스"} and len(t.get("articles", [])) >= 2:
            return t

    return topics[0] if topics else None


def build_content(topic, today):
    keyword = topic["keyword"]
    articles = topic.get("articles", [])

    title = f"요즘 '{keyword}' 뉴스가 많은 이유"

    dialogue = f"""퇴근길, 삼촌이랑 조카가 편의점 앞 벤치에 앉았다.

**조카:**  
삼촌, 뉴스에 **{keyword}**가 자꾸 나와. 이거 시험에 나와?

**삼촌:**  
시험보다 더 중요할 수도 있어. 이건 우리 집 지갑에 나오는 문제거든.

**조카:**  
또 시작이다… 경제는 맨날 어렵게 말하잖아.

**삼촌:**  
오케이, 오늘은 게임 비유로 간다.  
경제는 RPG고, **{keyword}**는 갑자기 등장한 보스 이벤트야.  
사람들이 “어? 이거 큰일 날 수도?” 하고 움직이면 가격표가 먼저 반응해.

**조카:**  
실제로 큰일이 안 나도?

**삼촌:**  
맞아. 경제는 종종 “사실”보다 “예상”이 먼저 움직여.  
비 오기 전에 우산부터 사는 것처럼.

**조카:**  
그럼 나는 뭘 보면 돼?

**삼촌:**  
딱 3개만 봐.
1. 이 뉴스가 하루짜리인지, 며칠 계속되는지  
2. 관련 가격(유가/환율/금리 같은)이 같이 움직이는지  
3. 정부·중앙은행·기업이 대응 멘트를 내는지

**조카:**  
오케이. “제목만 보고 놀라지 말고 흐름을 봐라” 이거네?

**삼촌:**  
정답. 이제 너 경제 뉴스 반은 이긴 거야.
"""

    refs = "\n".join([f"- {a['title']} ({a['link']})" for a in articles[:4]])

    body = f"""---
layout: post
title: \"{title}\"
categories: [\"오늘의 핫이슈\", \"삼촌의 용어 과외\"]
---

{dialogue}

## 오늘의 핵심 한 줄
**{keyword} 이슈는 ‘지금 무슨 일이 났나’보다, ‘이 흐름이 얼마나 오래 가나’를 보는 게 핵심이다.**

## 참고한 오늘 뉴스
{refs}
"""

    return title, body


def main():
    if not DATA.exists():
        raise SystemExit("hot_topics.json not found. Run hot_topics.py first.")

    payload = json.loads(DATA.read_text(encoding="utf-8"))

    # 최근 3개 글의 slug를 수집해서 같은 주제 반복 발행을 줄인다.
    recent_slugs = []
    for p in sorted(POSTS.glob("*.md"), reverse=True)[:3]:
        m = re.match(r"^\d{4}-\d{2}-\d{2}-(.+)\.md$", p.name)
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

    _, content = build_content(topic, today)
    post_path.write_text(content, encoding="utf-8")
    print(f"Created {post_path}")


if __name__ == "__main__":
    main()
