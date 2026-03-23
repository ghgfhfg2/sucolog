# Problem Authoring Guide

JS Coding Blog에서 문제를 추가할 때 사용하는 작성 가이드입니다.

## 기본 원칙
- 현재는 **JavaScript 함수형 문제만 지원**합니다.
- stdin/stdout 스타일이 아니라 **함수 인자 → 반환값** 형태로 작성합니다.
- 테스트케이스는 브라우저에서 실행 가능한 수준으로 유지합니다.
- 문제 설명은 짧고 명확하게 씁니다.
- 앞으로 문제는 **트랙 기반으로 큐레이션**합니다.

---

## 트랙 구조
이 블로그의 문제는 아래 3개 트랙 중 하나에 속합니다.

### 1. 오늘의 코테 (`today`)
- 도전 욕구를 자극하는 큐레이션 문제
- 난이도 구분: `easy`, `medium`, `hard`
- 목적: 재미, 도전감, 재방문 유도

### 2. 알고리즘별 코테 (`algorithm`)
- 개념 학습과 유형별 연습 중심
- 초중급 학습자 대상
- 목적: 알고리즘 감각 형성

### 3. JS 메서드 학습 (`js-basic`)
- JavaScript 기본 메서드와 문법 감각 익히기
- 초급자 대상
- 목적: 언어 적응 + 코테 입문
- **일반 문제보다 학습 정보가 더 중요함**

---

## 새 문제 추가 위치
문제 파일은 `_problems/` 폴더에 추가합니다.

예:
- `_problems/two-sum.md`
- `_problems/reverse-string.md`
- `_problems/find-max.md`

파일명은 보통 slug와 맞추는 것을 권장합니다.

---

## Front Matter 필드
모든 문제는 아래 필드를 가집니다.

```yaml
---
title: 문제 제목
slug: problem-slug
track: algorithm
difficulty: easy
topic: string
tags:
  - beginner
  - reverse
order: 10
function_name: solution
time_limit_ms: 200
starter_code: |
  function solution(input) {
    return input;
  }
test_cases:
  - input: ["abc"]
    output: "cba"
  - input: ["hello"]
    output: "olleh"
---
```

### 필드 설명
- `title`: 문제 제목
- `slug`: URL 식별자
- `track`: `today`, `algorithm`, `js-basic`
- `difficulty`: `easy`, `medium`, `hard`
- `topic`: 핵심 주제 (예: `string`, `array`, `array-methods`, `implementation`)
- `tags`: 세부 태그 배열
- `order`: 목록 정렬 순서
- `function_name`: 사용자가 구현해야 하는 함수명
- `time_limit_ms`: 브라우저 기준 시간 제한(근사치)
- `starter_code`: 기본 코드
- `test_cases`: 예제 테스트 목록

---

## 테스트케이스 작성 규칙
`input`은 항상 **배열 형태**로 적습니다.

예:
```yaml
test_cases:
  - input: [1, 2]
    output: 3
  - input: [[1, 2, 3]]
    output: 3
```

설명:
- `solution(1, 2)` → `input: [1, 2]`
- `solution([1, 2, 3])` → `input: [[1, 2, 3]]`

---

## 본문 권장 구조
### 일반 문제 (`today`, `algorithm`)
```md
문제에 대한 한 줄 설명.

## 제한사항
- 입력값 조건
- 길이 조건
- 반환값 조건

## 예시
- 입력: `...` → 출력: `...`
- 입력: `...` → 출력: `...`

## 힌트
- 필요하면 간단한 힌트 추가

## 해설
- 필요하면 해설 추가
```

### 학습형 문제 (`js-basic`)
```md
문제에 대한 한 줄 설명.

## 오늘의 메서드
- 오늘 배울 메서드가 무엇인지

## 메서드 설명
- 이 메서드가 무엇을 하는지

## 기본 문법
```js
arr.includes(value)
```

## 사용 예시
```js
['a', 'e'].includes('a') // true
```

## 주의할 점
- 대소문자 구분
- 원본 변경 여부
- 반환값 형태

## 제한사항
- 문제 조건

## 예시
- 입력 / 출력 예시

## 힌트
- 문제 풀이 힌트

## 해설
- 풀이 설명 + 왜 이 메서드가 적합한지
```

---

## topic / tags 작성 가이드
### topic 예시
- `warmup`
- `string`
- `array`
- `array-methods`
- `string-methods`
- `simulation`
- `greedy`
- `hash`
- `stack-queue`

### tags 예시
- `beginner`
- `map`
- `filter`
- `reduce`
- `reverse`
- `max`
- `vowel`
- `daily`

`topic`은 핵심 분류 1개,
`tags`는 검색과 세부 큐레이션용 보조 키워드라고 생각하면 됩니다.

---

## 좋은 문제 작성 팁
- 제목만 보고도 주제를 어느 정도 짐작할 수 있게 한다
- starter code는 너무 완성형으로 주지 않는다
- 테스트케이스는 최소 3개 이상 넣는다
- 음수, 빈 문자열, 중복값 등 경계 케이스를 일부 포함한다
- 본문과 테스트케이스가 서로 모순되지 않게 한다
- 트랙 목적에 맞는 문제인지 먼저 판단한다
- `js-basic`은 문제보다 **학습 정보 품질**이 더 중요하다

---

## 문제 추가 절차
1. `_problems/`에 새 파일 생성
2. front matter 작성 (`track`, `topic`, `tags` 포함)
3. 본문 작성
4. 로컬에서 문제 목록/상세 확인
5. 테스트 실행 확인
6. 커밋
