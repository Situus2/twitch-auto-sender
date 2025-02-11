# Twitch Chat Auto Sender

**Disclaimer:** This extension is for educational purposes only. It is not intended for spamming or interfering with Twitch chat, and the author is not affiliated with Twitch. Use it responsibly.

## Description

Twitch Chat Auto Sender is a browser extension designed to automate sending messages in Twitch chat by simulating natural typing. The extension is compatible with both Google Chrome and Microsoft Edge.

A standout feature of this extension is its message modification system—when enabled, it automatically alters every **second** message sent. This ensures that every alternate message is subtly different according to one of three configurable modification modes:

- **Random**: Appends either a random letter or an underscore to the end of the message.
- **Duplicate**: Repeats the last character of the original message (for example, `"hello"` becomes `"helloo"`).
- **Underscore**: Simply adds an underscore (`"_"`) at the end of the message.

In addition, the extension supports dynamic language switching (English and Polish). When you change the language in the settings, the user interface—including labels and buttons—updates immediately.

## Features

- **Auto Send**: Automatically sends messages at a user-defined interval.
- **Message Modification**: Alters every second message using the selected modification mode:
  - *Random*: Adds a random letter or an underscore.
  - *Duplicate*: Duplicates the last character.
  - *Underscore*: Appends an underscore.
- **Dynamic Language Switching**: Instantly toggles the interface language between English and Polish.
- **Customizable Settings**: Adjust the sending interval, modification mode, and language through an options page.
- **Cross-Browser Compatibility**: Works on both Google Chrome and Microsoft Edge.

## How It Works

1. **Injection into Twitch Chat**:  
   The extension injects a custom "Auto Send" button adjacent to the Twitch chat's native send button.

2. **Starting Auto Send**:  
   When you click the "Start Auto Send" button, the extension begins sending messages at the specified interval. The first message is sent immediately, and subsequent messages are sent automatically based on your interval settings.

3. **Message Modification (Every Second Message)**:  
   If the message modification feature is enabled, every second message is modified according to the selected mode:
   - **Random**: Appends either a random letter or an underscore.
   - **Duplicate**: Repeats the last character of the original message.
   - **Underscore**: Adds a single underscore at the end of the message.

4. **Simulated Typing**:  
   Instead of sending the full message instantly, the extension simulates human typing by triggering key events (`keydown`, `keypress`, `input`, and `keyup`) for each character with a short delay between them. This ensures that the text appears naturally.

5. **Dynamic Settings Update**:  
   Changes made in the options page (such as interval, modification mode, or language) are applied immediately. The extension listens for these changes and updates the process in real time.

## Installation

1. **Clone this repository.**
2. **Open your browser's extensions page** (e.g., `chrome://extensions/` in Chrome or Edge).
3. **Enable "Developer mode".**
4. **Click "Load unpacked"** and select the repository folder.

## Usage

1. **Navigate to a Twitch chat.**
2. **Open the extension's options page** to configure your settings.
3. **Click the "Start Auto Send" button** (located next to the Twitch send button) to begin auto-sending messages.
4. **Click "Stop Auto Send"** to end the automation.

## Disclaimer

This extension is developed solely for educational and demonstration purposes. It is not intended to spam or disrupt Twitch chat services. The author does not endorse any misuse of this extension and is not responsible for any violation of Twitch's terms of service. Please use it responsibly.

## License

This project is licensed under the MIT License.
