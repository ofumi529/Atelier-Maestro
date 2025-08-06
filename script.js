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
        
        this.canvas.width = Math.min(800, containerRect.width - 40);
        this.canvas.height = Math.min(600, containerRect.height - 40);
        
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
        
        try {
            // キャンバスの画像データを取得
            const imageData = this.canvas.toDataURL('image/png');
            
            // サーバーにリクエストを送信
            const response = await fetch('/api/analyze-art', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageData })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 成功時の表示
                const analysisText = data.analysis;
                const lines = analysisText.split('\n');
                const title = lines[0]; // 最初の行をタイトルとして使用
                const content = lines.slice(1).join('<br>'); // 残りを本文として使用
                
                resultDiv.innerHTML = `
                    <div class="analysis-content">
                        <div class="analysis-title">${title}</div>
                        <div class="analysis-text">${content}</div>
                    </div>
                `;
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
            console.error('解析エラー:', error);
            resultDiv.innerHTML = `
                <div class="error-content">
                    <h3><i class="fas fa-exclamation-triangle"></i> 通信エラー</h3>
                    <p>サーバーとの通信に失敗しました。サーバーが起動していることを確認してください。</p>
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
    }

    handleResize() {
        // リサイズ時にキャンバスサイズを調整（内容は保持）
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.initializeCanvas();
        this.ctx.putImageData(imageData, 0, 0);
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
