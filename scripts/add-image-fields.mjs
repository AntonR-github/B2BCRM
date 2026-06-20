import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const THUMBNAILS = [
  '/assets/img/roffu3.png',
  '/assets/img/aria.png',
  '/assets/img/fogpro3.png',
  '/assets/img/lanza3.png',
]

async function main() {
  const site = await prisma.site.findFirst({ where: { slug: 'xvape' }, select: { id: true } })
  if (!site) throw new Error('xvape site not found')

  // Find max order for compare page fields
  const last = await prisma.textField.findFirst({
    where: { siteId: site.id, page: 'compare' },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  let order = (last?.order ?? 0) + 1

  for (let n = 1; n <= 4; n++) {
    const key = `compare.prod${n}_image`
    await prisma.textField.upsert({
      where: { siteId_key: { siteId: site.id, key } },
      update: {},
      create: {
        siteId: site.id,
        key,
        label: `Product ${n} Image URL`,
        value: THUMBNAILS[n - 1],
        type: 'TEXT',
        page: 'compare',
        order: order++,
      },
    })
    console.log(`Upserted ${key}`)
  }
}

main().finally(() => prisma.$disconnect())
