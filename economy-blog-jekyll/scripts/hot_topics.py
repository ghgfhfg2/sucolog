#!/usr/bin/env python3
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

RSS_SOURCES = [
    # Google News RSS (KR, economy/business)
    "https://news.google.com/rss/search?q=%EA%B2%BD%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=%EA%B8%88%EB%A6%AC+OR+%ED%99%98%EC%9C%A8+OR+%EB%AC%BC%EA%B0%80&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=%EB%AF%B8%EA%B5%AD+%EA%B2%BD%EC%A0%9C+OR+FOMC+OR+CPI&hl=ko&gl=KR&ceid=KR:ko",
]

STOPWORDS = {
    "오늘", "속보", "단독", "기자", "시장", "경제", "한국", "미국", "국내", "해외",
    "대한", "관련", "이슈", "가능", "전망", "발표", "기준", "이번", "최근", "정리",
    "무엇", "어떻게", "이유", "영향", "때문", "정도", "결과", "분석", "뉴스", "종합",
    "에서", "으로", "까지", "하고", "하며", "대한", "관련", "그냥", "정말",
}

TOKEN_RE = re.compile(r"[가-힣A-Za-z0-9+%-]{2,}")


def fetch(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SucologBot/1.0; +https://sucolog.sooyadev.com)",
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read()


def parse_rss(xml_bytes: bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()
        desc = (item.findtext("description") or "").strip()
        pub_dt = None
        if pub:
            try:
                pub_dt = parsedate_to_datetime(pub)
                if pub_dt.tzinfo is None:
                    pub_dt = pub_dt.replace(tzinfo=timezone.utc)
            except Exception:
                pub_dt = None
        items.append({
            "title": title,
            "link": link,
            "description": desc,
            "pubDate": pub_dt,
        })
    return items


def tokenize(text: str):
    tokens = TOKEN_RE.findall(text)
    result = []
    for t in tokens:
        low = t.lower()
        if low in STOPWORDS:
            continue
        if re.fullmatch(r"\d+", low):
            continue
        result.append(t)
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
            # recency boost (newer => higher)
            weight = max(0.35, 2.5 - min(hours / 12, 2.0))
        for tok in tokens:
            c[tok] += weight
    return c


def normalize_google_link(url: str):
    # Google RSS links are often redirect links; keep as-is if decode fails.
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
        related = [it for it in items if kw in (it["title"] + " " + it["description"])]
        related = sorted(
            related,
            key=lambda x: x["pubDate"] or datetime(1970, 1, 1, tzinfo=timezone.utc),
            reverse=True,
        )
        if not related:
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
    all_items = []
    errors = []

    for src in RSS_SOURCES:
        try:
            xml_bytes = fetch(src)
            items = parse_rss(xml_bytes)
            all_items.extend(items)
        except Exception as e:
            errors.append({"source": src, "error": str(e)})

    # Remove duplicates by title+link
    dedup = {}
    for it in all_items:
        key = (it["title"], it["link"])
        dedup[key] = it
    items = list(dedup.values())

    keyword_scores = score_keywords(items)
    top_keywords = keyword_scores.most_common(12)
    topic_clusters = build_topic_clusters(items, top_keywords[:6])

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_count": len(RSS_SOURCES),
        "article_count": len(items),
        "top_keywords": [{"keyword": k, "score": round(v, 2)} for k, v in top_keywords],
        "hot_topics": topic_clusters,
        "errors": errors,
    }

    out = "_data/hot_topics.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Wrote {out} (articles={len(items)}, topics={len(topic_clusters)})")
    if errors:
        print(f"Warnings: {len(errors)} source fetch errors", file=sys.stderr)


if __name__ == "__main__":
    main()
