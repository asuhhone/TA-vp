const fs = require('fs').promises;
const dateET = require('../src/dateTimeET');

const regTextRef = 'public/txt/visits.txt';

//@desc home page for visits, shows the last visit
//@route GET /kylastused
//@access public

const visitsHome = async (req, res) => {
	try {
		const data = await fs.readFile(regTextRef, 'utf8');
		//igal kirjel on lõpus ";", seega listi viimane element on tühi
		//ja viimane külastus on eelviimane element
		const visits = data.split(';');
		if(visits.length < 2){
			return res.render('kylastused', {hasVisit: false, name: '', date: '', time: ''});
		}
		const lastVisit = visits[visits.length - 2].split(',');
		res.render('kylastused', {hasVisit: true, name: lastVisit[0], date: lastVisit[1], time: lastVisit[2]});
	}
	catch (err){
		//kui faili pole veel olemas, pole ka külastusi
		console.log(err);
		res.render('kylastused', {hasVisit: false, name: '', date: '', time: ''});
	}
};

//@desc page for registering a visit
//@route GET /kylastused/regvisit
//@access public

const regVisit = (req, res) => {
	res.render('regvisit');
};

//@desc page for registering a visit
//@route POST /kylastused/regvisit
//@access public

const regVisitPost = async (req, res) => {
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
};

module.exports = {
	visitsHome,
	regVisit,
	regVisitPost
};