# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:css] [postcss] ENOENT: no such file or directory, stat '/app/tailwind.config.js'"
  - generic [ref=e5]: at Object.statSync (node:fs:1667:25) at resolveWithExtension (/app/node_modules/tailwindcss/lib/lib/getModuleDependencies.js:59:57) at _getModuleDependencies (/app/node_modules/tailwindcss/lib/lib/getModuleDependencies.js:74:24) at _getModuleDependencies.next (<anonymous>) at new Set (<anonymous>) at getModuleDependencies (/app/node_modules/tailwindcss/lib/lib/getModuleDependencies.js:98:12) at getTailwindConfig (/app/node_modules/tailwindcss/lib/lib/setupTrackingContext.js:48:58) at /app/node_modules/tailwindcss/lib/lib/setupTrackingContext.js:100:92 at /app/node_modules/tailwindcss/lib/processTailwindFeatures.js:46:11 at plugins (/app/node_modules/tailwindcss/lib/plugin.js:38:69
  - generic [ref=e6]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e7]: server.hmr.overlay
    - text: to
    - code [ref=e8]: "false"
    - text: in
    - code [ref=e9]: vite.config.ts
    - text: .
```