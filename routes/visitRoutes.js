const express = require('express');
const router = express.Router();

//kontrollerid
const {
	visitsHome,
	regVisit,
	regVisitPost} = require('../controllers/visitControllers');

router.route('/').get(visitsHome);

router.route('/regvisit').get(regVisit);

router.route('/regvisit').post(regVisitPost);

module.exports = router;