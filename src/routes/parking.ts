import express from 'express'
import { onlyAuthenticatedAccess, onlyStaffAccess } from '../controllers/controllers'
import ParkingController from '../controllers/ParkingController'
const router = express.Router()

router.get('/', onlyAuthenticatedAccess, onlyStaffAccess, ParkingController.getAllSpaces)
router.get('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, ParkingController.getSpaceById)
router.post('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, ParkingController.createSpace)
router.delete('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, ParkingController.deleteSpace)
router.put('/:spaceId', onlyAuthenticatedAccess, onlyStaffAccess, ParkingController.updateSpace)

export default router
