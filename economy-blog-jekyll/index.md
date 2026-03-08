---
layout: default
title: 홈
---

<section class="section-head">
  <h2>전체 게시물</h2>
  <p>가장 최신 글부터 한 번에 볼 수 있어요.</p>
</section>

<section class="post-grid">
{% for post in site.posts limit: 12 %}
  <article class="post-card">
    <p class="card-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
    <a class="read-more" href="{{ post.url | relative_url }}">자세히 보기 →</a>
  </article>
{% endfor %}
</section>

<section class="section-head" style="margin-top:34px">
  <h2>주제(카테고리)별 게시물</h2>
  <p>원하는 주제만 골라서 모아보기.</p>
</section>

{% assign category_pairs = site.categories | sort %}
{% for pair in category_pairs %}
  {% assign cat = pair[0] %}
  {% assign cat_posts = pair[1] %}
  {% if cat != "" and cat_posts %}
  <section class="section-head" style="margin-top:24px">
    <h2 style="font-size:1.12rem"># {{ cat }}</h2>
  </section>
  <section class="post-grid">
    {% for post in cat_posts limit: 6 %}
      <article class="post-card">
        <p class="card-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.excerpt | strip_html | truncate: 100 }}</p>
        <a class="read-more" href="{{ post.url | relative_url }}">자세히 보기 →</a>
      </article>
    {% endfor %}
  </section>
  {% endif %}
{% endfor %}

