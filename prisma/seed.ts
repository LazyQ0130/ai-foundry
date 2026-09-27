import 'dotenv/config'
import argon2 from 'argon2'
import { db } from '../server/db.js'
import { stages } from '../src/data/courses.js'

export async function seed() {
  for (const item of stages) {
    const stage = await db.stage.upsert({
      where: { slug: item.slug },
      create: { slug: item.slug, order: item.id, title: item.title, subtitle: item.subtitle, price: item.price },
      // Operator-managed price and publication flags must survive later seeds.
      update: { order: item.id, title: item.title, subtitle: item.subtitle },
    })
    for (const lesson of item.lessons) await db.lesson.upsert({
      where: { id: lesson.id },
      // 目录同步：发布状态跟随 courses.ts；第 0 课默认试看。isPreview 仍可在后台调整。
      create: { id: lesson.id, stageId: stage.id, isPublished: lesson.isPublished ?? true, isPreview: lesson.isPrep ?? false },
      update: { stageId: stage.id, isPublished: lesson.isPublished ?? true },
    })
  }
  const phone = process.env.ADMIN_PHONE?.replace(/\s/g, '')
  const password = process.env.ADMIN_INITIAL_PASSWORD
  if (!phone) {
    if (await db.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })) return
    throw new Error('Set ADMIN_PHONE and ADMIN_INITIAL_PASSWORD before initial seeding')
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) throw new Error('Invalid seed administrator phone')
  const existing = await db.user.findUnique({ where: { phone } })
  if (existing && existing.role !== 'ADMIN') throw new Error('Seed phone belongs to a student; refusing to promote it')
  if (!existing) {
    if (!password || password.length < 8 || password.length > 72) throw new Error('Initial administrator password must be 8–72 characters')
    await db.user.create({ data: { phone, nickname: '管理员', role: 'ADMIN', passwordHash: await argon2.hash(password, { type: argon2.argon2id }) } })
  }
}
await seed().finally(() => db.$disconnect())
