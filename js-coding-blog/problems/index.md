---
layout: default
title: 문제 목록
permalink: /problems/
---

# 문제 목록

<p class="section-lead">가볍게 풀어볼 수 있는 JavaScript 문제들입니다. 난이도와 카테고리를 보고 원하는 문제부터 들어가면 됩니다.</p>

<div class="filter-panel">
  <div class="filter-group">
    <label class="filter-label" for="problem-search">검색</label>
    <input id="problem-search" class="filter-input" type="search" placeholder="문제 제목이나 설명 검색" />
  </div>

  <div class="filter-group">
    <label class="filter-label" for="difficulty-filter">난이도</label>
    <select id="difficulty-filter" class="filter-select">
      <option value="all">전체</option>
      <option value="easy">easy</option>
      <option value="medium">medium</option>
      <option value="hard">hard</option>
    </select>
  </div>

  <div class="filter-group">
    <label class="filter-label" for="category-filter">카테고리</label>
    <select id="category-filter" class="filter-select">
      <option value="all">전체</option>
      {% assign categories = site.problems | map: 'category' | uniq | sort %}
      {% for category in categories %}
        {% if category %}<option value="{{ category }}">{{ category }}</option>{% endif %}
      {% endfor %}
    </select>
  </div>
</div>

<p id="problem-count" class="muted problem-count"></p>

<div id="problem-grid" class="problem-grid">
  {% assign sorted_problems = site.problems | sort: 'order' %}
  {% for problem in sorted_problems %}
    <article
      class="problem-card"
      data-title="{{ problem.title | downcase | escape }}"
      data-description="{{ problem.excerpt | strip_html | strip_newlines | downcase | escape }}"
      data-difficulty="{{ problem.difficulty | downcase }}"
      data-category="{{ problem.category | downcase }}">
      <div class="problem-card__body">
        <div class="meta-row compact">
          {% if problem.difficulty %}<span class="pill">{{ problem.difficulty }}</span>{% endif %}
          {% if problem.category %}<span class="pill">{{ problem.category }}</span>{% endif %}
        </div>
        <h2 class="problem-card__title"><a href="{{ problem.url }}">{{ problem.title }}</a></h2>
        <p class="problem-card__description">
          {% if problem.excerpt %}
            {{ problem.excerpt | strip_html | truncate: 120 }}
          {% else %}
            문제를 읽고 브라우저에서 바로 JavaScript로 풀어볼 수 있습니다.
          {% endif %}
        </p>
      </div>
      <div class="problem-card__footer">
        <a class="text-link" href="{{ problem.url }}">문제 풀러 가기 →</a>
      </div>
    </article>
  {% endfor %}
</div>

<div id="problem-empty" class="empty-state is-hidden">조건에 맞는 문제가 없습니다. 검색어나 필터를 바꿔보세요.</div>

<script src="/assets/js/problem-filters.js" defer></script>
