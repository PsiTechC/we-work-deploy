import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../utils/auth'

export default function(prisma: PrismaClient){
  const router = Router()
  router.use(authMiddleware)

  router.post('/', async (req, res) => {
    const { siteId, category, amount, notes } = req.body
    const ex = await prisma.expense.create({ data: { siteId, category, amount: Number(amount), notes } })
    res.json(ex)
  })

  router.get('/', async (req, res) => {
    const items = await prisma.expense.findMany({ include: { site: true } })
    res.json(items)
  })

  router.put('/:id/approve', async (req, res) => {
    const id = Number(req.params.id)
    const ex = await prisma.expense.update({ where: { id }, data: { approved: true } })
    res.json(ex)
  })

  return router
}
