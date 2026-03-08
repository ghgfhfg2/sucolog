---
layout: default
title: 카테고리별 모아보기
permalink: /categories/
---

<section class="section-head">
  <h2>전체 게시물</h2>
  <p>카테고리별로 한 번에 모아볼 수 있어요.</p>
</section>

{% assign category_pairs = site.categories | sort %}
{% for pair in category_pairs %}
  {% assign cat = pair[0] %}
  {% assign cat_posts = pair[1] %}
  {% if cat != "" and cat_posts %}
  {% assign cat_slug = cat | slugify %}
  <section class="section-head" id="cat-{{ cat_slug }}" style="margin-top:28px">
    <h2 style="font-size:1.12rem"># {{ cat }}</h2>
  </section>
  <section class="post-grid">
    {% for post in cat_posts %}
      <article class="post-card">
        <p class="card-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
        <a class="read-more" href="{{ post.url | relative_url }}">자세히 보기 →</a>
      </article>
    {% endfor %}
  </section>
  {% endif %}
{% endfor %}
