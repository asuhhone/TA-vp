const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
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
app.listen(5123);