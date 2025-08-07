import axios from 'axios';

// Vercelサーバーレス関数として動作するAPIエンドポイント
export default async function handler(req, res) {
    try {
        // CORS設定
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        res.setHeader('Content-Type', 'application/json');

        // OPTIONSリクエストの処理
        if (req.method === 'OPTIONS') {
            res.status(200).json({ message: 'CORS preflight successful' });
            return;
        }

        // POSTメソッドのみ許可
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // デバッグ情報をログに出力
        console.log('=== API呼び出し開始 ===');
        console.log('環境:', process.env.NODE_ENV || 'development');
        console.log('APIキー設定状況:', process.env.CLAUDE_API_KEY ? '設定済み' : '未設定');

        const { imageData } = req.body;
        console.log('画像データ受信:', imageData ? 'あり' : 'なし');
        
        // APIキーの検証を強化
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            console.log('エラー: CLAUDE_API_KEYが設定されていません');
            return res.status(500).json({ 
                error: 'AI解析サービスの設定が完了していません。管理者にお問い合わせください。',
                debug: 'CLAUDE_API_KEY not set'
            });
        }
        
        if (!apiKey.startsWith('sk-ant-')) {
            console.log('エラー: 無効なClaude APIキー形式');
            return res.status(500).json({ 
                error: 'AI解析サービスの設定に問題があります。管理者にお問い合わせください。',
                debug: 'Invalid API key format'
            });
        }

        if (!imageData) {
            console.log('エラー: 画像データがありません');
            return res.status(400).json({ error: '画像データが提供されていません。' });
        }

        // Claude APIへのリクエスト
        try {
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
        console.error('=== エラー発生 ===');
        console.error('エラーメッセージ:', error.message);
        console.error('HTTPステータス:', error.response?.status);
        console.error('レスポンスデータ:', error.response?.data);
        console.error('リクエストURL:', error.config?.url);
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: 'ネットワーク接続エラーです。しばらくしてから再度お試しください。',
                debug: `Network error: ${error.code}`
            });
        } else if (error.response?.status === 401) {
            res.status(401).json({ 
                error: 'Claude APIキーが無効です。管理者にお問い合わせください。',
                debug: 'Invalid API key'
            });
        } else if (error.response?.status === 429) {
            res.status(429).json({ 
                error: 'API利用制限に達しました。しばらく待ってから再試行してください。',
                debug: 'Rate limit exceeded'
            });
        } else {
            res.status(500).json({ 
                error: 'アート解析中にエラーが発生しました。しばらくしてから再度お試しください。',
                debug: error.message || 'Unknown error'
            });
        }
        }
    } catch (globalError) {
        // サーバーレス関数全体のエラーハンドリング
        console.error('=== サーバーレス関数エラー ===');
        console.error('エラー詳細:', globalError);
        
        try {
            res.status(500).json({
                error: 'サーバー内部エラーが発生しました。しばらくしてから再度お試しください。',
                debug: globalError.message || 'Server internal error'
            });
        } catch (responseError) {
            console.error('レスポンス送信エラー:', responseError);
        }
    }
}
