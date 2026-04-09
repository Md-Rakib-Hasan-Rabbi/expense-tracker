const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const { getMe, updateMe, changePassword } = require('./users.controller');
const { updateMeSchema, changePasswordSchema } = require('./users.validation');

const router = express.Router();

router.use(authRequired);
router.get('/me', getMe);
router.patch('/me', validate(updateMeSchema), updateMe);
router.patch('/me/password', validate(changePasswordSchema), changePassword);

module.exports = router;
