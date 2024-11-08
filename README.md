# Multiplayer Tic-Tac-Toe

Project made as an excercise to create a multiplayer game.

# Features

- Fully front-end app in native HTML/JS/CSS
- Players connect via a RTCPeerConnection
- Keeps score over a series of games
- Players can see what opponent is hovering

# Components / Screens

- Connection dialog:
  - Pops up when opening page and guides user to establish a connection
- Game screen:
  - Board with clickable spots to place X or O there
  - Score indicator
  - Random player goes first, then they alternate

# Possible challenges

- How to deal with lost connections during a game?

# Roadmap

- [x] Implement RTCPeerConnection functionality
- [x] Implement connection dialogs
- [ ] Implement interactive board
- [ ] Implement game logic
- [ ] Implement game sync
- [ ] Improve connection dialogs
