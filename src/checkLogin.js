exports.isLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log('Sisseloginud kasutaja :' + req.session.userId);
			next();
		} else {
			console.log('Pole sisseloginud, pole sissioonimuutujat!');
			return res.redirect('/signin');
		}
	} else {
		console.log('Sessiooni pole!');
		return res.redirect('/signin');
	}
}