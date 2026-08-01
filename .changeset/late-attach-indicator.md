---
'@ait-co/debugger': patch
---

대기창 밖에서 attach가 성립해도 온디바이스 "Debugger Connected" 배지가 주입되도록 수정 (#11).

`start_attach`는 자기 대기창이 `!isError`로 끝날 때만 배지를 주입해서, `wait_timeout_seconds`가 지난 뒤 폰을 스캔하면 attach 자체는 성공(`list_pages`에 잡힘)하는데 배지는 세션 내내 뜨지 않았다. 대기창과 무관하게 도는 attach 워처(`DualConnectionRouter`)에 주입을 배선해 first attach·target 교체·detach 후 재attach 모든 edge를 덮는다. 주입은 (연결, target id) 단위로 멱등하며, `enableDomains()`가 거부되면 memo를 풀어 다음 attach edge에서 재시도한다.

워처는 `start_debug`가 arm하므로 배지는 relay 연결의 모든 attach edge에 붙는다 — `start_attach`를 부르지 않은 세션과 `run_tests` auto-attach 경로도 포함된다.
