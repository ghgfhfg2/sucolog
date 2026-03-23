---
title: 배열에서 최댓값 찾기
slug: find-max
difficulty: easy
category: array
order: 3
function_name: solution
time_limit_ms: 200
starter_code: |
  function solution(nums) {
    return 0;
  }
test_cases:
  - input: [[1, 2, 3, 4]]
    output: 4
  - input: [[-3, -7, -1]]
    output: -1
  - input: [[9]]
    output: 9
---

정수 배열 `nums`가 주어질 때, 배열 안에서 가장 큰 값을 반환하는 `solution` 함수를 작성하세요.

## 제한사항
- `nums`는 하나 이상의 정수를 가진 배열입니다.
- 배열 길이는 최소 1 이상입니다.
- 반환값은 배열 안의 정수 중 최댓값입니다.

## 예시
- 입력: `[1, 2, 3, 4]` → 출력: `4`
- 입력: `[-3, -7, -1]` → 출력: `-1`

## 힌트
- 처음 값을 기준으로 시작해서 더 큰 수를 만날 때마다 갱신해도 됩니다.
