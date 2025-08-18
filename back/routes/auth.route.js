import express from 'express';
import { login, register, loginWithGoogle, requestPasswordReset, confirmPasswordReset } from '../controllers/auth.controller.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', loginWithGoogle);
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset/confirm', confirmPasswordReset);
 
export default router;