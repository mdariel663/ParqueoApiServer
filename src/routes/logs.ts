import express from 'express'
import controllers from '../controllers/controllers'
const router = express.Router()

router.get(
  '/',
  controllers.middleware.onlyAuthenticated,
  controllers.middleware.authorizeAdmin,
  (req, res) => {
    const action = req.query.action
    controllers.persistentLog
      .getLogs(action?.toString())
      .then((logs) => res.status(200).json(logs))
      .catch((_) => {
        res.status(500).json({ error: 'Error al obtener los registros' })
      })
  }
)

export default router
