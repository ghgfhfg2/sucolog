#!/usr/bin/env python3
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape

RSS_SOURCES = [
    "https://news.google.com/rss/search?q=%EA%B2%BD%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=%EA%B8%88%EB%A6%AC+OR+%ED%99%98%EC%9C%A8+OR+%EB%AC%BC%EA%B0%80&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=%EC%9C%A0%EA%B0%80+OR+%EC%9B%90%EB%8B%AC%EB%9F%AC+OR+%EC%88%98%EC%B6%9C&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=FOMC+OR+CPI+OR+%EA%B8%B0%EC%A4%80%EA%B8%88%EB%A6%AC&hl=ko&gl=KR&ceid=KR:ko",
]

STOPWORDS = {
    "오늘", "속보", "단독", "기자", "시장", "경제", "한국", "미국", "국내", "해외",
    "대한", "관련", "이슈", "가능", "전망", "발표", "기준", "이번", "최근", "정리",
    "무엇", "어떻게", "이유", "영향", "때문", "정도", "결과", "분석", "뉴스", "종합",
    "에서", "으로", "까지", "하고", "하며", "그리고", "또한", "정말", "지금",
    "nbsp", "quot", "amp", "lt", "gt", "font", "href", "https", "http", "com", "news",
    "google", "rss", "articles", "target", "blank", "oc", "co", "kr", "www", "the",
}

TOKEN_RE = re.compile(r"[가-힣A-Za-z0-9+%-]{2,}")
TAG_RE = re.compile(r"<[^>]+>")


def fetch(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SucologBot/1.1; +https://sucolog.sooyadev.com)",
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read()


def clean_text(text: str) -> str:
    t = unescape(text or "")
    t = TAG_RE.sub(" ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def parse_rss(xml_bytes: bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for item in root.findall(".//item"):
        title = clean_text(item.findtext("title") or "")
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()
        desc = clean_text(item.findtext("description") or "")

        pub_dt = None
        if pub:
            try:
                pub_dt = parsedate_to_datetime(pub)
                if pub_dt.tzinfo is None:
                    pub_dt = pub_dt.replace(tzinfo=timezone.utc)
            except Exception:
                pub_dt = None

        if title:
            items.append({"title": title, "link": link, "description": desc, "pubDate": pub_dt})
    return items


def tokenize(text: str):
    tokens = TOKEN_RE.findall(text)
    result = []
    for tok in tokens:
        low = tok.lower()
        if low in STOPWORDS:
            continue
        if re.fullmatch(r"\d+", low):
            continue
        if len(low) <= 1:
            continue
        if low.isascii() and len(low) <= 2:
            continue
        result.append(tok)
    return result


def score_keywords(items):
    c = Counter()
    now = datetime.now(timezone.utc)
    for it in items:
        text = f"{it['title']} {it['description']}"
        tokens = tokenize(text)

        weight = 1.0
        pub = it.get("pubDate")
        if pub:
            hours = max((now - pub).total_seconds() / 3600, 0)
            weight = max(0.35, 2.4 - min(hours / 12, 2.0))

        for tok in tokens:
            c[tok] += weight
    return c


def normalize_google_link(url: str):
    try:
        parsed = urllib.parse.urlparse(url)
        if "news.google.com" not in parsed.netloc:
            return url
        qs = urllib.parse.parse_qs(parsed.query)
        if "url" in qs and qs["url"]:
            return qs["url"][0]
    except Exception:
        pass
    return url


def build_topic_clusters(items, top_keywords):
    clusters = []
    for kw, score in top_keywords:
        related = [it for it in items if kw in f"{it['title']} {it['description']}" and "[그래픽]" not in it['title']]
        related = sorted(
            related,
            key=lambda x: x["pubDate"] or datetime(1970, 1, 1, tzinfo=timezone.utc),
            reverse=True,
        )
        if len(related) < 2:
            continue
        clusters.append({
            "keyword": kw,
            "score": round(score, 2),
            "articles": [
                {
                    "title": r["title"],
                    "link": normalize_google_link(r["link"]),
                    "published_at": r["pubDate"].isoformat() if r.get("pubDate") else None,
                }
                for r in related[:5]
            ],
        })
    return clusters


def main():
    all_items, errors = [], []

    for src in RSS_SOURCES:
        try:
            all_items.extend(parse_rss(fetch(src)))
        except Exception as e:
            errors.append({"source": src, "error": str(e)})

    dedup = {(it["title"], it["link"]): it for it in all_items}
    items = list(dedup.values())

    keyword_scores = score_keywords(items)
    top_keywords = keyword_scores.most_common(20)
    topic_clusters = build_topic_clusters(items, top_keywords)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_count": len(RSS_SOURCES),
        "article_count": len(items),
        "top_keywords": [{"keyword": k, "score": round(v, 2)} for k, v in top_keywords[:12]],
        "hot_topics": topic_clusters[:8],
        "errors": errors,
    }

    out = "_data/hot_topics.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Wrote {out} (articles={len(items)}, topics={len(payload['hot_topics'])})")


if __name__ == "__main__":
    main()
