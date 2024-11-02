import { Request, Response, Router } from 'express'
import { onlyAuthenticatedAccess, persistentLog, onlyAdminAccess } from '../controllers/controllers'
const router = Router()

router.get('/', onlyAuthenticatedAccess, onlyAdminAccess, (req: Request, res: Response) => {
  const action = req.query.action

  persistentLog
    .getLogs(action?.toString())
    .then((logs) => res.status(200).json(logs))
    .catch((_) => {
      res.status(500).json({ error: 'Error al obtener los registros' })
    })
}
)

export default router
