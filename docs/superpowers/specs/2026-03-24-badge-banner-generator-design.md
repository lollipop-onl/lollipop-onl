# Badge Banner Generator Design

## Overview

README.md のバッジ管理を自動化するシステム。`src/README.md` にテンプレートを置き、独自のコードブロック記法でパッケージを列挙すると、各プラットフォームの API からデータを取得し、satori で横長バナー SVG を生成して `assets/badges/` に配置、テンプレートから `README.md` を自動生成する。

## Architecture

bun workspace による monorepo 構成。バッジ生成を抽象化し、プラットフォームごとの adapter パッケージを追加する拡張モデル。

### Package Structure

```
packages/
  badge-generator/          # 抽象レイヤー
  badge-generator-npm/      # npm adapter
  readme-generator/         # README ビルダー
src/
  README.md                 # テンプレート（メンテ対象）
assets/
  badges/                   # 生成 SVG 出力先
README.md                   # 生成物（直接編集しない）
package.json                # ワークスペースルート
bunfig.toml
```

### Package Details

#### `badge-generator` (抽象レイヤー)

共通インターフェースと satori による SVG レンダリングを提供。

```typescript
// types.ts
interface BadgeData {
  name: string;
  description: string;
  logoSvg: string;          // プラットフォームロゴの SVG 文字列
  fields: BadgeField[];     // version, downloads 等の可変フィールド
}

interface BadgeField {
  label: string;
  value: string;
}

// renderer.ts
// BadgeData を受け取り satori で SVG 文字列を返す
function renderBadge(data: BadgeData): Promise<string>
```

バナーレイアウト:
```
┌──────────────────────────────────────────────────────┐
│ [logo]  @lollipop-onl/myzod-to-zod                  │
│         myzod を Zod v3 の Codemod                    │
│  v1.2.3  │  120/week  │  2024-01-15  │  MIT          │
└──────────────────────────────────────────────────────┘
```

SVG サイズ: 幅 800px 固定、高さは satori の出力に合わせる（約 120px 想定）。

フォント: Noto Sans JP Regular + Bold (Google Fonts から fetch)。初回実行時にローカルキャッシュし、以降はキャッシュを使用。

npm ロゴ: `badge-generator-npm` パッケージ内に静的アセットとしてバンドル。

#### `badge-generator-npm` (npm adapter)

npm registry API からデータを取得し、`BadgeData` に変換。

データソース:
- `https://registry.npmjs.org/{pkg}` → name, description, version, license, last-update (`time` オブジェクトの `modified` キー)
- `https://api.npmjs.org/downloads/point/last-week/{pkg}` → weekly downloads

#### `readme-generator` (README ビルダー)

テンプレート解析とバッジ生成の orchestration。

処理フロー:
1. `src/README.md` を読み込み
2. ` ```badges:{platform} ` コードブロックを検出・解析
3. platform に応じた badge-generator adapter を呼び出し
4. SVG を `assets/badges/` に書き出し
5. コードブロックを `<img>` タグに置換して `README.md` を生成
   - 出力形式: 各パッケージごとに `<img src="./assets/badges/{pkg-name}.svg" alt="{package-name}" width="800">` を改行区切りで配置

### Custom Syntax

````markdown
```badges:npm
@lollipop-onl/myzod-to-zod
@passport-mrz/builder
@passport-mrz/renderer
```
````

将来: `badges:docsify`, `badges:chrome-extension` 等を追加可能。

## Dependencies

- `satori` — HTML+CSS → SVG 変換
- フォント取得用の fetch (bun 標準)

## GitHub Actions

```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # 毎週月曜
  workflow_dispatch:       # 手動実行
```

`bun run generate` (ルート package.json の scripts で定義、readme-generator の CLI を呼び出す) → 差分があれば自動コミット & プッシュ。

ワークフローには `permissions: contents: write` を設定し、`GITHUB_TOKEN` で push する。

### Error Handling

- npm API が 404 を返した場合（パッケージ削除等）: 該当パッケージをスキップし、stderr に警告を出力
- ネットワークエラー・タイムアウト: プロセスを非ゼロ終了コードで終了（CI で検知可能）
- API リクエストは逐次実行でレートリミットを回避

## Scope

初回実装は npm パッケージのみ。docsify, Chrome Web Store 等は後続で `badge-generator-{platform}` パッケージを追加して対応。
