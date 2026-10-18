const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
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
 
//Külastuste marsruudid
const visitRouter = require('./routes/visitRoutes');
app.use('/kylastused', visitRouter);
 
//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);
 
app.get('/minust', (req, res)=>{
	res.render('minust');
});
app.listen(5123);