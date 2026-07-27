---
'@ait-co/debugger': patch
---

`/dev-bridge`에 `startDevServerCdpRelay`를 추가한다.

dev 서버 플러그인이 env-2 CDP relay를 띄우려면 relay 시크릿 확보 → 인증 설정 fail-fast → 게이트 verifier 생성 → relay 기동을 이 순서대로 밟아야 한다. 순서가 어긋나면 조용히 무방비 relay가 뜨기 때문에, 네 조각을 각각 내보내는 대신 조합 하나로 묶어 노출한다. 반환 핸들은 loopback URL(`http://127.0.0.1:<port>`)과 공개 relay의 https/wss 형태, 그리고 터널·relay를 함께 정리하는 idempotent `close()`를 담는다.

터널을 여는 일은 호출부에 남긴다(`openTunnel` 주입) — 터널 프로세스 관리는 dev 서버 쪽 관심사다. `onAuthReject`도 쓰로틀 없이 그대로 전달한다.
