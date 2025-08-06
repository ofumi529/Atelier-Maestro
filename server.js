const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
// Vercel用CORS設定
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://atelier-maestro.vercel.app', 'https://*.vercel.app']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// セキュリティヘッダー
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// 静的ファイルの提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Claude API連携エンドポイント
app.post('/api/analyze-art', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        console.log('=== Claude API 呼び出し開始 ===');
        console.log('APIキー設定状況:', process.env.CLAUDE_API_KEY ? '設定済み' : '未設定');
        console.log('画像データ受信:', imageData ? 'あり' : 'なし');
        
        // APIキーの検証を強化
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            console.log('エラー: 有効なClaude APIキーが設定されていません');
            return res.status(500).json({ 
                error: process.env.NODE_ENV === 'production' 
                    ? 'AI解析サービスが一時的に利用できません。しばらくしてから再度お試しください。'
                    : 'Claude APIキーが設定されていません。.envファイルでCLAUDE_API_KEYを設定してください。'
            });
        }

        if (!imageData) {
            console.log('エラー: 画像データがありません');
            return res.status(400).json({ error: '画像データが提供されていません。' });
        }

        // Claude APIへのリクエスト
        console.log('Claude APIへリクエスト送信中...');
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: [{
                    type: 'text',
                    text: 'この絵画を美術館の学芸員として分析してください。格調高いタイトルと、芸術的な観点からの解説文を日本語で提供してください。タイトルは「」で囲み、解説は200文字程度でお願いします。'
                }, {
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: 'image/png',
                        data: imageData.replace(/^data:image\/png;base64,/, '')
                    }
                }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });
        console.log('Claude APIレスポンス受信成功');

        const analysis = response.data.content[0].text;
        res.json({ analysis });

    } catch (error) {
        console.error('Claude API エラー:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            res.status(401).json({ error: 'Claude APIキーが無効です。正しいAPIキーを設定してください。' });
        } else if (error.response?.status === 429) {
            res.status(429).json({ error: 'API利用制限に達しました。しばらく待ってから再試行してください。' });
        } else {
            res.status(500).json({ error: 'アート解析中にエラーが発生しました。' });
        }
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎨 お絵かきアプリが起動しました: http://localhost:${PORT}`);
    console.log('📝 Claude API連携を使用するには、.envファイルでCLAUDE_API_KEYを設定してください。');
});
