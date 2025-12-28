/**
 * GGWave Receiver - Handles audio signal reception and decoding
 */

class Receiver {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.analyser = null;
        this.isListening = false;
        this.eventListeners = {};
        
        // Reception parameters
        this.fftSize = 2048;
        this.threshold = -30; // dB threshold for detection
        this.detectionInterval = 100; // ms
    }

    /**
     * Set the audio context
     */
    setAudioContext(context) {
        this.audioContext = context;
    }

    /**
     * Start listening for audio signals
     */
    async startListening() {
        if (this.isListening) {
            throw new Error('Already listening');
        }

        try {
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            // Create audio nodes
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            
            source.connect(this.analyser);
            
            this.isListening = true;
            this.startDetection();
            
            console.log('Receiver started');
        } catch (error) {
            console.error('Failed to start receiver:', error);
            throw error;
        }
    }

    /**
     * Start signal detection
     */
    startDetection() {
        const detectionInterval = setInterval(() => {
            if (!this.isListening) {
                clearInterval(detectionInterval);
                return;
            }
            
            const spectrum = this.getFrequencySpectrum();
            const dominantFrequency = this.findDominantFrequency(spectrum);
            
            if (dominantFrequency) {
                this.emit('frequency', dominantFrequency);
            }
        }, this.detectionInterval);
    }

    /**
     * Get frequency spectrum from analyser
     */
    getFrequencySpectrum() {
        if (!this.analyser) return null;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    /**
     * Find dominant frequency in spectrum
     */
    findDominantFrequency(spectrum) {
        if (!spectrum) return null;
        
        let maxValue = 0;
        let maxIndex = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            if (spectrum[i] > maxValue) {
                maxValue = spectrum[i];
                maxIndex = i;
            }
        }
        
        // Convert to dB and check threshold
        const dB = 20 * Math.log10(maxValue / 255);
        if (dB < this.threshold) {
            return null;
        }
        
        // Convert bin index to frequency
        const nyquistFrequency = this.audioContext.sampleRate / 2;
        const frequency = (maxIndex * nyquistFrequency) / this.analyser.frequencyBinCount;
        
        return frequency;
    }

    /**
     * Decode binary data from frequencies
     */
    binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            text += String.fromCharCode(parseInt(byte, 2));
        }
        return text;
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (!this.isListening) return;
        
        this.isListening = false;
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        console.log('Receiver stopped');
    }

    /**
     * Check if currently listening
     */
    isListeningNow() {
        return this.isListening;
    }

    /**
     * Event listener registration
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(
                listener => listener !== callback
            );
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
}
