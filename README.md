# 가영일 바디캘린더

이 저장소는 기존 코드를 분리한 별도 버전입니다.

## 저장 위치

- 앱 데이터는 `js/app-config.js`의 `firebaseBaseUrl`로 지정한 Firebase Realtime Database에 저장됩니다.
- 데이터 경로는 `storagePrefix`로 분리됩니다.
- 기본값은 `gayeongil_bodycalendar`입니다.

## 처음 할 일

1. Firebase에서 새 Realtime Database 프로젝트를 만듭니다.
2. `js/app-config.js`의 `firebaseBaseUrl`를 새 프로젝트 주소로 바꿉니다.
3. GitHub에서 새 저장소를 만들고 이 폴더를 push 합니다.

## 바로 바꿀 파일

- `js/app-config.js`: 앱 이름, 저장소 접두사, Firebase 주소
- `index.html`, `admin.html`, `member.html`, `member-login.html`: 화면 제목과 브랜드
- `js/db.js`: 데이터 읽기/쓰기 로직

## 실행

정적 서버로 열면 됩니다. 예:

```bash
ruby -run -e httpd . -p 4174
```

