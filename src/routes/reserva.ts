import Router from 'express'
import ReservaController from '../controllers/ReservaController'
import { onlyAuthenticatedAccess } from '../controllers/controllers';
const router = Router()
router.post('/', onlyAuthenticatedAccess, ReservaController.createReserva);
router.get('/', onlyAuthenticatedAccess, ReservaController.getReservas);
router.delete('/:reservationId', onlyAuthenticatedAccess, ReservaController.deleteReserva);

export default router