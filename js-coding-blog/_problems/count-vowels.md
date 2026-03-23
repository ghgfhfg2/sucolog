---
title: 모음 개수 세기
slug: count-vowels
track: js-basic
difficulty: easy
topic: string-methods
tags:
  - beginner
  - vowel
  - string
  - js-method
  - includes
order: 4
function_name: solution
time_limit_ms: 200
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

## 오늘의 메서드
`includes()`는 배열이나 문자열 안에 특정 값이 포함되어 있는지 확인할 때 사용하는 메서드입니다.

## 메서드 설명
이 문제에서는 모음 목록에 현재 문자가 들어 있는지 검사해야 합니다.
이때 `includes()`를 사용하면 특정 문자가 모음인지 직관적으로 확인할 수 있습니다.

예를 들어 모음 배열이 `['a', 'e', 'i', 'o', 'u']`라면,
현재 글자가 `e`일 때 `includes('e')`는 `true`를 반환합니다.

## 기본 문법
```js
arr.includes(value)
str.includes(value)
```

## 사용 예시
```js
['a', 'e', 'i', 'o', 'u'].includes('e') // true
['a', 'e', 'i', 'o', 'u'].includes('z') // false
'hello'.includes('ell') // true
```

## 주의할 점
- `includes()`는 대소문자를 구분합니다.
- 배열의 `includes()`와 문자열의 `includes()`는 비슷하지만 대상이 다릅니다.
- 이 문제에서는 배열에 대해 `includes()`를 사용하는 방식이 더 직관적입니다.

## 제한사항
- `str`은 영어 소문자 문자열이라고 가정합니다.
- 반환값은 모음의 개수입니다.

## 예시
- 입력: `"hello"` → 출력: `2`
- 입력: `"aeiou"` → 출력: `5`
- 입력: `"sky"` → 출력: `0`

## 힌트
- 모음 목록을 배열로 만든 뒤, 문자열을 한 글자씩 검사해 보세요.

## 해설
이 문제는 문자열 전체를 순회하면서 각 문자가 모음인지 확인하면 됩니다.

예를 들어:
1. 모음 배열을 만든다.
2. 문자열을 한 글자씩 확인한다.
3. 현재 글자가 모음 배열에 포함되어 있으면 카운트를 1 증가시킨다.
4. 마지막에 카운트를 반환한다.

`includes()`를 사용하면 조건문이 간단해져서 초급자도 흐름을 파악하기 쉽습니다.
