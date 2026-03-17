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
    <div class="category-pagination" aria-label="카테고리 페이지네이션"></div>
  </div>
  {% endif %}
{% endfor %}

<script>
  (function () {
    const PAGE_SIZE = 10;
    const params = new URLSearchParams(window.location.search);
    const selected = params.get('cat');
    const rawPage = parseInt(params.get('page') || '1', 10);
    const selectedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const blocks = document.querySelectorAll('.category-block');
    let found = false;

    blocks.forEach(block => {
      const match = !selected || block.dataset.cat === selected;
      block.style.display = match ? '' : 'none';
      if (!match) return;

      found = true;

      const cards = Array.from(block.querySelectorAll('.post-card'));
      const pager = block.querySelector('.category-pagination');
      const totalPages = Math.ceil(cards.length / PAGE_SIZE);
      let currentPage = selected ? selectedPage : 1;

      if (!pager || totalPages <= 1) {
        cards.forEach(card => (card.style.display = ''));
        if (pager) pager.style.display = 'none';
        return;
      }

      currentPage = Math.min(Math.max(1, currentPage), totalPages);

      const render = () => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        cards.forEach((card, idx) => {
          card.style.display = idx >= start && idx < end ? '' : 'none';
        });

        pager.innerHTML = `
          <button type="button" class="pager-btn" data-role="prev" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
          <span class="pager-info">${currentPage} / ${totalPages}</span>
          <button type="button" class="pager-btn" data-role="next" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
        `;
      };

      pager.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-role]');
        if (!btn) return;

        const role = btn.dataset.role;
        if (role === 'prev' && currentPage > 1) currentPage -= 1;
        if (role === 'next' && currentPage < totalPages) currentPage += 1;

        if (selected) {
          const nextParams = new URLSearchParams(window.location.search);
          nextParams.set('page', String(currentPage));
          const nextUrl = `${window.location.pathname}?${nextParams.toString()}`;
          window.history.replaceState({}, '', nextUrl);
        }

        render();
        block.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      render();
    });

    const top = document.getElementById('categoryTop');
    if (top && selected && found) {
      const title = top.querySelector('h2');
      const desc = top.querySelector('p');
      if (title) title.textContent = '선택한 카테고리 게시물';
      if (desc) desc.textContent = '해당 주제의 글만 모아서 보여줍니다. (페이지당 10개)';
    }
  })();
</script>
