# economy-blog-jekyll

## 로컬 실행
```bash
cd economy-blog-jekyll
bundle install
bundle exec jekyll serve --livereload
```

브라우저: http://127.0.0.1:4000

## 운영 규칙
- 주 3회 발행 (월/수/금)
- 친근한 톤
- 상황극 40%
- 중립적 관점

## 글 작성
`_posts/YYYY-MM-DD-title.md` 파일 생성 후 템플릿에 맞춰 작성.

## 실시간 핫토픽 수집
- 스크립트: `scripts/hot_topics.py`
- 출력: `_data/hot_topics.json`

로컬 실행:
```bash
cd economy-blog-jekyll
python scripts/hot_topics.py
cat _data/hot_topics.json
```

GitHub Actions:
- `.github/workflows/hot-topics-refresh.yml`
- 30분마다 RSS를 수집해 `hot_topics.json` 자동 갱신
