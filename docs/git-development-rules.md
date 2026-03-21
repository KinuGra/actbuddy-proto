# Git Development Rules

本プロジェクトでは **Issue ドリブン開発 + Git Flow
をベースとした開発フロー** を採用する。

---

# 1. Development Flow（Issueドリブン開発）

すべての作業は **Issue を起点に開始する。**

## フロー

1.  Issue を作成
2.  必要に応じて Sub Issue を作成
3.  自分を Assignee に設定
4.  作業開始時に `In Progress` に変更
5.  Issue から **develop ブランチをベースにブランチ作成**
6.  ローカルで checkout して作業
7.  develop に対して Pull Request を作成
8.  レビュー後に develop に merge

```

    Issue作成
    ↓
    Assignee設定
    ↓
    In Progress
    ↓
    develop からブランチ作成
    ↓
    ローカルで作業
    ↓
    developへPR
    ↓
    merge
```

---

# 2. Git Flow

本プロジェクトでは簡易的な Git Flow を採用する。

## 基本ブランチ

    main      : 本番用
    develop   : 開発用

### ルール

- 基本は **develop からブランチを切る**
- 作業完了後 **develop に PR を出す**
- main へは develop からのみマージ

---

# 3. Branch Naming Rules（ブランチ命名規則）

    <prefix>/<issue-number>-<description>

例

    feat/18-add-login-api
    fix/28-auth-error
    refactor/35-clean-user-service

# 4. Commit Message Rules

フォーマット

    <prefix>: <message>

例

    feat: add login api
    fix: auth middleware bug
    refactor: clean user service
    feat: タスク登録APIの作成

---

## 作業途中コミット

作業途中の場合は `wip` を使用

    feat: (wip) implement login api

---

## Issue番号を含める場合

    fix: (#28) auth middleware bug
    feat: (#18) add login api

Issue番号の記載は任意。

---

# 5. Pull Request

PRの基本ルール

- develop に対して作成
- Issue を紐付ける
- レビュー後に merge

# 6. Summary

開発ルールまとめ

- Issue ドリブン開発
- develop ベースの Git Flow
- Issue番号付きブランチ
- prefix付きコミットメッセージ
