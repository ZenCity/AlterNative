toggleCircle = function(chosen){
    $('button.circle').not('button.circle #'+chosen).not('.circle-main').removeClass('active').addClass('deactivate');
    $('#' + chosen).not('.circle-main').toggleClass('active').removeClass('deactivate');
    Session.set('sort-by', chosen);

};


circleClickHandler = function (jQueryEvent, BlazeTemplateInstance) {
    var circleId = $(jQueryEvent.target).attr('id');
    console.log('the ' + circleId + ' circle button was clicked');
    toggleCircle(circleId);
    if(!Session.get('from')){
        missingInput($('.from-location'));
    }
    if(!Session.get('to')){
        missingInput($('.to-location'));
    }
};

missingInput = function(element){
    element.addClass('error');
    element.parent().addClass('error');
}

removeMissingInputError = function(element){
    element.removeClass('error');
    element.parent().removeClass('error');
}