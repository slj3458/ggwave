# GGWave Web Application

A web-based implementation of GGWave for audio-based data transmission using your browser.

## Features

- **Transmitter**: Send data through audio signals
- **Receiver**: Listen and decode audio signals
- **Visualization**: Real-time waveform display
- **Cross-platform**: Works in any modern web browser

## Installation

### Prerequisites
- Node.js (optional, for local development server)
- Modern web browser with Web Audio API support

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/slj3458/ggwave.git
   cd ggwave/webapp
   ```

2. Install dependencies (optional):
   ```bash
   npm install
   ```

3. Start a local server:
   ```bash
   npm run dev
   ```
   Or simply open `index.html` in your browser.

## Usage

### Transmitting Data

1. Enter your message in the "Message to Transmit" field
2. Select the protocol (GGWave or Custom)
3. Click "Transmit"
4. The audio signal will be generated and played through your speaker

### Receiving Data

1. Click "Start Listening"
2. Allow microphone access when prompted
3. The receiver will decode incoming audio signals
4. Received messages will appear in the "Received Messages" section
5. Click "Stop Listening" to end reception

## File Structure

```
webapp/
├── index.html          # Main HTML interface
├── package.json        # npm configuration
├── README.md          # Documentation
├── .gitignore         # Git ignore rules
├── css/
│   └── style.css      # Styling
└── js/
    ├── app.js         # Application entry point
    ├── transmitter.js # Transmission logic
    ├── receiver.js    # Reception logic
    └── ui.js          # UI interaction handlers
```

## Technologies Used

- **HTML5**: Structure
- **CSS3**: Styling
- **JavaScript (ES6+)**: Core functionality
- **Web Audio API**: Audio processing
- **Canvas API**: Visualization

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## API Reference

### Transmitter

```javascript
const transmitter = new Transmitter();
transmitter.transmit("Hello World");
```

### Receiver

```javascript
const receiver = new Receiver();
receiver.startListening();
receiver.on('message', (data) => console.log(data));
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
