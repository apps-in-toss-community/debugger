# devtools → debugger 이슈 번호 매핑

3-패키지 분리(`@ait-co/devtools` 0.2.0) 때 debug 표면과 함께 이슈 10건이 `devtools` repo에서 이 repo로 이관됐고, 그 과정에서 **번호가 바뀌었다**.

문서·커밋 메시지·이슈 본문·PR 설명에는 이관 전 번호(`devtools#N`)를 가리키는 참조가 그대로 남아 있다. GitHub는 이관된 이슈에 대해 리다이렉트를 유지하므로 지금은 다음이 동작한다:

```sh
gh api repos/apps-in-toss-community/devtools/issues/684 --jq .html_url
# → https://github.com/apps-in-toss-community/debugger/issues/10
```

다만 이 리다이렉트에 의존하지 않고도 옛 참조를 따라갈 수 있도록 매핑을 여기에 남긴다.

| 이관 전 | 이관 후 | 제목 |
|---|---|---|
| `devtools#199` | [#7](https://github.com/apps-in-toss-community/debugger/issues/7) | [spike] HMR-on-intoss-private 타당성: CDP live-patch |
| `devtools#253` | [#8](https://github.com/apps-in-toss-community/debugger/issues/8) | devtools-MCP CDP-first 재설계 — CDP passthrough whitelist |
| `devtools#627` | [#9](https://github.com/apps-in-toss-community/debugger/issues/9) | start_attach headless 경로 in-call TOTP 재mint 루프 |
| `devtools#684` | [#10](https://github.com/apps-in-toss-community/debugger/issues/10) | env3 test 실행 UX 재설계: run_tests auto-attach |
| `devtools#701` | [#11](https://github.com/apps-in-toss-community/debugger/issues/11) | start_attach 대기창 밖 attach 성공 시 인디케이터 누락 |
| `devtools#749` | [#12](https://github.com/apps-in-toss-community/debugger/issues/12) | in-app: freeze/스피너 출처 구별 불가 |
| `devtools#765` | [#13](https://github.com/apps-in-toss-community/debugger/issues/13) | attach identity 검증에 SDK 경유 deploymentId 회수 활용 |
| `devtools#774` | [#14](https://github.com/apps-in-toss-community/debugger/issues/14) | test-runner env2(AITC Sandbox PWA) attach 경로 |
| `devtools#782` | [#15](https://github.com/apps-in-toss-community/debugger/issues/15) | env3 inbound 이벤트 합성 가능성 — `__GRANITE_NATIVE_EMITTER` introspection |
| `devtools#789` | [#16](https://github.com/apps-in-toss-community/debugger/issues/16) | failureModes에 soft-resolve 모드 추가 |

## 전수임을 확인한 방법

GitHub는 이슈와 PR에 하나의 번호 공간을 쓰므로, 이관되지 않았다면 `devtools`의 1..834 중 결번은 없어야 한다. 실제 결번은 정확히 위 10개이고 각각이 이 repo의 #7~#16으로 리다이렉트된다 — 즉 이관 건수는 10건이 전부다.

```sh
gh issue list --repo apps-in-toss-community/devtools --state all --limit 2000 --json number -q '.[].number' > /tmp/i
gh pr    list --repo apps-in-toss-community/devtools --state all --limit 2000 --json number -q '.[].number' > /tmp/p
# 1..max 중 두 목록 어디에도 없는 번호가 이관된 이슈다
```

`debugger` repo 고유 이슈(#1~#6, #22 이후)는 이관 대상이 아니라 분리 작업 자체를 추적하려고 이 repo에서 새로 만든 것이다.
