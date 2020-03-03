# Multiplayer Angband Variants Client

## What's this?

This is a **DEVELOPER PREVIEW** version of a universal client
written in JavaScript. It relies on websockify to provide
a WebSocket connection to the game servers, then talks to those
as if it was a normal client. You can use it to setup a "webclient"
page on your website, run it locally or even bundle as some
kind of native app.

*Ideally*, server admins would setup websockify on their machines,
BUT IT'S NOT A REQUIREMENT. Such bridges can be hosted by anybody,
and also started locally.

What should be working:

- You should be able to connect to the game, see the cave,
the chat, your inven/equip AND walk around. That's it!

What's not working:

- EVERYTHING!

Your help is required to make this happen.

Both network-side and ui-side need work. There's basically
NO UI AT ALL, no CSS, no nothing, frontend developers welcome!

# Setup instructions.

1. Download and compile [this version](https://github.com/flambard-took/websockify-other)
of websockify.
2. Start your game server (MAngband, PWMAngband, TomeNET,
any other variant, any version).
3. Start websockify and route a port. For example, if your
server is running on port 18346, you can route it like:

```
./websockify 18350 localhost:18346

```

4. Note, that websockify project contains many versions
of it's software, written in several languages (for you
to choose), and also can completely overtake the program's
port (so there's ONLY a websocket interface), I'll leave
that to you. I've tested it with a patched C version,
see above for the link.
5. If your game is MAngband 1.5.3, TomeNET >=4.7.2 or
PWMangband 1.4.0 (unreleased?), you can use one of
the pre-written protocol handlers. If it's another
game or version, you should write your own protocol
handler. See `net-core.js` and any of the existing
handlers for more info.
6. To run the client, open 'react.html' in your browser.
7. START HACKING.


## mangclient-js

### net-core.js

This piece of code can be used as a library for writing clients
in JavaScript, it handles network connections, and sends
off events, it doesn't do any rendering and doesn't react on it's
own. It's based on excellent [websock.js](tool) which is part
of the websockify project.

- modern event handling mechanism
- unified abstractions over common packets
- "protocol handlers" to cover different servers/variants

Related files: `net-*.js`

### mangclient-react.js

Debug client. Not meant for production use. Not meant to impose
React over client development. It shows the basics though,
and will probably be used for consolidating protocol handlers
some more.

Related files: react.html, z-canvas.js, ui-react.js.
