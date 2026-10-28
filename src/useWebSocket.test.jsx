import { render, act } from '@testing-library/react';
import FakeWebSocket from './fakeWebSocket';
import useWebSocket from './useWebSocket';

function Connection({ url = 'ws://pvws/pv', options = { shouldReconnect: () => true } }) {
  useWebSocket(url, options);
  return null;
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function renderConnection(props) {
  render(<Connection {...props} />);
  await act(async () => {});
}

const advance = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

// drop the latest web socket and return how long it takes to reconnect, in 100 ms steps up to a minute
async function reconnectDelay() {
  const count = FakeWebSocket.instances.length;
  await act(async () => FakeWebSocket.latest().drop());
  let delay = 0;
  while (FakeWebSocket.instances.length === count && delay < 60000) {
    await advance(100);
    delay += 100;
  }
  return delay;
}

describe('reconnect', () => {
  test('reconnects after 1, 2, 4 and 8 seconds, then every 10 seconds', async () => {
    await renderConnection();
    const delays = [];
    for (let i = 0; i < 6; ++i) {
      delays.push(await reconnectDelay());
    }
    expect(delays).toEqual([1000, 2000, 4000, 8000, 10000, 10000]);
  });

  test('keeps reconnecting after 20 attempts', async () => {
    await renderConnection();
    for (let i = 0; i < 25; ++i) {
      await act(async () => FakeWebSocket.latest().drop());
      await advance(10000);
    }
    expect(FakeWebSocket.instances).toHaveLength(26);
  });

  test('reconnects after 1 second again once it has connected', async () => {
    await renderConnection();
    await reconnectDelay();
    await reconnectDelay();
    await act(async () => FakeWebSocket.latest().open());
    expect(await reconnectDelay()).toBe(1000);
  });
});

describe('keepalive', () => {
  const pings = (socket) => socket.sent.filter((message) => message.type === 'ping').length;

  test('asks PVWS for a ping after 30 seconds without a message, like pvws.js', async () => {
    await renderConnection();
    await act(async () => FakeWebSocket.latest().open());
    await advance(29000);
    expect(pings(FakeWebSocket.latest())).toBe(0);
    await advance(1000);
    expect(FakeWebSocket.latest().sent).toEqual([{ type: 'ping' }]);
  });

  test('does not ping while messages are received', async () => {
    await renderConnection();
    await act(async () => FakeWebSocket.latest().open());
    for (let i = 0; i < 6; ++i) {
      await advance(20000);
      await act(async () => FakeWebSocket.latest().receive({ type: 'update', pv: 'TEST:PV', value: i }));
    }
    expect(pings(FakeWebSocket.latest())).toBe(0);
  });

  test('keeps a quiet connection open, PVWS answers with a web socket ping that JavaScript can not see', async () => {
    await renderConnection();
    await act(async () => FakeWebSocket.latest().open());
    await advance(5 * 60000);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.latest().readyState).toBe(FakeWebSocket.OPEN);
    expect(pings(FakeWebSocket.latest())).toBe(10);
  });

  test('the shared web socket for the search results gets the keepalive too', async () => {
    await renderConnection({ url: 'ws://pvws/shared', options: { share: true } });
    await act(async () => FakeWebSocket.latest().open());
    await advance(30000);
    expect(FakeWebSocket.latest().sent).toEqual([{ type: 'ping' }]);
  });
});
