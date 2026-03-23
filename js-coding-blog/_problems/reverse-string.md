---
title: 문자열 뒤집기
slug: reverse-string
difficulty: easy
category: string
order: 2
function_name: solution
time_limit_ms: 200
starter_code: |
  function solution(str) {
    return str;
  }
test_cases:
  - input: ["abc"]
    output: "cba"
  - input: ["hello"]
    output: "olleh"
  - input: [""]
    output: ""
---

문자열 `str`이 주어질 때, 글자 순서를 뒤집은 새로운 문자열을 반환하는 `solution` 함수를 작성하세요.

## 제한사항
- `str`은 문자열입니다.
- 빈 문자열이 들어올 수 있습니다.
- 반환값도 문자열이어야 합니다.

## 예시
- 입력: `"abc"` → 출력: `"cba"`
- 입력: `"hello"` → 출력: `"olleh"`

## 힌트
- 문자열을 배열처럼 다룬 뒤 다시 합치는 방법을 떠올려보세요.
