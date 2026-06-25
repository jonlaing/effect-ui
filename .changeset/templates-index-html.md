---
"create-effex": patch
---

Add the missing `index.html` entry file to the `ssg` and `ssr` templates. Only the `spa` template previously had one, which broke the client build step (`vite build`) in scaffolded SSG projects — Vite needs `index.html` as the client entry, and the SSG build path additionally reads `dist/index.html` after the client build to extract hashed asset paths for injection into the generated static pages. Both new files mirror the working `examples/twitter` shape and point their script tag at the existing `/src/client.ts` entry.
