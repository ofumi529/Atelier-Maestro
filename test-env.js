require('dotenv').config();

console.log('=== 環境変数チェック ===');
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '設定済み (長さ: ' + process.env.CLAUDE_API_KEY.length + ')' : '未設定');
console.log('PORT:', process.env.PORT || 'デフォルト値を使用');
console.log('========================');
