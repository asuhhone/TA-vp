const express = require('express');
const router = express.Router();

//kontrollerid
const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	zanridAdd,
	zanridAddPost,
	ametidAdd,
	ametidAddPost} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').post(inimesedAddPost);

router.route('/zanrid_add').get(zanridAdd);

router.route('/zanrid_add').post(zanridAddPost);

router.route('/ametid_add').get(ametidAdd);

router.route('/ametid_add').post(ametidAddPost);

module.exports = router;