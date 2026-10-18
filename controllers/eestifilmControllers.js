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
//abifunktsioon: loeb rippmenüüde jaoks inimesed, filmid ja ametid
const readSelectLists = async (conn) => {
	const [personList] = await conn.execute('SELECT id, first_name, last_name, born FROM person ORDER BY last_name, first_name');
	const [movieList] = await conn.execute('SELECT id, title, release_year FROM movie ORDER BY title');
	const [professionList] = await conn.execute('SELECT id, title FROM profession ORDER BY title');
	return {personList, movieList, professionList};
};
 
//@desc page for adding relations between people, films and professions
//@route GET /eestifilm/seosed_add
//@access public
 
const seosedAdd = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const lists = await readSelectLists(conn);
		res.render('eestifilmiseosed_add', {
			notice: 'Ootan sisestust!',
			personList: lists.personList,
			movieList: lists.movieList,
			professionList: lists.professionList,
			personId: null,
			movieId: null,
			professionId: null,
			characterName: null
		});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed_add', {
			notice: 'Andmebaasist lugemine nurjus!',
			personList: [],
			movieList: [],
			professionList: [],
			personId: null,
			movieId: null,
			professionId: null,
			characterName: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};
 
//@desc saving a relation between person, film and profession
//@route POST /eestifilm/seosed_add
//@access public
 
const seosedAddPost = async (req, res) => {
	console.log(req.body);
	const personId = Number(req.body.personSelect);
	const movieId = Number(req.body.movieSelect);
	const professionId = Number(req.body.professionSelect);
	let characterName = (req.body.characterInput || '').trim();
 
	let conn;
	//abifunktsioon vormi uuesti näitamiseks koos rippmenüüdega
	const showForm = async (notice, clear = false) => {
		const lists = await readSelectLists(conn);
		res.render('eestifilmiseosed_add', {
			notice: notice,
			personList: lists.personList,
			movieList: lists.movieList,
			professionList: lists.professionList,
			personId: clear ? null : personId,
			movieId: clear ? null : movieId,
			professionId: clear ? null : professionId,
			characterName: clear ? null : characterName
		});
	};
 
	try {
		conn = await mysql.createConnection(dbConfig);
 
		//kõik kolm rippmenüüd peavad olema valitud
		if(!personId || !movieId || !professionId){
			return await showForm('Vali inimene, film ja amet!');
		}
 
		//kontrollime, kas valitud amet on "näitleja"
		const [professionRes] = await conn.execute('SELECT title FROM profession WHERE id = ?', [professionId]);
		if(professionRes.length == 0){
			return await showForm('Sellist ametit pole!');
		}
		const isActor = professionRes[0].title.trim().toLowerCase() == 'näitleja';
		if(isActor){
			if(!characterName || characterName.length > 100){
				return await showForm('Näitleja puhul tuleb sisestada tegelaskuju nimi (kuni 100 märki)!');
			}
		}
		else {
			//teiste ametite puhul tegelaskuju ei salvesta
			characterName = '';
		}
		const characterValue = isActor ? characterName : null;
 
		//kontrollime, kas täpselt sama seos on juba olemas
		//<=> on NULL-ohutu võrdlus: NULL <=> NULL annab tõese tulemuse
		const [existing] = await conn.execute(
			'SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?',
			[personId, movieId, professionId, characterValue]
		);
		if(existing.length > 0){
			return await showForm('Selline seos on juba olemas, ei salvestanud!');
		}
 
		await conn.execute(
			'INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?,?,?,?)',
			[personId, movieId, professionId, characterValue]
		);
		await showForm('Seos salvestati! Ootan uut sisestust!', true);
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiseosed_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			personList: [],
			movieList: [],
			professionList: [],
			personId: null,
			movieId: null,
			professionId: null,
			characterName: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};
 
//@desc page listing relations between people, films and professions
//@route GET /eestifilm/seosed
//@access public

const seosed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		//JOIN abil asendame id-d inimeste nimede, filmide pealkirjade ja ametitega
		const sqlReq = 'SELECT person.first_name, person.last_name, movie.title AS movie_title, movie.release_year, profession.title AS profession_title, person_in_movie.character_name FROM person_in_movie JOIN person ON person_in_movie.person_id = person.id JOIN movie ON person_in_movie.movie_id = movie.id JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY movie.title, profession.title, person.last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmiseosed', {relationList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed', {relationList: []});
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
	ametidAddPost,
	seosedAdd,
	seosedAddPost,
	seosed
};