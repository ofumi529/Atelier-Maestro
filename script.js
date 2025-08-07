class PaintApp {
    constructor() {
        this.canvas = document.getElementById('paintCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.history = [];
        this.historyStep = -1;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.saveState();
    }

    initializeCanvas() {
        // キャンバスサイズを設定
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // モバイルでは縦長に設定
            const maxWidth = Math.min(350, containerRect.width - 20);
            this.canvas.width = maxWidth;
            this.canvas.height = Math.floor(maxWidth * 1.4); // 縦長比率 1:1.4
        } else {
            // デスクトップでは横長
            this.canvas.width = Math.min(800, containerRect.width - 40);
            this.canvas.height = Math.min(600, containerRect.height - 40);
        }
        
        // キャンバスの背景を白に設定
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 描画設定
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
    }

    setupEventListeners() {
        // キャンバスイベント
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // タッチイベント（モバイル対応）
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // ツール選択
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTool(e.target.closest('.tool-btn').dataset.tool);
            });
        });

        // カラーパレット
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
            });
        });

        // カスタムカラーピッカー
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.selectColor(e.target.value);
        });

        // ブラシサイズ
        const brushSizeSlider = document.getElementById('brushSize');
        brushSizeSlider.addEventListener('input', (e) => {
            this.setBrushSize(parseInt(e.target.value));
        });

        // アクションボタン
        document.getElementById('undoBtn').addEventListener('click', this.undo.bind(this));
        document.getElementById('redoBtn').addEventListener('click', this.redo.bind(this));
        document.getElementById('clearBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveImage.bind(this));
        document.getElementById('analyzeBtn').addEventListener('click', this.analyzeArt.bind(this));

        // モーダル
        document.getElementById('modalClose').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('analysisModal').addEventListener('click', (e) => {
            if (e.target.id === 'analysisModal') {
                this.closeModal();
            }
        });

        // ウィンドウリサイズ対応
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        if (e.type === 'touchstart') {
            this.startDrawing(mouseEvent);
        } else if (e.type === 'touchmove') {
            this.draw(mouseEvent);
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentTool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // ツールボタンの状態更新
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // カーソルの変更
        if (tool === 'eraser') {
            this.canvas.classList.add('eraser-cursor');
        } else {
            this.canvas.classList.remove('eraser-cursor');
        }
    }

    selectColor(color) {
        this.currentColor = color;
        
        // カラーパレットの状態更新
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });
        
        const selectedSwatch = document.querySelector(`[data-color="${color}"]`);
        if (selectedSwatch) {
            selectedSwatch.classList.add('active');
        }
        
        // カスタムカラーピッカーの値更新
        document.getElementById('colorPicker').value = color;
        
        this.ctx.strokeStyle = color;
    }

    setBrushSize(size) {
        this.brushSize = size;
        document.getElementById('brushSizeValue').textContent = `${size}px`;
        
        // ブラシプレビューの更新
        const preview = document.getElementById('brushPreview');
        const previewSize = Math.min(size * 2, 50);
        preview.style.setProperty('--brush-size', `${previewSize}px`);
        preview.querySelector('::after') || (preview.innerHTML = '');
        preview.style.background = `radial-gradient(circle, ${this.currentColor} ${previewSize/2}px, transparent ${previewSize/2}px)`;
        
        this.ctx.lineWidth = size;
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
        
        // 履歴の制限（メモリ節約）
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
        
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }

    restoreState() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyStep];
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        document.getElementById('undoBtn').disabled = this.historyStep <= 0;
        document.getElementById('redoBtn').disabled = this.historyStep >= this.history.length - 1;
    }

    clearCanvas() {
        if (confirm('キャンバスをクリアしますか？この操作は元に戻せません。')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveState();
        }
    }

    saveImage() {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `artwork-${timestamp}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    async analyzeArt() {
        const modal = document.getElementById('analysisModal');
        const resultDiv = document.getElementById('analysisResult');
        const artworkPreview = document.getElementById('artworkPreview');
        
        // 額縁内に作品を表示
        this.displayArtworkInFrame(artworkPreview);
        
        // モーダルを表示
        modal.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>AIが作品を解析中です...</p>
            </div>
        `;

        // 利用制限チェック関数
        this.checkUsageLimit = function() {
            const today = new Date().toDateString();
            const usageData = JSON.parse(localStorage.getItem('artAnalysisUsage') || '{}');
            
            // 日付が変わっていたらリセット
            if (usageData.date !== today) {
                usageData.date = today;
                usageData.count = 0;
                localStorage.setItem('artAnalysisUsage', JSON.stringify(usageData));
            }
            
            return {
                canUse: usageData.count < 5,
                remainingUses: Math.max(0, 5 - usageData.count),
                usedToday: usageData.count
            };
        };
        
        // 利用回数をインクリメント
        this.incrementUsage = function() {
            const today = new Date().toDateString();
            const usageData = JSON.parse(localStorage.getItem('artAnalysisUsage') || '{}');
            
            usageData.date = today;
            usageData.count = (usageData.count || 0) + 1;
            localStorage.setItem('artAnalysisUsage', JSON.stringify(usageData));
        };
        
        // 利用制限チェック
        const usageStatus = this.checkUsageLimit();
        if (!usageStatus.canUse) {
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>✨ 今日の利用上限に達しました</h3>
                    <p>アート解析機能は1日に5回までご利用いただけます。</p>
                    <p>明日またお試しください。</p>
                    <p><small>今日の利用回数: ${usageStatus.usedToday}/5回</small></p>
                </div>
            `;
            return;
        }
        
        // Canvasから画像データを取得
        const imageData = this.canvas.toDataURL('image/png');
        
        // ローディング表示（残り回数も表示）
        resultDiv.innerHTML = `
            <div class="loading">
                アートを解析中...<br>
                <small>残り利用回数: ${usageStatus.remainingUses - 1}/5回</small>
            </div>
        `;
        
        // サーバーにリクエストを送信
        try {
            const response = await fetch('/api/analyze-art', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageData })
            });
            
            console.log('APIレスポンス状況:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            // レスポンスの内容をテキストとして取得
            const responseText = await response.text();
            console.log('レスポンステキスト:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON解析エラー:', parseError);
                console.error('レスポンス内容:', responseText.substring(0, 500));
                throw new Error(`サーバーから無効なレスポンスが返されました: ${response.status} ${response.statusText}`);
            }
            
            if (response.ok) {
                // 利用回数をインクリメント
                this.incrementUsage();
                const newUsageStatus = this.checkUsageLimit();
                
                // 成功時の表示
                const analysisText = data.analysis;
                const lines = analysisText.split('\n');
                const title = lines[0]; // 最初の行をタイトルとして使用
                const content = lines.slice(1).join('<br>'); // 残りを本文として使用
                
                resultDiv.innerHTML = `
                    <div class="analysis-content">
                        <div class="analysis-title">${title}</div>
                        <div class="analysis-text">${content}</div>
                        <div class="usage-info">
                            <small>🎆 今日の利用回数: ${newUsageStatus.usedToday}/5回 ・ 残り: ${newUsageStatus.remainingUses}回</small>
                        </div>
                    </div>
                `;
                
                // シェア機能を表示して初期化
                this.showShareButtons(title, analysisText);
            } else {
                // エラー時の表示
                resultDiv.innerHTML = `
                    <div class="error-content">
                        <h3><i class="fas fa-exclamation-triangle"></i> エラー</h3>
                        <p>${data.error}</p>
                        <div class="error-help">
                            <p><strong>解決方法:</strong></p>
                            <ul>
                                <li>.envファイルでCLAUDE_API_KEYを設定してください</li>
                                <li>有効なClaude APIキーを使用してください</li>
                                <li>サーバーを再起動してください</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('=== フロントエンドエラー ===');
            console.error('エラー詳細:', error);
            console.error('エラーメッセージ:', error.message);
            console.error('エラースタック:', error.stack);
            
            let errorMessage = 'サーバーとの通信に失敗しました。';
            let debugInfo = '';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'ネットワーク接続エラーです。インターネット接続を確認してください。';
                debugInfo = 'Network connection failed';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'APIエンドポイントにアクセスできません。サーバーの状態を確認してください。';
                debugInfo = 'API endpoint unreachable';
            }
            
            resultDiv.innerHTML = `
                <div class="error-content">
                    <h3><i class="fas fa-exclamation-triangle"></i> 通信エラー</h3>
                    <p>${errorMessage}</p>
                    ${debugInfo ? `<p><small>デバッグ情報: ${debugInfo}</small></p>` : ''}
                    <div class="error-help">
                        <p><strong>解決方法:</strong></p>
                        <ul>
                            <li>ページをリロードして再度お試しください</li>
                            <li>インターネット接続を確認してください</li>
                            <li>しばらく時間をおいてから再度お試しください</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    displayArtworkInFrame(previewCanvas) {
        // プレビューキャンバスのサイズを設定
        const maxWidth = 400;
        const maxHeight = 300;
        const aspectRatio = this.canvas.width / this.canvas.height;
        
        let previewWidth, previewHeight;
        if (aspectRatio > maxWidth / maxHeight) {
            previewWidth = maxWidth;
            previewHeight = maxWidth / aspectRatio;
        } else {
            previewHeight = maxHeight;
            previewWidth = maxHeight * aspectRatio;
        }
        
        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;
        
        // メインキャンバスの内容をプレビューにコピー
        const previewCtx = previewCanvas.getContext('2d');
        previewCtx.drawImage(this.canvas, 0, 0, previewWidth, previewHeight);
    }

    closeModal() {
        document.getElementById('analysisModal').style.display = 'none';
        // シェアボタンを非表示
        document.getElementById('shareButtons').style.display = 'none';
    }

    // X投稿用画像を生成
    generateShareImage(title, description) {
        const shareCanvas = document.createElement('canvas');
        const ctx = shareCanvas.getContext('2d');
        
        // SNS最適サイズ (1200x630)
        shareCanvas.width = 1200;
        shareCanvas.height = 630;
        
        // 背景グラデーション
        const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
        gradient.addColorStop(0, '#F5DEB3');
        gradient.addColorStop(0.5, '#DEB887');
        gradient.addColorStop(1, '#CD853F');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 630);
        
        // 装飾的な枠線
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 1160, 590);
        
        // 内側の枠線
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, 1120, 550);
        
        // アプリタイトル
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 32px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎨 アトリエ マエストロ', 600, 80);
        
        // 作品エリア（左側）
        const artworkX = 80;
        const artworkY = 120;
        const artworkWidth = 400;
        const artworkHeight = 300;
        
        // 額縁効果
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(artworkX - 15, artworkY - 15, artworkWidth + 30, artworkHeight + 30);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(artworkX - 10, artworkY - 10, artworkWidth + 20, artworkHeight + 20);
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(artworkX - 5, artworkY - 5, artworkWidth + 10, artworkHeight + 10);
        
        // 白い背景
        ctx.fillStyle = 'white';
        ctx.fillRect(artworkX, artworkY, artworkWidth, artworkHeight);
        
        // 作品を描画
        const aspectRatio = this.canvas.width / this.canvas.height;
        let drawWidth, drawHeight;
        if (aspectRatio > artworkWidth / artworkHeight) {
            drawWidth = artworkWidth;
            drawHeight = artworkWidth / aspectRatio;
        } else {
            drawHeight = artworkHeight;
            drawWidth = artworkHeight * aspectRatio;
        }
        
        const drawX = artworkX + (artworkWidth - drawWidth) / 2;
        const drawY = artworkY + (artworkHeight - drawHeight) / 2;
        ctx.drawImage(this.canvas, drawX, drawY, drawWidth, drawHeight);
        
        // テキストエリア（右側）
        const textX = 520;
        const textY = 140;
        const textWidth = 620;
        
        // タイトル
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'left';
        const titleLines = this.wrapText(ctx, title, textWidth, 32);
        let currentY = textY;
        titleLines.forEach(line => {
            ctx.fillText(line, textX, currentY);
            currentY += 36;
        });
        
        // 解説文
        currentY += 15;
        ctx.fillStyle = '#654321';
        ctx.font = '18px serif';
        const descLines = this.wrapText(ctx, description, textWidth, 22);
        const maxDescLines = Math.min(descLines.length, 12); // 最大12行
        for (let i = 0; i < maxDescLines; i++) {
            ctx.fillText(descLines[i], textX, currentY);
            currentY += 28;
        }
        
        // ハッシュタグ
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('#アトリエマエストロ #AI絵画解析 #デジタルアート', textX, 580);
        
        return shareCanvas;
    }
    
    // テキストを指定幅で折り返し（日本語対応）
    wrapText(ctx, text, maxWidth, lineHeight) {
        const lines = [];
        let currentLine = '';
        
        // 日本語テキストの場合、文字単位で処理
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
            
            // 改行文字の場合は強制改行
            if (char === '\n') {
                lines.push(currentLine.slice(0, -1)); // 改行文字を除く
                currentLine = '';
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    // 画像をダウンロード
    downloadShareImage(canvas, filename = 'atelier-maestro-artwork.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Xでシェア
    shareOnX(title, description) {
        const shareText = `🎨 アトリエ マエストロで作品を描きました！\n\n「${title}」\n\n${description.substring(0, 100)}...\n\n#アトリエマエストロ #AI絵画解析 #デジタルアート\n\nhttps://ateliermaestro-painting-ai.vercel.app`;
        const encodedText = encodeURIComponent(shareText);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    // シェア機能を表示して初期化
    showShareButtons(title, description) {
        const shareButtonsDiv = document.getElementById('shareButtons');
        const sharePreviewCanvas = document.getElementById('shareImagePreview');
        
        // シェア用画像を生成
        const shareCanvas = this.generateShareImage(title, description);
        
        // プレビュー表示
        const previewCtx = sharePreviewCanvas.getContext('2d');
        sharePreviewCanvas.width = 400;
        sharePreviewCanvas.height = Math.round(400 * (630 / 1200)); // アスペクト比維持
        previewCtx.drawImage(shareCanvas, 0, 0, sharePreviewCanvas.width, sharePreviewCanvas.height);
        
        // ボタンイベントリスナーを設定
        const downloadBtn = document.getElementById('downloadImageBtn');
        const twitterBtn = document.getElementById('shareTwitterBtn');
        
        // 既存のイベントリスナーを削除
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        twitterBtn.replaceWith(twitterBtn.cloneNode(true));
        
        // 新しいイベントリスナーを追加
        document.getElementById('downloadImageBtn').addEventListener('click', () => {
            this.downloadShareImage(shareCanvas, `atelier-maestro-${Date.now()}.png`);
        });
        
        document.getElementById('shareTwitterBtn').addEventListener('click', () => {
            this.shareOnX(title, description);
        });
        
        // シェアボタンを表示
        shareButtonsDiv.style.display = 'block';
    }

    handleResize() {
        // リサイズ時にキャンバスサイズを調整（内容は保持）
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempCtx.drawImage(this.canvas, 0, 0);
        
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        this.initializeCanvas();
        
        // 新しいサイズに合わせて内容をスケール
        const scaleX = this.canvas.width / oldWidth;
        const scaleY = this.canvas.height / oldHeight;
        this.ctx.drawImage(tempCanvas, 0, 0, oldWidth, oldHeight, 0, 0, this.canvas.width, this.canvas.height);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new PaintApp();
    
    // ブラシプレビューの初期化
    const brushSize = document.getElementById('brushSize');
    const brushPreview = document.getElementById('brushPreview');
    
    function updateBrushPreview() {
        const size = parseInt(brushSize.value);
        const previewSize = Math.min(size * 2, 50);
        brushPreview.style.width = `${previewSize}px`;
        brushPreview.style.height = `${previewSize}px`;
        brushPreview.style.background = '#8B4513';
        brushPreview.style.borderRadius = '50%';
    }
    
    updateBrushPreview();
    brushSize.addEventListener('input', updateBrushPreview);
});
