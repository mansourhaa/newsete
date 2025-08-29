// src/components/LiveBar.js
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function LiveBar({ apiBase }) {
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null); // {title, url, source}

  useEffect(() => {
    if (!apiBase) return;

    const socket = io(apiBase, {
      transports: ['websocket'],
      path: '/socket.io'
    });

    function onConnect()    { setConnected(true);  }
    function onDisconnect() { setConnected(false); }

    function onBreaking(payload) {
      // Show toast for 6s
      setToast({
        title:  payload.title,
        source: payload.source,
        url:    payload.url
      });
      setTimeout(() => setToast(null), 6000);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('breaking-news', onBreaking);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('breaking-news', onBreaking);
      socket.disconnect();
    };
  }, [apiBase]);

  return (
    <>
      <div className="livebar">
        <span className={`live-dot ${connected ? 'on' : 'off'}`}></span>
        <span className="live-text">
          Live updates: {connected ? 'ON' : 'OFF'}
        </span>
      </div>

      {toast && (
        <div className="toast toast-success" role="alert">
          <div className="toast-title">Breaking • {toast.source}</div>
          <a className="toast-body" href={toast.url} target="_blank" rel="noreferrer">
            {toast.title}
          </a>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </>
  );
}
