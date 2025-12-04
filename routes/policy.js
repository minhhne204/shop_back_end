import express from 'express'
import { getPolicies, getPolicyByType } from '../controllers/policyController.js'

const router = express.Router()

router.get('/', getPolicies)
router.get('/:type', getPolicyByType)

export default router
