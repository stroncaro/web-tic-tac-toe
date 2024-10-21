# Multiplayer Tic-Tac-Toe

Project made as an excercise to create a multiplayer game.

# Features

- Fully front-end app in native HTML/JS/CSS
- Players connect via WebSockets: hosting player creates a game and shares IP
- Keeps score over a series of games
- Players can see what opponent is hovering

# Components / Screens

- Connection screen:
  - Host button: prints IP in message area and copies it to clipboard, and waits for connection
  - Join button: attemps to connect to IP in text field
  - Cancel button: to cancel ongoing process
  - IP text field: for user to input IP to connect to
  - Message area: for feedback
  - When either button is pressed, buttons are grayed out, cancel button becomes available
  - When a connection is succesfull, goes to game screen
- Game screen:
  - Board with clickable spots to place X or O there
  - Score indicator
  - Random player goes first, then they alternate

# Possible challenges

- How to deal with lost connections during a game?

# Roadmap

- [ ] Implement WebSocket connection functionality and dialogs:
- [ ] Implement interactive board
- [ ] Implement game logic
- [ ] Implement game sync
