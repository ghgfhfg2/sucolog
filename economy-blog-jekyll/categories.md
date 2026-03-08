---
layout: default
title: 카테고리별 모아보기
permalink: /categories/
---

<section class="section-head" id="categoryTop">
  <h2>카테고리별 모아보기</h2>
  <p>원하는 주제의 글만 집중해서 볼 수 있어요.</p>
</section>

{% assign category_pairs = site.categories | sort %}
{% for pair in category_pairs %}
  {% assign cat = pair[0] %}
  {% assign cat_posts = pair[1] %}
  {% if cat != "" and cat_posts %}
  {% assign cat_slug = cat | slugify %}
  <div class="category-block" data-cat="{{ cat_slug }}">
    <section class="section-head" style="margin-top:28px">
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
  </div>
  {% endif %}
{% endfor %}

<script>
  (function () {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get('cat');
    if (!selected) return;

    const blocks = document.querySelectorAll('.category-block');
    let found = false;

    blocks.forEach(block => {
      const match = block.dataset.cat === selected;
      block.style.display = match ? '' : 'none';
      if (match) found = true;
    });

    const top = document.getElementById('categoryTop');
    if (top && found) {
      const title = top.querySelector('h2');
      const desc = top.querySelector('p');
      if (title) title.textContent = '선택한 카테고리 게시물';
      if (desc) desc.textContent = '해당 주제의 글만 모아서 보여줍니다.';
    }
  })();
</script>
