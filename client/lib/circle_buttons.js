toggleCircle = function(circleClass){
    //$('.circle').children().not($('span.' + circleClass)).removeClass('active');
    $('button.circle').not('button.circle #'+circleClass).removeClass('active btn-success');
    $('#' + circleClass).toggleClass('active btn-warning');

    // remove all category classes and add only relevant class
    //$('body').removeClass('ecology calories time money').addClass(circleClass);
    //$('h4').removeClass('ecology calories time money').addClass(circleClass);

    Session.set('sort-by', circleClass);
};

circleClickHandler = function (jQueryEvent, BlazeTemplateInstance) {
    var circleClass = $(jQueryEvent.target).attr('class');
    var imgClass = $(jQueryEvent.target).attr('class');
    var circleId = $(jQueryEvent.target).attr('id');
    console.log('the ' + circleId + ' circle button was clicked');
    // toggleCircle(circleClass);
    toggleCircle(circleId);
};