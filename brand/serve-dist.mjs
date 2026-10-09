// dist/client-কে SPA হিসেবে সার্ভ করো (সব পাথ → _shell.html) — প্রোড shell-এর hydration লোকালে যাচাই করতে
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join } from "node:path"
const root = process.argv[2] ?? "dist/client", port = Number(process.argv[3] ?? 4180)
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".json": "application/json" }
createServer(async (req, res) => {
  const url = new URL(req.url, "http://x"); let p = join(root, decodeURIComponent(url.pathname))
  try { if (!(await stat(p)).isFile()) throw 0 } catch { p = join(root, "_shell.html") }
  try { res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); res.end(await readFile(p)) } catch { res.writeHead(404); res.end() }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`))
