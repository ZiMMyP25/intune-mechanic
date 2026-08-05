import { copyFile, mkdir, readdir, rename } from 'node:fs/promises'

const distDirectory = new URL('../dist/', import.meta.url)
const clientDirectory = new URL('../dist/client/', import.meta.url)

await mkdir(clientDirectory, { recursive: true })

for (const entry of await readdir(distDirectory, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server') continue
  await rename(
    new URL(entry.name, distDirectory),
    new URL(entry.name, clientDirectory),
  )
}

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../worker/index.js', import.meta.url),
  new URL('../dist/server/index.js', import.meta.url),
)
