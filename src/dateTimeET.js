const dateFormattedET = function(monthType){
    let timeNow = new Date();

    const monthNamesET = [
        'jaanuar', 'veebruar', 'märts', 'aprill',
        'mai', 'juuni', 'juuli', 'august',
        'september', 'oktoober', 'november', 'detsember'
    ];

    const folkMonthNamesET = [
        'näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu',
        'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu',
        'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'
    ];

    let monthName = monthNamesET[timeNow.getMonth()];

    if(monthType === 1){
        monthName = folkMonthNamesET[timeNow.getMonth()];
    }

    return timeNow.getDate() + '. ' + monthName + ' ' + timeNow.getFullYear();
}

const addLeadZero = function(numValue){
	if(numValue < 10){
		//numValue = '0' + numValue;
		numValue = String(numValue).padStart(2, '0');
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	let timeFormatted = hourNow + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
	return timeFormatted;
}
const weekDayFormattedET = function(){
    let timeNow = new Date();
    const weekDayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
    return weekDayNamesET[timeNow.getDay()];
}

//ekspordin kõik vajaliku
module.exports = {
    fullDate: dateFormattedET,
    fullTime: timeFormattedET,
    weekDay: weekDayFormattedET
};