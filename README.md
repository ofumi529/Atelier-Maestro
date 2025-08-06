# 🎨 アトリエ マエストロ - 古典絵画創作工房

**古典アートの美を現代に蘇らせるHTML5 Canvas ベースの絵画創作アプリケーション**  
Claude API連携によるAI アート解析機能付きの本格的なデジタル絵画アトリエです。

## ✨ 主要機能

### 🖌️ 基本描画機能
- **ペン描画**: 滑らかな自由線画描画
- **カラーパレット**: 8色の美しいプリセット + カスタムカラーピッカー
- **ブラシサイズ**: 1px～50pxの精密調整可能スライダー
- **消しゴムツール**: 部分消去機能
- **全消去**: キャンバス全体のクリア

### ⚙️ 編集機能
- **元に戻す/やり直し**: 50ステップまでの履歴管理
- **画像保存**: タイムスタンプ付きPNG自動保存

### 🤖 AIアート解析機能
- **Claude API連携**: 最新のClaude Sonnet 4で作品を芸術的に解析
- **美術館風解説**: 学芸員レベルの格調高いタイトルと解説文を日本語で生成

### 📱 UI/UX機能
- **モダンデザイン**: グラデーションとシャドウを活用した美しいUI
- **レスポンシブ対応**: デスクトップ・モバイル完全対応
- **タッチ操作**: スマートフォン・タブレット完全対応

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# .env.exampleをコピーして.envファイルを作成
copy .env.example .env

# .envファイルを編集してClaude APIキーを設定
# CLAUDE_API_KEY=your_actual_api_key_here
```

### 3. アプリケーションの起動
```bash
# 本番環境
npm start

# 開発環境（ファイル変更時に自動再起動）
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセス可能です。

## 🚀 Vercelデプロイ手順

### 1. GitHubリポジトリの準備
```bash
# Gitリポジトリを初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリにプッシュ
git remote add origin https://github.com/ofumi529/Atelier-Maestro.git
git branch -M main
git push -u origin main
```

### 2. Vercelでのデプロイ
1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリ「Atelier-Maestro」を選択
4. 「Deploy」をクリック

### 3. 環境変数の設定
Vercelダッシュボードで以下の環境変数を設定：

| 変数名 | 値 | 説明 |
|--------|----|---------|
| `CLAUDE_API_KEY` | `sk-ant-...` | Claude APIキー（Anthropic Console取得） |
| `NODE_ENV` | `production` | 本番環境フラグ |

### 4. セキュリティ設定
- APIキーは**絶対に**GitHubにコミットしない
- `.env`ファイルは`.gitignore`で除外済み
- 本番環境ではHTTPS強制
- セキュリティヘッダー自動設定

### 5. デプロイ後の確認
- アプリケーション動作確認
- AI解析機能テスト
- OGP画像表示確認
- レスポンシブデザイン確認

## 使用方法

### 1. 基本操作
1. **色の選択**: カラーパレットまたはカラーピッカーで色を選択
2. **ブラシサイズ**: スライダーでペンの太さを調整
3. **描画**: キャンバス上でマウス/タッチで描画
4. **消しゴム**: 消しゴムツールで部分消去
5. **保存**: 保存ボタンで作品をダウンロード

### 2. Claude API設定
1. [Anthropic Console](https://console.anthropic.com/)でAPIキーを取得
2. `.env`ファイルに`CLAUDE_API_KEY=your_api_key_here`を設定
3. サーバーを再起動

### 3. アート解析
1. 作品を描画後、「アート解析」ボタンをクリック
2. AIが作品を解析し、美術館風の解説を生成
3. モーダルウィンドウで結果を表示

## 🛠️ 技術仕様

### フロントエンド
- **HTML5 Canvas**: 高性能描画エンジン
- **Vanilla JavaScript**: フレームワークなしの軽量・高速実装
- **CSS3**: グラデーション・シャドウを活用したモダンデザイン
- **Font Awesome 6**: 美しいアイコンライブラリ

### バックエンド
- **Node.js**: 高性能サーバーランタイム
- **Express.js**: 軽量Webフレームワーク
- **CORS**: クロスオリジンリソース共有
- **dotenv**: セキュアな環境変数管理
- **axios**: HTTPクライアントライブラリ

### API連携
- **Claude Sonnet 4**: Anthropicの最新AIモデル (claude-sonnet-4-20250514)
- **画像解析**: Base64エンコードPNGで高品質解析
- **セキュリティ**: APIキーはサーバーサイドで安全に管理

### 対応環境
- **デスクトップ**: Chrome, Firefox, Safari, Edge
- **モバイル**: iOS Safari, Android Chrome
- **タッチ操作**: 完全対応

## 📁 ファイル構成

```
🎨 お絵かきWebアプリ/
├── 📄 index.html          # メインHTMLファイル (モダンUI構造)
├── 🎨 styles.css          # グラデーションスタイルシート
├── ⚙️ script.js           # 描画ロジック & UIインタラクション
├── 🚀 server.js           # Expressサーバー & Claude API連携
├── 📦 package.json        # 依存関係 & スクリプト定義
├── 📝 .env.example        # 環境変数テンプレート
├── 🔐 .env               # 環境変数 (要作成 - APIキー設定)
├── 🚫 .gitignore         # Git除外設定
├── 🧪 test-env.js        # 環境変数テストスクリプト
└── 📚 README.md          # プロジェクトドキュメント
```

## カスタマイズ

### 色パレットの変更
`index.html`の`.color-palette`セクションで色を追加/変更できます：

```html
<div class="color-swatch" data-color="#your-color" style="background-color: #your-color;"></div>
```

### ブラシサイズ範囲の変更
`index.html`の`#brushSize`要素の`min`、`max`属性を変更：

```html
<input type="range" id="brushSize" min="1" max="100" value="5">
```

### キャンバスサイズの変更
`script.js`の`initializeCanvas()`メソッドで調整：

```javascript
this.canvas.width = 1000;  // 幅
this.canvas.height = 800;  // 高さ
```

## 🔒 セキュリティ注意事項

- **APIキー管理**: サーバー側の.envファイルで安全に管理
- **Gitセキュリティ**: .envファイルは.gitignoreで除外設定済み
- **本番環境**: 環境変数またはシークレット管理サービスを使用
- **HTTPS推奨**: セキュアな通信のためHTTPS環境での使用を推奨

## 🎆 プロジェクト成果

このお絵かきWebアプリは以下の成果を達成しました：

✅ **モダンUI**: グラデーションとシャドウを活用した美しいデザイン  
✅ **フル機能**: 描画・編集・保存機能を完全実装  
✅ **AI連携**: Claude Sonnet 4での高品質アート解析  
✅ **レスポンシブ**: デスクトップ・モバイル完全対応  
✅ **セキュア**: APIキーの安全な管理とデバッグ機能  

## 🚀 今後の展望

- **レイヤー機能**: 複数レイヤーでの描画対応
- **ブラシバリエーション**: テクスチャブラシやスタンプ機能
- **クラウド保存**: 作品のオンライン保存・共有
- **コラボレーション**: リアルタイム共同編集機能

## 📜 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

問題や機能要望がある場合は、プロジェクトのIssueページでお知らせください。

---

**✨ お絵かきを楽しんでください！ ✨**
