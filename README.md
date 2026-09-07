# github-grass

Claude Code 플러그인. `/github-grass`를 입력하면 현재 `gh` CLI에 로그인된 계정(또는
지정한 username)의 GitHub 잔디(contribution graph)를 터미널에 텍스트 히트맵으로 보여줍니다.

## 구조

```
github-grass-plugin/
├── .claude-plugin/
│   └── plugin.json      # 플러그인 매니페스트
├── commands/
│   └── github-grass.md   # "/github-grass" 슬래시 커맨드 정의
└── scripts/
    └── grass.js           # gh api graphql 호출 + ASCII 렌더링
```

## 동작 방식

1. `commands/github-grass.md`가 `/github-grass` 커맨드를 정의합니다.
2. 이 커맨드는 `scripts/grass.js`를 Bash로 실행합니다.
3. `grass.js`는 별도 토큰 없이 로컬에 이미 로그인된 `gh` CLI 인증을 그대로 사용해
   GitHub GraphQL API(`contributionsCollection`)로 최근 365일 데이터를 가져오고,
   요일×주 단위 격자에 `░▒▓█` 4단계 음영으로 렌더링합니다.

## 요구 사항

- [GitHub CLI(`gh`)](https://cli.github.com/) 설치 및 `gh auth login` 완료
- Node.js (18+)

## 로컬에서 테스트하기

배포 없이 바로 사용해보려면, 이 플러그인 폴더를 가리켜서 Claude Code를 실행하세요.

```bash
claude --plugin-dir "C:\Users\mylink\orca\projects\github-grass-plugin"
```

그 다음 세션 안에서:

```
/github-grass
/github-grass octocat   # 다른 사용자의 잔디를 보고 싶을 때
```

## 스크립트만 단독 실행

Claude Code 없이 스크립트만 확인하고 싶다면:

```bash
node scripts/grass.js            # 현재 gh 로그인 계정
node scripts/grass.js octocat    # 특정 사용자
```
