---
layout: default
title: 문제 목록
permalink: /problems/
---

# 문제 목록

<ul class="problem-list">
  {% assign sorted_problems = site.problems | sort: 'order' %}
  {% for problem in sorted_problems %}
    <li>
      <a href="{{ problem.url }}">{{ problem.title }}</a>
      {% if problem.difficulty %}<span class="pill">{{ problem.difficulty }}</span>{% endif %}
      {% if problem.category %}<span class="pill">{{ problem.category }}</span>{% endif %}
    </li>
  {% endfor %}
</ul>
