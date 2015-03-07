/*
use `changeLanguage(lang)` to change language to "lang".
use `changeLanguage()` to change to the next language.
 */


Session.set('language', navigator.language.split('-')[0]);
var languages = ['en', 'he'];
changeLanguage = function (lng) {
    if(lng) {
        Session.set('language', lng);
        TAPi18n.setLanguage(lng);
    }
    else{
        var currentLang = Session.get('language');
        var newLang = languages[(languages.indexOf(currentLang) + 1) % languages.length];
        Session.set('language', newLang);
        TAPi18n.setLanguage(newLang);
    }
}