---
title: 모음 개수 세기
slug: count-vowels
difficulty: easy
category: string
order: 4
function_name: solution
starter_code: |
  function solution(str) {
    return 0;
  }
test_cases:
  - input: ["hello"]
    output: 2
  - input: ["aeiou"]
    output: 5
  - input: ["sky"]
    output: 0
---

문자열 `str`이 주어질 때, 영어 소문자 모음 `a`, `e`, `i`, `o`, `u`의 개수를 반환하는 `solution` 함수를 작성하세요.

## 제한사항
- `str`은 영어 소문자 문자열이라고 가정합니다.
- 반환값은 모음의 개수입니다.

## 예시
- 입력: `"hello"` → 출력: `2`
- 입력: `"aeiou"` → 출력: `5`
- 입력: `"sky"` → 출력: `0`

## 힌트
- 모음을 미리 정해두고 한 글자씩 검사하면 됩니다.
