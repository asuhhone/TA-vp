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
	ametidAddPost,
	seosedAdd,
	seosedAddPost,
	seosed} = require('../controllers/eestifilmControllers');
 
router.route('/').get(eestifilm);
 
router.route('/inimesed').get(inimesed);
 
router.route('/inimesed_add').get(inimesedAdd);
 
router.route('/inimesed_add').post(inimesedAddPost);
 
router.route('/zanrid_add').get(zanridAdd);
 
router.route('/zanrid_add').post(zanridAddPost);
 
router.route('/ametid_add').get(ametidAdd);
 
router.route('/ametid_add').post(ametidAddPost);
 
router.route('/seosed_add').get(seosedAdd);
 
router.route('/seosed_add').post(seosedAddPost);
 
router.route('/seosed').get(seosed);
 
module.exports = router;
 