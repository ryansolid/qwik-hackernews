import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      qwikVite({
        entryStrategy: { type: "component" },
        srcEntryServerInput: "entry.cloudflare.tsx"
      })
    ],
  };
});
