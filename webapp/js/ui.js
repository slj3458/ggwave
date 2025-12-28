/**
 * UI Controller - Handles user interface interactions
 */

class UIController {
    constructor(transmitter, receiver) {
        this.transmitter = transmitter;
        this.receiver = receiver;
        this.canvas = null;
        this.canvasCtx = null;
        this.messageCount = 0;
    }

    /**
     * Initialize UI components
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initializeCanvas();
        console.log('UI Controller initialized');
    }

    /**
     * Setup DOM element references
     */
    setupElements() {
        // Input elements
        this.messageInput = document.getElementById('message-input');
        this.protocolSelect = document.getElementById('protocol-select');
        
        // Buttons
        this.transmitBtn = document.getElementById('transmit-btn');
        this.listenBtn = document.getElementById('listen-btn');
        this.stopListenBtn = document.getElementById('stop-listen-btn');
        this.clearCanvasBtn = document.getElementById('clear-canvas-btn');
        
        // Status messages
        this.transmitterStatus = document.getElementById('transmitter-status');
        this.receiverStatus = document.getElementById('receiver-status');
        this.receivedMessages = document.getElementById('received-messages');
        
        // Canvas
        this.canvas = document.getElementById('waveform-canvas');
        this.canvasCtx = this.canvas.getContext('2d');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Transmitter events
        this.transmitBtn.addEventListener('click', () => this.handleTransmit());
        
        // Receiver events
        this.listenBtn.addEventListener('click', () => this.handleStartListen());
        this.stopListenBtn.addEventListener('click', () => this.handleStopListen());
        
        // Canvas events
        this.clearCanvasBtn.addEventListener('click', () => this.clearCanvas());
        
        // Enter key support for message input
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleTransmit();
            }
        });
    }

    /**
     * Initialize canvas for visualization
     */
    initializeCanvas() {
        // Set canvas size
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 40; // Accounting for padding
        this.canvas.height = 200;
        
        // Clear canvas
        this.canvasCtx.fillStyle = '#f5f5f5';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
    }

    /**
     * Draw grid on canvas
     */
    drawGrid() {
        const gridSpacing = 40;
        this.canvasCtx.strokeStyle = '#ddd';
        this.canvasCtx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSpacing) {
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(x, 0);
            this.canvasCtx.lineTo(x, this.canvas.height);
            this.canvasCtx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSpacing) {
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(0, y);
            this.canvasCtx.lineTo(this.canvas.width, y);
            this.canvasCtx.stroke();
        }
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        this.canvasCtx.fillStyle = '#f5f5f5';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    /**
     * Handle transmit button click
     */
    async handleTransmit() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            this.showError('Please enter a message to transmit');
            return;
        }
        
        this.transmitBtn.disabled = true;
        
        try {
            this.showStatus('transmitter', 'Transmitting message...', 'info');
            
            // Use global app instance
            await window.ggwave.transmit(message);
            
            this.showStatus('transmitter', 'Message transmitted successfully!', 'success');
            this.messageInput.value = '';
            
            // Draw waveform representation
            this.drawTransmissionWaveform(message);
        } catch (error) {
            console.error('Transmission error:', error);
            this.showStatus('transmitter', 'Transmission failed: ' + error.message, 'error');
        } finally {
            this.transmitBtn.disabled = false;
        }
    }

    /**
     * Handle start listening button click
     */
    async handleStartListen() {
        this.listenBtn.disabled = true;
        this.stopListenBtn.disabled = false;
        
        try {
            this.showStatus('receiver', 'Starting listener...', 'info');
            
            // Use global app instance
            await window.ggwave.startListening();
            
            this.showStatus('receiver', 'Listening for messages...', 'success');
        } catch (error) {
            console.error('Listening error:', error);
            this.showStatus('receiver', 'Failed to start listening: ' + error.message, 'error');
            this.listenBtn.disabled = false;
            this.stopListenBtn.disabled = true;
        }
    }

    /**
     * Handle stop listening button click
     */
    handleStopListen() {
        try {
            window.ggwave.stopListening();
            
            this.showStatus('receiver', 'Stopped listening', 'info');
            this.listenBtn.disabled = false;
            this.stopListenBtn.disabled = true;
        } catch (error) {
            console.error('Error stopping listener:', error);
            this.showStatus('receiver', 'Error: ' + error.message, 'error');
        }
    }

    /**
     * Add received message to display
     */
    addReceivedMessage(message) {
        this.messageCount++;
        const timestamp = new Date().toLocaleTimeString();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message-item';
        messageEl.innerHTML = `
            <div>${escapeHtml(message)}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
        this.receivedMessages.insertBefore(messageEl, this.receivedMessages.firstChild);
        
        // Keep only last 20 messages
        while (this.receivedMessages.children.length > 20) {
            this.receivedMessages.removeChild(this.receivedMessages.lastChild);
        }
    }

    /**
     * Draw transmission waveform
     */
    drawTransmissionWaveform(message) {
        const binary = this.textToBinary(message);
        const bitsPerPixel = Math.ceil(binary.length / this.canvas.width);
        
        this.clearCanvas();
        
        this.canvasCtx.strokeStyle = '#667eea';
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.beginPath();
        
        const centerY = this.canvas.height / 2;
        const amplitude = 50;
        
        for (let x = 0; x < this.canvas.width; x++) {
            const startBit = x * bitsPerPixel;
            const endBit = Math.min(startBit + bitsPerPixel, binary.length);
            const bits = binary.substring(startBit, endBit);
            
            let y = centerY;
            if (bits.includes('1')) {
                y = centerY - amplitude;
            } else if (bits.includes('0')) {
                y = centerY + amplitude;
            }
            
            if (x === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
        }
        
        this.canvasCtx.stroke();
    }

    /**
     * Convert text to binary
     */
    textToBinary(text) {
        let binary = '';
        for (let i = 0; i < text.length; i++) {
            binary += text.charCodeAt(i).toString(2).padStart(8, '0');
        }
        return binary;
    }

    /**
     * Show status message
     */
    showStatus(section, message, type) {
        const statusEl = section === 'transmitter' ? this.transmitterStatus : this.receiverStatus;
        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 5000);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        console.log('Success:', message);
    }

    /**
     * Show loading message
     */
    showLoading(message) {
        console.log('Loading:', message);
    }
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
