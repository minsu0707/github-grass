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

## 설치 (영구, 매번 --plugin-dir 없이 쓰기)

`claude plugin init`이 만드는 것과 같은 "skills-dir" 방식으로, 이 폴더를
`~/.claude/skills/github-grass`에 심볼릭 링크해두면 새 `claude` 세션마다
자동으로 로드됩니다.

```bash
ln -s "C:\Users\mylink\orca\projects\github-grass-plugin" "$HOME/.claude/skills/github-grass"
```

확인:

```bash
claude plugin list   # "github-grass@skills-dir ... loaded" 로 떠야 함
```

이후 새로 여는 `claude` 세션에서:

```
/github-grass
/github-grass octocat   # 다른 사용자의 잔디를 보고 싶을 때
```

## 일회성으로만 테스트하기

영구 설치 없이 이번 세션에서만 확인하려면:

```bash
claude --plugin-dir "C:\Users\mylink\orca\projects\github-grass-plugin"
```

## 스크립트만 단독 실행

Claude Code 없이 스크립트만 확인하고 싶다면:

```bash
node scripts/grass.js            # 현재 gh 로그인 계정
node scripts/grass.js octocat    # 특정 사용자
```
