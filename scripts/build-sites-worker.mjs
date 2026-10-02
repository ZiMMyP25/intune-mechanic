import { copyFile, cp, mkdir, readdir, rename, rm, stat } from 'node:fs/promises'

const distDirectory = new URL('../dist/', import.meta.url)
const clientDirectory = new URL('../dist/client/', import.meta.url)
const clientAssetsDirectory = new URL('./assets/', clientDirectory)
const optimizedAssetsDirectory = new URL('./optimized/', clientAssetsDirectory)

await mkdir(clientDirectory, { recursive: true })

for (const entry of await readdir(distDirectory, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server') continue
  await rename(
    new URL(entry.name, distDirectory),
    new URL(entry.name, clientDirectory),
  )
}

for (const entry of await readdir(clientAssetsDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || entry.name.startsWith('inhouse-logo') || !/\.(?:png|jpe?g)$/i.test(entry.name)) continue
  const name = entry.name.slice(0, entry.name.lastIndexOf('.'))
  if (await fileExists(new URL(`${name}-1600.webp`, optimizedAssetsDirectory))) {
    await rm(new URL(entry.name, clientAssetsDirectory), { force: true })
  }
}

if (await fileExists(new URL('og.jpg', clientDirectory))) await rm(new URL('og.png', clientDirectory), { force: true })

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../worker/index.js', import.meta.url),
  new URL('../dist/server/index.js', import.meta.url),
)

await mkdir(new URL('../dist/.openai/', import.meta.url), { recursive: true })
await copyFile(new URL('../.openai/hosting.json', import.meta.url), new URL('../dist/.openai/hosting.json', import.meta.url))
await cp(new URL('../.openai/drizzle/', import.meta.url), new URL('../dist/.openai/drizzle/', import.meta.url), { recursive: true })

async function fileExists(url) {
  try {
    await stat(url)
    return true
  } catch {
    return false
  }
}
