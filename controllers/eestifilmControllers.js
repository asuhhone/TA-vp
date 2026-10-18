const mysql = require('mysql2/promise');
 
//andmebaasi ühenduse andmed .env failist
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
};
 
//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public
 
const eestifilm = (req, res) => {
	res.render('eestifilm');
};
 
//@desc page for list of people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public
 
const inimesed = async (req, res) => {
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
};
 
//@desc page for adding people involved in Estonian Film industry
//@route GET /eestifilm/inimesed_add
//@access public
 
const inimesedAdd = (req, res) => {
	res.render('eestifilmiinimesed_add', {
		notice: 'Ootan sisestust!',
		firstName: null,
		lastName: null,
		born: null,
		deceased: null
	});
};
 
//@desc page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_add
//@access public
 
const inimesedAddPost = async (req, res) => {
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
};
 
//@desc page for adding film genres
//@route GET /eestifilm/zanrid_add
//@access public
 
const zanridAdd = (req, res) => {
	res.render('eestifilmizanrid_add', {notice: 'Ootan sisestust!', genreName: null, genreDescription: null});
};
 
//@desc page for adding film genres
//@route POST /eestifilm/zanrid_add
//@access public
 
const zanridAddPost = async (req, res) => {
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
};
 
//@desc page for adding professions related to film
//@route GET /eestifilm/ametid_add
//@access public
 
const ametidAdd = (req, res) => {
	res.render('eestifilmiametid_add', {notice: 'Ootan sisestust!', professionTitle: null, professionDescription: null});
};
 
//@desc page for adding professions related to film
//@route POST /eestifilm/ametid_add
//@access public
 
const ametidAddPost = async (req, res) => {
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
};
 
module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	zanridAdd,
	zanridAddPost,
	ametidAdd,
	ametidAddPost
};