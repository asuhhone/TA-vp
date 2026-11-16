const express = require('express');
const multer = require('multer');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

//seadistame multer vahevara (middleware) failide Ã¼leslaadimiseks
//mÃ¤Ã¤ran Ã¼leslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
//mÃ¤Ã¤rata saab veel nÃ¤iteks lubatud failitÃ¼Ã¼pe, faili suuruse piirangut jne

//kontrollerid
const{
	galleryPhotoUpload,
	galleryPhotoUploadPost} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);

//post osa suunatakse lÃ¤bi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;