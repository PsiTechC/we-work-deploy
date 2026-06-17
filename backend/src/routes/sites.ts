import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../utils/auth'

export default function(prisma: PrismaClient){
  const router = Router()
  router.use(authMiddleware)

  router.get('/', async (_req, res) => {
    const sites = await prisma.site.findMany()
    res.json(sites)
  })

  router.post('/', async (req: any, res: any) => {
    const role = req.user?.role
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      return res.status(403).json({ error: 'Admin or Manager only' })
    }
    const { name } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Site name is required' })
    try {
      const site = await prisma.site.create({ data: { name: name.trim() } })
      res.json(site)
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(400).json({ error: 'A site with this name already exists' })
      res.status(500).json({ error: e.message })
    }
  })

  return router
}
