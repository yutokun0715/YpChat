# YpChat v0.5

HTML / CSS / JavaScript + Firebase の実装土台です。

## v0.5に含むもの

- Microsoft / Xbox メインログイン
- 匿名ゲスト
- GitHubアカウント連携
- Firestoreリアルタイムルームチャット
- Markdown（安全な簡易Markdown）
- 複数ルーム
- 公開 / URL / 承認 / アクセスパスワード参加方式
- フレンド申請・承認
- DM受信設定
- DM
- Realtime Database Presence
- オンライン / 離席 / 取り込み中 / オフライン表示設定
- ルーム所有者によるBAN / BAN解除
- PWA
- Firebase Cloud Messagingの土台
- WebRTC配信を追加できる構成
- Discord / Roblox連携のUI土台

## 重要

Discord / RobloxのOAuthや「現在プレイ中」の取得は、各サービスのOAuth/API仕様に従ってサーバー側処理が必要です。
アクセストークンやClient SecretをブラウザJSに書かないでください。

## Firebase設定

1. Firebase ConsoleでWebアプリを追加。
2. AuthenticationでMicrosoftを有効化。
3. 必要ならGitHubも有効化。
4. Firestore Databaseを作成。
5. Realtime Databaseを作成。
6. Web Pushを使う場合、Cloud MessagingのWeb Push証明書（VAPID key）を作成。
7. `js/firebase.js` の `firebaseConfig` を置換。
8. `js/notifications.js` のVAPID keyを置換。
9. Firestore Rulesを公開。

## Microsoft / Xbox

Firebase AuthenticationのMicrosoftプロバイダを有効にし、Azure側のOAuthアプリを設定してください。
個人Microsoftアカウントも利用できる設定にします。

## 開発サーバー

file:// 直開きではなくHTTPSまたはlocalhostで動かしてください。
例:
- Firebase Hosting
- VS Code Live Server
- `python -m http.server`

## 注意

このv0.5は「一式の実装土台」です。本番公開前にSecurity Rules、レート制限、モデレーション、通知送信のサーバー処理、OAuth連携、WebRTCのシグナリング/認証を追加で固めてください。
