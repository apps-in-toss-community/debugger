# debugger

**한국어** · [English](./README.en.md)

[![npm (@ait-co/debugger)](https://img.shields.io/npm/v/%40ait-co%2Fdebugger?label=%40ait-co%2Fdebugger)](https://www.npmjs.com/package/@ait-co/debugger)
[![npm (@ait-co/debug-console)](https://img.shields.io/npm/v/%40ait-co%2Fdebug-console?label=%40ait-co%2Fdebug-console)](https://www.npmjs.com/package/@ait-co/debug-console)
[![license](https://img.shields.io/badge/license-BSD--3--Clause-blue)](./LICENSE)

앱인토스(Apps in Toss) 미니앱의 원격 디버깅 인프라 — MCP 디버깅 데몬, on-device CDP relay, test-runner, on-device 콘솔을 담는 pnpm workspace.

이 프로젝트는 더 이상 유지보수되지 않습니다. repo는 archive되어 read-only가 되지만 소스와 이슈 기록은 GitHub에 그대로 남고, npm에 게시된 `@ait-co/debugger` · `@ait-co/debug-console`도 계속 설치할 수 있습니다 — 다만 더 이상 업데이트되지 않습니다. `aitc.dev` 도메인과 그 위에서 돌던 사이트는 종료되므로, 문서는 [`docs`](https://github.com/apps-in-toss-community/docs) repo의 소스 파일에서 보세요. 실기기 attach에 쓰는 launcher PWA도 같은 도메인(`devtools.aitc.dev/launcher/`)에 있어 함께 사라집니다 — `@ait-co/debugger`가 만드는 attach 딥링크가 이 호스트를 가리키므로, 도메인이 내려간 뒤에는 이 경로가 동작하지 않습니다. 대체 호스트가 없어 상수 값은 그대로 두었습니다.

`@ait-co/devtools`가 8개 기능 표면(mock·panel·unplugin·phone preview·on-device debug·remote CDP·MCP server·test runner·in-app console)을 한 패키지에 담고 있었는데, 이를 **3 패키지 / 2 repo**로 쪼갰고 이 repo가 debug·관측 쪽 절반을 담당한다. 분리의 명시적 동기는 **보안 스코프**다 — "무엇이 프로덕션 번들에 들어갈 수 있는가"가 `package.json` 한 장(dep 1개: `eruda`)으로 답해지도록 만든다.

| 패키지 | repo | 내용 | 소비 형태 |
|---|---|---|---|
| `@ait-co/devtools` | [`devtools`](https://github.com/apps-in-toss-community/devtools) | mock · panel · unplugin | devDependency 전용, 번들 기여 0 |
| `@ait-co/debugger` | 여기 | MCP 데몬 · CDP relay · test-runner · dev-bridge | devDependency / `npx` |
| `@ait-co/debug-console` | 여기 | on-device attach · eruda 콘솔 | **앱 번들에 들어갈 수 있는 유일한 패키지** |

분리는 완료됐다 — MCP 데몬·CDP relay·test-runner·on-device 콘솔 구현이 모두 이 workspace에 들어와 있고, 두 패키지는 npm에 출하 중이다. `@ait-co/devtools`는 0.2.0에서 debug 표면을 넘겨준 뒤 mock·panel·unplugin만 담는다.

## 설치

```sh
pnpm add -D @ait-co/debugger        # MCP 데몬 · CDP relay · test-runner · dev-bridge
pnpm add @ait-co/debug-console      # on-device attach + eruda 콘솔 (프로덕션 번들에 들어갈 수 있는 유일한 패키지)
```

설치 없이 `npx`로 바로 실행할 수도 있습니다. 패키지 이름과 bin 이름이 다르므로 `-p` 형태로 호출합니다:

```sh
npx -p @ait-co/debugger debugger
```

## 구조

```
packages/
  debugger/            @ait-co/debugger      — bins: debugger, debugger-test
  debug-console/        @ait-co/debug-console — exports: . 와 ./auto (bin 없음)
  internal-protocol/    비공개, 미publish     — 두 패키지가 공유하는 device<->host 프로토콜 원본
```

각 패키지의 상세 사용법 · exports · 보안 스코프는 [`packages/debugger/README.md`](./packages/debugger/README.md) · [`packages/debug-console/README.md`](./packages/debug-console/README.md)를 참조하세요.

세 패키지 사이에 **필수 의존 edge는 0개**다 — 교차 패키지 참조가 필요하면 항상 optional peer로만 선언한다. 자세한 불변식과 시크릿 취급 규칙은 [`CLAUDE.md`](./CLAUDE.md)를 참조하세요.

분리 때 `devtools`에서 이관되며 번호가 바뀐 이슈 10건의 매핑은 [`docs/issue-transfer-map.md`](./docs/issue-transfer-map.md)에 있습니다 — 옛 `devtools#N` 참조를 만나면 여기서 찾으세요.

## 개발

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

이 repo는 pnpm workspace이므로 `build`/`typecheck`/`test`는 `pnpm -r`로 각 패키지에 팬아웃되고, `lint`/`format`은 Biome이 workspace 전체를 한 번에 검사합니다.

### Pre-commit hook

선택 사항이지만 권장합니다. clone 후 표준 pre-commit hook을 활성화하면 staged 파일에 `biome check`가 자동으로 실행됩니다:

```sh
git config core.hooksPath .githooks
```

push 전 빠른 피드백을 위한 개발자 편의 기능입니다. CI에서도 동일한 검사가 강제 계층으로 실행되므로 hook을 활성화하지 않은 contributor도 PR에서 lint 실패를 확인할 수 있습니다.

## 릴리즈

Changesets `fixed` 페어(`@ait-co/debugger` · `@ait-co/debug-console`)로 두 패키지의 버전을 항상 함께 올립니다 — 두 패키지는 컴파일 링크 없는 값-복제 wire protocol로 통신하므로, "버전 X = 상호 테스트된 쌍"을 보장하려면 `linked`가 아니라 `fixed`가 맞습니다. `internal-protocol`은 비공개라 이 페어에 들어가지 않습니다.

## 라이선스

BSD-3-Clause

---

커뮤니티 오픈소스 프로젝트입니다.
