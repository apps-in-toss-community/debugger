# @ait-co/debugger

## 0.1.1

### Patch Changes

- d761bae: 패키지별 README(ko/en)와 LICENSE를 `packages/debugger/`·`packages/debug-console/`에 추가했다. npm은 `files` 필드와 무관하게 패키지 디렉토리의 README·LICENSE를 자동으로 tarball에 포함하는데, 지금까지 이 파일들이 repo 루트에만 있어 두 패키지의 tarball에는 `dist/**`와 `package.json`만 실리고 있었다. 첫 publish 전에 두 npm 페이지가 완전히 빈 채로 공개되는 것을 막는다.
- 4350bbe: 사용자 노출 문자열이 분리 전 이름(`devtools-mcp`·`devtools-test`·`@ait-co/devtools`) 대신 이 패키지의 표면을 가리키도록 정정한다.

  - bin 이름: `devtools-mcp` → `debugger`, `devtools-test` → `debugger-test`
  - 복구 안내: `npx @ait-co/devtools devtools-mcp` → `npx -p @ait-co/debugger debugger` (패키지명과 bin명이 달라 `-p` 형태가 필요하다)
  - 로그 prefix: `[devtools-mcp]` → `[debugger]`, `[@ait-co/devtools]` → `[@ait-co/debugger]`, `devtools-test:` → `debugger-test:`
  - import 예시: `@ait-co/devtools/test-runner` → `@ait-co/debugger/test-runner`

  devtools에 잔류하는 표면(unplugin `mcp: true` 안내)을 가리키는 `@ait-co/devtools` 언급, MCP server id `ait-devtools`, 상태 디렉토리 `~/.ait-devtools/`, `devtoolsVersion` 응답 필드명, `.ait_relay`·`.ait_urls` 파일명은 그대로 둔다.
