---
name: websocket
description: Cross-platform WebSocket handlers, pub/sub, namespaces, and Server-Sent Events in Nitro
---

# WebSocket & SSE

Nitro provides cross-platform WebSockets via [CrossWS](https://crossws.h3.dev/) (Node, Bun, Deno, Cloudflare). Enable the feature first:

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  features: { websocket: true },
});
```

## Handlers

Export a `defineWebSocketHandler` from a route file — same file-based routing as HTTP handlers (`routes/_ws.ts` → `/_ws`).

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  open(peer) {
    console.log("connected", peer.id);
    peer.send("Welcome!");
  },
  message(peer, message) {
    peer.send(`echo: ${message.text()}`);
  },
  close(peer, details) {
    console.log("closed", details.code, details.reason);
  },
  error(peer, error) {
    console.error(error);
  },
});
```

### `upgrade` hook

Runs before the connection opens — authenticate, set namespace, attach context. Throw a `Response` to reject.

```ts [routes/chat.ts]
import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  upgrade(request) {
    const token = new URL(request.url).searchParams.get("token");
    if (!isValid(token)) throw new Response("Unauthorized", { status: 401 });
    return { context: { userId: getUserId(token) } }; // also: headers, namespace
  },
  open(peer) {
    console.log("user", peer.context.userId);
  },
});
```

## Peer & message

`peer` (in all hooks except `upgrade`) exposes `id`, `namespace`, `context`, `request`, `peers`, `topics`, plus methods:

```ts
peer.send("text");                 // or an object -> JSON
peer.subscribe("topic");
peer.unsubscribe("topic");
peer.publish("topic", data);       // broadcast to subscribers (not the sender)
peer.close(1000, "bye");
peer.terminate();
```

The `message` object: `message.text()`, `message.json<T>()`, `message.uint8Array()`, `message.arrayBuffer()`, `message.blob()`.

## Pub/Sub & namespaces

```ts [routes/rooms/[room].ts]
import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe("messages");
    peer.publish("messages", `${peer} joined ${peer.namespace}`);
  },
  message(peer, message) {
    peer.publish("messages", `${peer}: ${message.text()}`); // only same namespace
  },
  close(peer) {
    peer.publish("messages", `${peer} left`);
  },
});
```

Namespaces isolate pub/sub groups. By default the namespace is the request pathname — so dynamic routes (`/rooms/lobby` vs `/rooms/game`) are isolated automatically. Override by returning `namespace` from `upgrade`.

## Server-Sent Events (SSE)

Simpler server→client streaming over HTTP (auto-reconnects). Use `createEventStream` from `nitro/h3`:

```ts [routes/sse.ts]
import { defineHandler } from "nitro";
import { createEventStream } from "nitro/h3";

export default defineHandler((event) => {
  const stream = createEventStream(event);
  const interval = setInterval(() => {
    stream.push(`tick @ ${Date.now()}`);
  }, 1000);
  stream.onClosed(() => clearInterval(interval));
  return stream.send();
});
```

`stream.push` also accepts structured messages: `{ id, event, data, retry }`. Connect from the client with `new EventSource("/sse")`.

## Key Points

- Enable `features.websocket: true`; `defineWebSocketHandler` is imported from `nitro`.
- Hooks: `upgrade` (auth/context), `open`, `message`, `close`, `error`.
- `peer.publish` excludes the sender; namespaces (default = pathname) isolate broadcasts.
- For one-way streaming use SSE via `createEventStream` from `nitro/h3`.

<!--
Source references:
- https://nitro.build/docs/websocket
- https://crossws.h3.dev/
-->
