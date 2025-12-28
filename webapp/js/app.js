/**
 * GGWave Web Application - Main Entry Point
 * Initializes the application and coordinates between components
 */

class GGWaveApp {
    constructor() {
        this.transmitter = new Transmitter();
        this.receiver = new Receiver();
        this.ui = new UIController(this.transmitter, this.receiver);
        this.audioContext = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing GGWave Web Application...');
            
            // Initialize Audio Context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Initialize components
            this.transmitter.setAudioContext(this.audioContext);
            this.receiver.setAudioContext(this.audioContext);
            
            // Initialize UI
            this.ui.init();
            
            this.isInitialized = true;
            console.log('GGWave Web Application initialized successfully');
            
            // Handle audio context suspension (required by browser policies)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            });
        } catch (error) {
            console.error('Failed to initialize GGWave App:', error);
            this.ui.showError('Failed to initialize application: ' + error.message);
        }
    }

    /**
     * Transmit a message
     */
    async transmit(message) {
        if (!this.isInitialized) {
            this.ui.showError('Application not initialized');
            return;
        }
        
        try {
            this.ui.showLoading('Transmitting...');
            await this.transmitter.transmit(message);
            this.ui.showSuccess('Message transmitted successfully');
        } catch (error) {
            console.error('Transmission error:', error);
            this.ui.showError('Transmission failed: ' + error.message);
        }
    }

    /**
     * Start receiving messages
     */
    async startListening() {
        if (!this.isInitialized) {
            this.ui.showError('Application not initialized');
            return;
        }
        
        try {
            this.ui.showLoading('Starting listener...');
            await this.receiver.startListening();
            this.ui.showSuccess('Listening for messages');
            
            // Handle received messages
            this.receiver.on('message', (message) => {
                this.ui.addReceivedMessage(message);
            });
            
            this.receiver.on('error', (error) => {
                this.ui.showError('Receiver error: ' + error);
            });
        } catch (error) {
            console.error('Listening error:', error);
            this.ui.showError('Failed to start listening: ' + error.message);
        }
    }

    /**
     * Stop receiving messages
     */
    stopListening() {
        try {
            this.receiver.stopListening();
            this.ui.showSuccess('Stopped listening');
        } catch (error) {
            console.error('Error stopping listener:', error);
            this.ui.showError('Error stopping listener: ' + error.message);
        }
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            audioContext: this.audioContext?.state,
            isReceiving: this.receiver.isListening(),
            version: '1.0.0'
        };
    }
}

// Initialize application when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new GGWaveApp();
    app.init();
    
    // Make app available globally for debugging
    window.ggwave = app;
});
