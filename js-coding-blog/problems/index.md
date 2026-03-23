---
layout: default
title: 문제 목록
permalink: /problems/
---

# 문제 목록

<p class="section-lead">가볍게 풀어볼 수 있는 JavaScript 문제들입니다. 난이도와 카테고리를 보고 원하는 문제부터 들어가면 됩니다.</p>

<div class="problem-grid">
  {% assign sorted_problems = site.problems | sort: 'order' %}
  {% for problem in sorted_problems %}
    <article class="problem-card">
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
