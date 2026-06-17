import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../utils/auth'

export default function(prisma: PrismaClient){
  const router = Router()
  router.use(authMiddleware)

  router.get('/', async (req, res) => {
    const vendors = await prisma.vendor.findMany()
    res.json(vendors)
  })

  router.post('/', async (req, res) => {
    const data = req.body
    const v = await prisma.vendor.create({ data })
    res.json(v)
  })

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const v = await prisma.vendor.update({ where: { id }, data: req.body })
    res.json(v)
  })

  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    await prisma.vendor.delete({ where: { id } })
    res.json({ ok: true })
  })

  return router
}
