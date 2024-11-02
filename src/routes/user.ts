import express from 'express'
import {
  onlyAuthenticatedAccess,
  onlyAdminAccess
} from '../controllers/controllers'
import UserController from '../controllers/UserController'

const router = express.Router()

router.get('/', onlyAuthenticatedAccess, UserController.getCurrent)
router.get('/list', onlyAuthenticatedAccess, onlyAdminAccess, UserController.getUsers)

router.put('/', onlyAuthenticatedAccess, UserController.update)

router.post('/', UserController.create)
router.post('/login', UserController.login)

router.delete('/:userIdDelete', onlyAuthenticatedAccess, UserController.delete)

export default router
