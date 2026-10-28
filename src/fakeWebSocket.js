// Fake browser WebSocket for tests, use it with vi.stubGlobal("WebSocket", FakeWebSocket).
// Each web socket that is created is added to FakeWebSocket.instances, and the test plays the server:
// it opens, drops or sends messages on it, and checks what the client sent
class FakeWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    static instances = [];

    constructor(url) {
        this.url = url;
        this.readyState = FakeWebSocket.CONNECTING;
        this.sent = [];
        this.closeListeners = [];
        FakeWebSocket.instances.push(this);
    }

    static latest() {
        return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    }

    send(message) {
        this.sent.push(JSON.parse(message));
    }

    // react-use-websocket's heartbeat listens for close to stop pinging
    addEventListener(type, listener) {
        if (type === "close") {
            this.closeListeners.push(listener);
        }
    }

    // the client closes the web socket, like react-use-websocket does on unmount
    close() {
        this.readyState = FakeWebSocket.CLOSED;
        this.closeListeners.forEach((listener) => listener({ target: this }));
    }

    // the server accepts the connection
    open() {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.({ target: this });
    }

    // the connection fails or is dropped, like a proxy closing it
    drop() {
        this.readyState = FakeWebSocket.CLOSED;
        this.onerror?.({ target: this });
        const event = { target: this, code: 1006, reason: "", wasClean: false };
        this.onclose?.(event);
        this.closeListeners.forEach((listener) => listener(event));
    }

    // a message from the server
    receive(message) {
        this.onmessage?.({ target: this, data: JSON.stringify(message) });
    }

    // PVWS sends echo messages back as they are
    echo() {
        this.sent.filter((message) => message.type === "echo").forEach((message) => this.receive(message));
    }
}

export default FakeWebSocket;
