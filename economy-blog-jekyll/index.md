---
layout: default
title: 홈
---

<section class="section-head">
  <h2>최신 이슈 브리핑</h2>
  <p>지금 가장 중요한 경제 이슈만 골라 쉽게 정리합니다.</p>
</section>

<section class="post-grid">
{% for post in site.posts %}
  <article class="post-card">
    <p class="card-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
    <a class="read-more" href="{{ post.url | relative_url }}">자세히 보기 →</a>
  </article>
{% endfor %}
</section>

