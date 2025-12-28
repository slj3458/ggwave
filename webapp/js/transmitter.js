/**
 * GGWave Transmitter - Handles audio signal transmission
 */

class Transmitter {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isTransmitting = false;
        
        // Transmission parameters
        this.frequency = 18000; // Starting frequency (Hz)
        this.duration = 2; // Duration per symbol (ms)
        this.amplitude = 0.3;
        this.baudRate = 1000; // Data rate (bits per second)
    }

    /**
     * Set the audio context
     */
    setAudioContext(context) {
        this.audioContext = context;
    }

    /**
     * Convert text message to binary
     */
    textToBinary(text) {
        let binary = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            binary += code.toString(2).padStart(8, '0');
        }
        return binary;
    }

    /**
     * Generate frequency from binary data
     */
    getFrequencyForBit(bit) {
        // Simple FSK (Frequency Shift Keying)
        // 0 -> lower frequency, 1 -> higher frequency
        const shift = 1000; // 1kHz shift
        return bit === '0' ? this.frequency : this.frequency + shift;
    }

    /**
     * Transmit a message
     */
    async transmit(message) {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        if (this.isTransmitting) {
            throw new Error('Already transmitting');
        }

        return new Promise((resolve, reject) => {
            try {
                this.isTransmitting = true;
                
                // Convert message to binary
                const binary = this.textToBinary(message);
                
                // Create audio nodes
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.gainNode.gain.value = this.amplitude;
                
                // Schedule transmissions
                let currentTime = this.audioContext.currentTime;
                const symbolDuration = this.duration / 1000; // Convert to seconds
                
                for (let i = 0; i < binary.length; i++) {
                    const bit = binary[i];
                    const frequency = this.getFrequencyForBit(bit);
                    const startTime = currentTime + (i * symbolDuration);
                    const endTime = startTime + symbolDuration;
                    
                    this.playTone(frequency, startTime, endTime);
                }
                
                // Stop transmission after all bits are sent
                const totalDuration = binary.length * symbolDuration;
                setTimeout(() => {
                    this.isTransmitting = false;
                    resolve();
                }, (totalDuration + 0.5) * 1000); // Add 500ms buffer
                
            } catch (error) {
                this.isTransmitting = false;
                reject(error);
            }
        });
    }

    /**
     * Play a tone at specified frequency
     */
    playTone(frequency, startTime, endTime) {
        const osc = this.audioContext.createOscillator();
        const gainEnv = this.audioContext.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        // Apply envelope to avoid clicks
        const rampTime = 0.01; // 10ms ramp
        gainEnv.gain.setValueAtTime(0, startTime);
        gainEnv.gain.linearRampToValueAtTime(1, startTime + rampTime);
        gainEnv.gain.setValueAtTime(1, endTime - rampTime);
        gainEnv.gain.linearRampToValueAtTime(0, endTime);
        
        osc.connect(gainEnv);
        gainEnv.connect(this.gainNode);
        
        osc.start(startTime);
        osc.stop(endTime);
    }

    /**
     * Get transmission parameters
     */
    getParameters() {
        return {
            frequency: this.frequency,
            duration: this.duration,
            amplitude: this.amplitude,
            baudRate: this.baudRate
        };
    }

    /**
     * Set transmission parameters
     */
    setParameters(params) {
        if (params.frequency) this.frequency = params.frequency;
        if (params.duration) this.duration = params.duration;
        if (params.amplitude) this.amplitude = params.amplitude;
        if (params.baudRate) this.baudRate = params.baudRate;
    }

    /**
     * Stop transmission
     */
    stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
        this.isTransmitting = false;
    }
}
