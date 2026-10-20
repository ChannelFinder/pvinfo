// react-use-websocket only ships CommonJS with the hook on exports.default.
// Vite 8 follows Node's CJS interop, so the default import is the whole
// module.exports object rather than the hook itself; unwrap it here.
// https://github.com/robtaussig/react-use-websocket/issues/280
import reactUseWebSocket from "react-use-websocket";

const useWebSocket = reactUseWebSocket.default ?? reactUseWebSocket;

export default useWebSocket;
