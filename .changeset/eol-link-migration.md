---
'@ait-co/debugger': patch
'@ait-co/debug-console': patch
---

EOL 준비 — 죽을 `aitc.dev` 링크를 GitHub 소스로 옮기고 README에 종료 안내 추가.

`docs.aitc.dev` 도메인이 종료되므로 런타임 출력에 박혀 있던 문서 링크 3곳(`start_attach` 툴 설명, relay TOTP 시크릿 누락 안내, relay 시크릿 최초 생성 안내)을 `docs` repo의 GitHub 소스 URL로 교체했다. 대체 호스트가 없는 launcher PWA URL(`devtools.aitc.dev/launcher/`)은 동작을 바꾸지 않기 위해 값을 그대로 두고, 상수 옆 주석과 README에 그 호스트가 함께 사라진다는 사실만 남겼다.
