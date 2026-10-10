const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks, keskkonnamuutujate parsimiseks
require('dotenv').config();

//andmebaasi ühenduse andmed .env failist
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
};
const dateET = require('./src/dateTimeET');

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
//see rida võimaldab POST päringu sisu kätte saada
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	const dayNow = dateET.weekDay();
	const dateNow = dateET.fullDate(0);
	const timeNow = dateET.fullTime();
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

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
const regTextRef = 'public/txt/visits.txt';

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		//nimest võtame komad ja semikoolonid ära, et need faili vormingut ei lõhuks
		const visitorName = String(req.body.nameInput || '').replace(/[,;]/g, ' ').trim();
		//nimi, kuupäev ja kellaaeg komadega eraldatud, kirje lõpus semikoolon
		const visitInfo = visitorName + ',' + dateET.fullDate(0) + ',' + dateET.fullTime() + ';';
		await fs.appendFile(regTextRef, visitInfo);
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});
app.get('/lastvisit', async (req, res)=>{
	try {
		const data = await fs.readFile(regTextRef, 'utf8');
		//igal kirjel on lõpus ";", seega listi viimane element on tühi
		//ja viimane külastus on eelviimane element
		const visits = data.split(';');
		if(visits.length < 2){
			return res.render('lastvisit', {hasVisit: false, name: '', date: '', time: ''});
		}
		const lastVisit = visits[visits.length - 2].split(',');
		res.render('lastvisit', {hasVisit: true, name: lastVisit[0], date: lastVisit[1], time: lastVisit[2]});
	}
	catch (err){
		//kui faili pole veel olemas, pole ka külastusi
		console.log(err);
		res.render('lastvisit', {hasVisit: false, name: '', date: '', time: ''});
	}
});
app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'SELECT * FROM person ORDER BY last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmiinimesed', {personList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiinimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/inimesed_add', (req, res)=>{
	res.render('eestifilmiinimesed_add', {
		notice: 'Ootan sisestust!',
		firstName: null,
		lastName: null,
		born: null,
		deceased: null
	});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	//kuupäevad tekstist ajaobjektideks, et neid saaks võrrelda
	const now = new Date();
	const bornDate = new Date(req.body.bornInput);

	//kontrollime andmete olemasolu ja sünnikuupäeva õigsust
	let inputOk = true;
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > now){
		inputOk = false;
	}
	//surmakuupäeva kontroll ainult siis, kui see on sisestatud
	if(req.body.deceasedInput != ''){
		const deceasedObj = new Date(req.body.deceasedInput);
		if(isNaN(deceasedObj.getTime()) || deceasedObj > now || deceasedObj < bornDate){
			inputOk = false;
		}
	}
	//vea korral saadame sisestatud väärtused tagasi vormi
	if(!inputOk){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmiinimesed_add', {
			notice: 'Andmed on puudulikud või vigased!',
			firstName: req.body.firstNameInput,
			lastName: req.body.lastNameInput,
			born: req.body.bornInput,
			deceased: req.body.deceasedInput
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		let deceasedDate = null;
		if(req.body.deceasedInput != ''){
			deceasedDate = req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilmiinimesed_add', {
			notice: 'Andmed salvestati! Ootan uut sisestust!',
			firstName: null,
			lastName: null,
			born: null,
			deceased: null
		});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiinimesed_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			firstName: req.body.firstNameInput,
			lastName: req.body.lastNameInput,
			born: req.body.bornInput,
			deceased: req.body.deceasedInput
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});
//--- žanrite lisamine ---
app.get('/eestifilm/zanrid_add', (req, res)=>{
	res.render('eestifilmizanrid_add', {notice: 'Ootan sisestust!', genreName: null, genreDescription: null});
});

app.post('/eestifilm/zanrid_add', async (req, res)=>{
	console.log(req.body);
	const genreName = (req.body.genreNameInput || '').trim();
	const genreDescription = (req.body.genreDescriptionInput || '').trim();
	//nimi on kohustuslik ja pikkused peavad mahtuma andmebaasi veergudesse (50 ja 1000)
	if(!genreName || genreName.length > 50 || genreDescription.length > 1000){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmizanrid_add', {
			notice: 'Andmed on puudulikud või liiga pikad!',
			genreName: genreName,
			genreDescription: genreDescription
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'INSERT INTO genre (name, description) VALUES (?,?)';
		let descriptionValue = null;
		if(genreDescription != ''){
			descriptionValue = genreDescription;
		}
		await conn.execute(sqlReq, [genreName, descriptionValue]);
		res.render('eestifilmizanrid_add', {
			notice: 'Andmed salvestati! Ootan uut sisestust!',
			genreName: null,
			genreDescription: null
		});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmizanrid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			genreName: genreName,
			genreDescription: genreDescription
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

//--- ametite lisamine ---
app.get('/eestifilm/ametid_add', (req, res)=>{
	res.render('eestifilmiametid_add', {notice: 'Ootan sisestust!', professionTitle: null, professionDescription: null});
});

app.post('/eestifilm/ametid_add', async (req, res)=>{
	console.log(req.body);
	const professionTitle = (req.body.professionTitleInput || '').trim();
	const professionDescription = (req.body.professionDescriptionInput || '').trim();
	if(!professionTitle || professionTitle.length > 50 || professionDescription.length > 1000){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmiametid_add', {
			notice: 'Andmed on puudulikud või liiga pikad!',
			professionTitle: professionTitle,
			professionDescription: professionDescription
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'INSERT INTO profession (title, description) VALUES (?,?)';
		let descriptionValue = null;
		if(professionDescription != ''){
			descriptionValue = professionDescription;
		}
		await conn.execute(sqlReq, [professionTitle, descriptionValue]);
		res.render('eestifilmiametid_add', {
			notice: 'Andmed salvestati! Ootan uut sisestust!',
			professionTitle: null,
			professionDescription: null
		});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiametid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			professionTitle: professionTitle,
			professionDescription: professionDescription
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});
app.get('/minust', (req, res)=>{
	res.render('minust');
});
app.listen(5123);