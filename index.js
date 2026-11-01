const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks, keskkonnamuutujate parsimiseks
require('dotenv').config();
 
const dateET = require('./src/dateTimeET');
 
//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
//see rida võimaldab POST päringu sisu kätte saada
app.use(bodyparser.urlencoded({extended: true}));
 
app.get('/', async (req, res)=>{
	const dayNow = dateET.weekDay();
	const dateNow = dateET.fullDate(0);
	const timeNow = dateET.fullTime();
	//vaikimisi väärtused, kui fotot ei leita
	let photoFile = '/pic/avaleht.jpg';
	let photoAlt = 'Avalehe foto';
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
		const [sqlRes] = await conn.execute(sqlReq, [3]);
		if(sqlRes.length > 0){
			photoFile = '/gallery/normal/' + sqlRes[0].filename;
			//kui alternatiivteksti pole, mõtleme ise
			if(sqlRes[0].alttext){
				photoAlt = sqlRes[0].alttext;
			} else {
				photoAlt = 'Uusim avalik foto';
			}
		}
	}
	catch (err) {
		console.log('Viga: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow, photoFile: photoFile, photoAlt: photoAlt});
});

//fotogalerii
const galleryRouter = require('./routes/galleryRoutes');
app.use('/gallery', galleryRouter);
 
const textRef = 'public/txt/vanasonad.txt';
 
app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, 'utf8');
		let folkWisdom = data.split(';');
		const wisdom = folkWisdom[Math.floor(Math.random() * folkWisdom.length)];
		res.render('vanasona', {wisdom: wisdom});
	}
	catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});
 
//Külastuste marsruudid
const visitRouter = require('./routes/visitRoutes');
app.use('/kylastused', visitRouter);
 
//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

//galeriipiltide üleslaadimine
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);
 
app.get('/minust', (req, res)=>{
	res.render('minust');
});
app.listen(5123);