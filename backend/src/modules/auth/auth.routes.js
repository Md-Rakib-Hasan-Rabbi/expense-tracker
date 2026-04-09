const express = require('express');
const validate = require('../../common/middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validation');
const { register, login, refresh, logout } = require('./auth.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
