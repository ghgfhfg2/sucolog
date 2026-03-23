# Problem Authoring Guide

JS Coding Blog에서 문제를 추가할 때 사용하는 작성 가이드입니다.

## 기본 원칙
- 현재는 **JavaScript 함수형 문제만 지원**합니다.
- stdin/stdout 스타일이 아니라 **함수 인자 → 반환값** 형태로 작성합니다.
- 테스트케이스는 브라우저에서 실행 가능한 수준으로 유지합니다.
- 문제 설명은 짧고 명확하게 씁니다.

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
difficulty: easy
category: string
order: 10
function_name: solution
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
- `difficulty`: `easy`, `medium`, `hard`
- `category`: 예: `string`, `array`, `math`, `simulation`, `warmup`
- `order`: 목록 정렬 순서
- `function_name`: 사용자가 구현해야 하는 함수명
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
```

---

## 좋은 문제 작성 팁
- 제목만 보고도 주제를 어느 정도 짐작할 수 있게 한다
- starter code는 너무 완성형으로 주지 않는다
- 테스트케이스는 최소 3개 이상 넣는다
- 음수, 빈 문자열, 중복값 등 경계 케이스를 일부 포함한다
- 본문과 테스트케이스가 서로 모순되지 않게 한다

---

## 현재 권장 카테고리
- `warmup`
- `string`
- `array`
- `math`
- `simulation`
- `greedy`

필요하면 이후 확장 가능:
- `stack`
- `queue`
- `hash`
- `dp`
- `graph`

---

## 문제 추가 절차
1. `_problems/`에 새 파일 생성
2. front matter 작성
3. 본문 작성
4. 로컬에서 문제 목록/상세 확인
5. 테스트 실행 확인
6. 커밋
