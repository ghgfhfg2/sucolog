---
title: 두 수 더하기
slug: two-sum
difficulty: easy
category: warmup
order: 1
function_name: solution
starter_code: |
  function solution(a, b) {
    return a + b;
  }
test_cases:
  - input: [1, 2]
    output: 3
  - input: [5, 7]
    output: 12
  - input: [-3, 10]
    output: 7
---

두 정수 `a`, `b`가 주어질 때 두 수의 합을 반환하는 `solution` 함수를 작성하세요.

## 제한사항
- `a`, `b`는 정수입니다.
- 반환값도 정수입니다.

## 예시
- 입력: `(1, 2)` → 출력: `3`
- 입력: `(5, 7)` → 출력: `12`

## 힌트
- 두 값을 그대로 더한 결과를 반환하면 됩니다.

## 해설
이 문제는 가장 기본적인 함수형 warmup 문제입니다.

핵심은 `solution(a, b)` 형태의 함수를 정확히 작성하고, 두 입력값을 더한 값을 반환하는 것입니다.

예를 들어 `a = 1`, `b = 2`라면 결과는 `3`이 되어야 합니다.
