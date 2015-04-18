Session.setDefault('sort-by', KnowGo.sortby.ECO);

function clearFromBox() {
    $('input[type=search].from-location').val('');
    Session.set('from',"");
};

function clearToBox() {
    $('input[type=search].to-location').val('');
    Session.set('to',"");
};

function reverseForm()
{
    var toVal = $('input[type=search].to-location').val();
    var fromVal = $('input[type=search].from-location').val();
    console.log("to:"+toVal);
    console.log("from:"+fromVal);
    var from = Session.get('from');
    var to = Session.get('to');
    $('input[type=search].to-location').val(fromVal);
    $('input[type=search].from-location').val(toVal);
    //reverse to/from in the session as well - first clear then re-set:
    Session.set('to',from);
    Session.set('from',to);    
};

Template.search.rendered = function () {
    toggleCircle("ecology");
    setAutoComplete();
    setCurrentLoaction($('.from-location'));
    if(Session.get('from')){
        $('.from-location').val(Session.get('from').formatted_address);
    }
    if(Session.get('to')){
        $('.to-location').val(Session.get('to').formatted_address);
    }
};

Template.search.events({
    'focus .from-location': function (jQueryEvent, BlazeTemplateInstance) {
        setAutoComplete();
        removeMissingInputError($(jQueryEvent.currentTarget));
    },
    'focus .to-location': function (jQueryEvent, BlazeTemplateInstance) { 
        setAutoComplete();
        removeMissingInputError($(jQueryEvent.currentTarget));
    },
    'click .reverse-btn': function (jQueryEvent, BlazeTemplateInstance) {
        reverseForm();
    },
    'click .glyphicon-from': function (jQueryEvent, BlazeTemplateInstance) {
        clearFromBox();
    },
    'click .glyphicon-to': function (jQueryEvent, BlazeTemplateInstance) {
        clearToBox();
    },
    'click .circle': function(jQueryEvent, BlazeTemplateInstance) {
        if(!Session.get('from')){
            missingInput($('.from-location'));
        }
        else if(!Session.get('to')){
            missingInput($('.to-location'));
        }
        else {
            circleClickHandler( jQueryEvent, BlazeTemplateInstance );
        }
    },
    'click .lang' : changeLanguage
});
