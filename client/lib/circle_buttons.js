toggleCircle = function(chosen){
    //$('.circle').children().not($('span.' + circleClass)).removeClass('active');
    $('button.circle').not('button.circle #'+chosen).not('.circle-main').removeClass('active').addClass('deactivate');
    $('#' + chosen).not('.circle-main').toggleClass('active').removeClass('deactivate');

    // remove all category classes and add only relevant class
    //$('body').removeClass('ecology calories time money').addClass(circleClass);
    //$('h4').removeClass('ecology calories time money').addClass(circleClass);

    Session.set('sort-by', chosen);
};

circleClickHandler = function (jQueryEvent, BlazeTemplateInstance) {
    var circleClass = $(jQueryEvent.target).attr('class');
    var imgClass = $(jQueryEvent.target).attr('class');
    var circleId = $(jQueryEvent.target).attr('id');
    console.log('the ' + circleId + ' circle button was clicked');
    // toggleCircle(circleClass);
    toggleCircle(circleId);
};
