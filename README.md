# 내 서랍

움직이는 UI 조각을 모아 두는 개인 보관함과, 미리보기가 있는 UI 용어사전.

- `index.html` — 더블클릭으로 열어요. 왼쪽 위에서 두 화면을 오가요.
  - **조각**: 목록에서 고르면 오른쪽에서 실제로 움직여요. `#토글`처럼 태그로 찾을 수 있어요.
  - **용어사전**: 용어마다 작은 미리보기가 움직이고, 보낸 참고 영상도 함께 볼 수 있어요.
- 글꼴 Pretendard와 참고 영상은 인터넷이 있을 때 보여요.

## 고치는 법

- `components/` — 조각 하나가 HTML 파일 하나. 2번째 줄의 `meta`에 이름·분류·설명.
- `tags.json` — 조각별 #태그 (한국어)
- `glossary.json` — 용어사전 내용 (`k`가 태그 이름과 연결돼요)
- `demos/` — 용어사전 미리보기 스크립트
- `refs.json` — 조각별 참고 영상 주소

고친 뒤 `build.ps1`을 실행하면 `index.html` 안의 데이터가 다시 채워져요.

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```
