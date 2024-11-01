import express from 'express'
import { onlyAuthenticatedAccess, onlyStaffAccess } from '../controllers/controllers'
import { SpaceParkingController } from '../controllers/SpaceParkingController'

const router = express.Router()

// Obtener todas las plazas de aparcamiento
router.get('/', onlyAuthenticatedAccess, onlyStaffAccess, SpaceParkingController.getAllSpaces)
router.post('/', onlyAuthenticatedAccess, onlyStaffAccess, SpaceParkingController.createSpace)
router.put('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, SpaceParkingController.updateSpace)
router.delete('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, SpaceParkingController.deleteSpace)
router.get("/:parkingSpaceId/reservas", onlyAuthenticatedAccess, onlyStaffAccess, SpaceParkingController.getReservaSpaceById)

/*
 */
export default router
