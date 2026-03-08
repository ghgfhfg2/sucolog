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

<section class="section-head" style="margin-top:34px">
  <h2>초보자 경제용어 1분</h2>
  <p>처음 보는 경제 기사도 바로 이해할 수 있게, 핵심만 짧게.</p>
</section>

<section class="post-grid">
  <article class="post-card">
    <p class="card-meta">오늘의 용어</p>
    <h3>기준금리</h3>
    <p>한국은행이 정하는 대표 금리. 오르면 대출이자 부담이 커지고, 내리면 자금이 풀려 경기가 살아나기 쉬워요.</p>
  </article>

  <article class="post-card">
    <p class="card-meta">오늘의 용어</p>
    <h3>CPI(소비자물가지수)</h3>
    <p>일상 물가가 얼마나 올랐는지 보여주는 지표예요. CPI가 높으면 체감 물가 부담이 커졌다는 뜻입니다.</p>
  </article>

  <article class="post-card">
    <p class="card-meta">오늘의 용어</p>
    <h3>환율</h3>
    <p>원화와 달러 같은 통화의 교환 비율. 환율이 오르면 수입물가가 비싸지고, 수출기업은 상대적으로 유리해질 수 있어요.</p>
  </article>
</section>
