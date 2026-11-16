const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

//kasutatavad kontrollerid
const {
	galleryPage
	} = require('../controllers/galleryControllers');

router.route('/').get(galleryPage);

module.exports = router;