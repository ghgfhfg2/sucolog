---
layout: default
title: 문제 목록
permalink: /problems/
---

# 문제 목록

<p class="section-lead">트랙, 난이도, 주제를 기준으로 문제를 찾아볼 수 있습니다. 오늘의 코테, 알고리즘 학습, JS 메서드 학습 흐름에 맞춰 큐레이션합니다.</p>

<div class="filter-panel filter-panel--wide">
  <div class="filter-group">
    <label class="filter-label" for="problem-search">검색</label>
    <input id="problem-search" class="filter-input" type="search" placeholder="문제 제목이나 설명 검색" />
  </div>

  <div class="filter-group">
    <label class="filter-label" for="track-filter">트랙</label>
    <select id="track-filter" class="filter-select">
      <option value="all">전체</option>
      <option value="today">오늘의 코테</option>
      <option value="algorithm">알고리즘별 코테</option>
      <option value="js-basic">JS 메서드 학습</option>
    </select>
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
    <label class="filter-label" for="topic-filter">주제</label>
    <select id="topic-filter" class="filter-select">
      <option value="all">전체</option>
      {% assign topics = site.problems | map: 'topic' | uniq | sort %}
      {% for topic in topics %}
        {% if topic %}<option value="{{ topic }}">{{ topic }}</option>{% endif %}
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
      data-track="{{ problem.track | downcase }}"
      data-difficulty="{{ problem.difficulty | downcase }}"
      data-topic="{{ problem.topic | downcase }}"
      data-tags="{{ problem.tags | join: ' ' | downcase | escape }}">
      <div class="problem-card__body">
        <div class="meta-row compact">
          {% if problem.track %}<span class="pill">{{ problem.track }}</span>{% endif %}
          {% if problem.difficulty %}<span class="pill">{{ problem.difficulty }}</span>{% endif %}
          {% if problem.topic %}<span class="pill">{{ problem.topic }}</span>{% endif %}
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
