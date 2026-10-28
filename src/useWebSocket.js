// react-use-websocket only ships CommonJS with the hook on exports.default.
// Vite 8 follows Node's CJS interop, so the default import is the whole
// module.exports object rather than the hook itself; unwrap it here.
// https://github.com/robtaussig/react-use-websocket/issues/280
import reactUseWebSocket from "react-use-websocket";

const useReactWebSocket = reactUseWebSocket.default ?? reactUseWebSocket;

// Options for the PV Web Socket connections, based on the PVWS JavaScript client (pvws.js)
const PVWS_OPTIONS = {
    // For web sockets with shouldReconnect: retry after 1, 2, 4 and 8 seconds, then every 10 seconds like pvws.js,
    // for as long as the page is open instead of stopping after 20 attempts.
    // react-use-websocket starts the attempts over when it connects
    reconnectInterval: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    reconnectAttempts: Infinity,
    // Proxies often close a web socket after about a minute without traffic. Like pvws.js, when no message has been
    // received for 30 seconds ask PVWS to ping this web socket, which the browser answers.
    // JavaScript can't see that ping, so timeout is off or the heartbeat would close quiet connections that are fine
    heartbeat: { message: JSON.stringify({ type: "ping" }), interval: 30000, timeout: Infinity },
};

function useWebSocket(url, options, connect) {
    return useReactWebSocket(url, { ...PVWS_OPTIONS, ...options }, connect);
}

export default useWebSocket;
