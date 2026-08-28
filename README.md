# YpChat v0.5

Firebase + HTML/CSS/JavaScript only.

## 実装

- Firebase Anonymous Authentication
- Firestore realtime chat
- Markdown
- ルームコード参加
- 公開 / 自由参加 / 承認制 / アクセスパスワード
- 作成者(owner)自動参加
- 管理者パスワードによるadmin化
- 自分自身・管理者・ownerのBAN防止
- BAN解除
- フレンド申請
- DM
- Realtime Database Presence
- オンライン / 離席 / 取り込み中 / オフライン表示
- テキストスタンプ
- Web Pushの土台
- WebRTC配信の土台
- PWA

## Firebase設定

`js/firebase.js` の `firebaseConfig` をFirebase ConsoleのWebアプリ設定に置き換えてください。

## 有効化

Firebase Console:
1. Authentication → Anonymous を有効化
2. Firestore Databaseを作成
3. Realtime Databaseを作成
4. AuthenticationのAuthorized domainsに公開先ドメインを追加

## 注意

管理者パスワードとアクセスパスワードは、クライアントへ平文で保存しない構成に変更することを推奨します。
本番ではCloud Functions等のサーバー側処理でパスワード検証・権限付与を行ってください。

このv0.5はStorageを使用しません。
