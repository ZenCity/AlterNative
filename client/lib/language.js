/*
use `changeLanguage(lang)` to change language to "lang".
use `changeLanguage()` to change to the next language.
 */


Session.set('language', navigator.language.split('-')[0]);
var languages = ['en', 'he'];
changeLanguage = function (lng) {

    console.log('changing language from:'+TAPi18n.getLanguage());  
    var currentLang = TAPi18n.getLanguage();

    if (!currentLang) {
        TAPi18n.setLanguage(languages[0]);
    }
    else {
        var newLang = languages[(languages.indexOf(currentLang) + 1) % languages.length];
        TAPi18n.setLanguage(newLang);
    }
}