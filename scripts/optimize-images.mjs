import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDirectory = new URL('../public/', import.meta.url)
const assetsDirectory = new URL('../public/assets/', import.meta.url)
const optimizedDirectory = new URL('../public/assets/optimized/', import.meta.url)

await mkdir(optimizedDirectory, { recursive: true })

const sourceFiles = (await readdir(assetsDirectory))
  .filter((file) => /\.(?:png|jpe?g)$/i.test(file) && !file.startsWith('inhouse-logo'))

for (const file of sourceFiles) {
  const input = new URL(file, assetsDirectory)
  const name = path.basename(file, path.extname(file))
  const image = sharp(fileURLToPath(input)).rotate()

  for (const width of [768, 1600]) {
    await image.clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5, smartSubsample: true })
      .toFile(fileURLToPath(new URL(`${name}-${width}.webp`, optimizedDirectory)))
  }
}

await sharp(fileURLToPath(new URL('../public/og.png', import.meta.url)))
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(fileURLToPath(new URL('og.jpg', publicDirectory)))

console.log(`Optimized ${sourceFiles.length} images into ${sourceFiles.length * 2} responsive WebP assets.`)
