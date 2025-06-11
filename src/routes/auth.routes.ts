import { Router } from 'express';
import { generateToken, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/generateToken', generateToken);


export default router;

