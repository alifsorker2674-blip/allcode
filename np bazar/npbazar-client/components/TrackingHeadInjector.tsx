'use client';

import { useEffect, useRef } from 'react';

// Renders arbitrary admin-pasted <meta>/<link>/<script> HTML into <head>.
// dangerouslySetInnerHTML can't be used here — browsers do not execute
// <script> tags inserted via innerHTML. Recreating script elements via
// document.createElement + appendChild makes them actually run.
export default function TrackingHeadInjector({ html }: { html?: string }) {
  const appendedRef = useRef<Node[]>([]);

  useEffect(() => {
    if (!html) return;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nodes = [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)];
    const appended: Node[] = [];

    nodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;

      if (el.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        Array.from(el.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = el.textContent;
        document.head.appendChild(script);
        appended.push(script);
      } else {
        const clone = el.cloneNode(true);
        document.head.appendChild(clone);
        appended.push(clone);
      }
    });

    appendedRef.current = appended;
    return () => {
      appendedRef.current.forEach((n) => n.parentNode?.removeChild(n));
      appendedRef.current = [];
    };
  }, [html]);

  return null;
}
