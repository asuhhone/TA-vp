const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

const watermarkFile = "./public/pic/vp_logo_small.png";

//@desc home page for uploading gallery photos
//@route GET /galleryPhotoUpload
//@access private

const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
};

//@desc home page for uploading gallery photos
//@route POST /galleryPhotoUpload
//@access private

const galleryPhotoUploadPost = async (req, res) => {
	console.log(req.body);
	console.log(req.file);
	let conn;
	try {
		//genereerime oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		await fs.rename(req.file.path, req.file.destination + fileName);
		//kontrollin, kas vesimÃ¤rgi fail on olemas
		const watermarkSettings = [{
			input: watermarkFile,
			gravity: "southeast"
		}];
		if (!await fs.access(watermarkFile).then(() => true).catch(() => false)) {
             //console.log("VesimÃ¤rgi faili ei leitud!");
             // TÃ¼hjendame seaded, et vesimÃ¤rki ei proovitaks lisada
             watermarkSettings.length = 0; 
        }
		
		//pildi suuruse muutmine (max 800 X 600)
		//await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90}).toFile('./public/gallery/normal/' + fileName);
		let normalImageProcessor = await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90});
		//lisan vesimÃ¤rgi
		//console.log("Lisan vesimÃ¤rgi" + watermarkSettings.length);    
        if (watermarkSettings.length > 0) {
            normalImageProcessor = await normalImageProcessor.composite(watermarkSettings);
        }
		await normalImageProcessor.toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
				
		//teeme pisipildi (100 X 100)
		await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile('./public/gallery/thumbs/' + fileName);
		let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
		//const userId = 1;//see on ajutine, kuni pÃ¤ris kasutajakontod teeme
		const userId = req.session.userId;
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log('Salvestatii kirje id: ' + result.insertId);//teinekord kasulik teada
		res.render('galleryPhotoUpload');
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('galleryPhotoUpload');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	galleryPhotoUpload,
	galleryPhotoUploadPost
}