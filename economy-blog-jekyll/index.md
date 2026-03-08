---
layout: default
title: 홈
---

<section class="section-head">
  <h2>최신 이슈 브리핑</h2>
  <p>지금 가장 중요한 경제 이슈만 골라 쉽게 정리합니다.</p>
</section>

<section class="tag-tabs" id="tagTabs">
  <button class="tag-tab active" data-tag="all">전체</button>
  {% assign category_names = site.categories | map: "first" | sort %}
  {% for cat in category_names %}
    <button class="tag-tab" data-tag="{{ cat }}">{{ cat }}</button>
  {% endfor %}
</section>

<section class="post-grid" id="postGrid">
{% for post in site.posts %}
  <article class="post-card" data-categories="{{ post.categories | join: '||' }}">
    <p class="card-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
    <a class="read-more" href="{{ post.url | relative_url }}">자세히 보기 →</a>
  </article>
{% endfor %}
</section>

<script>
  (function () {
    const tabs = document.querySelectorAll('#tagTabs .tag-tab');
    const cards = document.querySelectorAll('#postGrid .post-card');

    function setActive(tab) {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }

    function filterBy(tag) {
      cards.forEach(card => {
        const cats = (card.dataset.categories || '').split('||');
        const show = tag === 'all' || cats.includes(tag);
        card.style.display = show ? '' : 'none';
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tag = tab.dataset.tag;
        setActive(tab);
        filterBy(tag);
      });
    });
  })();
</script>

