Session.setDefault('sort-by', KnowGo.sortby.ECO);

function clearForm()
{
    $(':input').not(':button, :submit, :reset, :hidden, :checkbox, :radio').val('');
    $(':checkbox, :radio').prop('checked', false);
}

Template.setRoute.rendered = function () {
    toggleCircle("ecology");
    setAutoComplete();
    Meteor.startup(function (){
        setCurrentLoaction();
    });
    if(Session.get('from')){
        $('.from-location').val(Session.get('from').formatted_address);
    }
    if(Session.get('to')){
        $('.to-location').val(Session.get('to').formatted_address);
    }
};

Template.setRoute.events({
    'focus .from-location': function (jQueryEvent, BlazeTemplateInstance) {
        setAutoComplete();
        removeMissingInputError($(jQueryEvent.currentTarget));
    },
    'focus .to-location': function (jQueryEvent, BlazeTemplateInstance) { 
        setAutoComplete();
        removeMissingInputError($(jQueryEvent.currentTarget));
    },
    'click .clear-btn': function (jQueryEvent, BlazeTemplateInstance) {
    
        console.log('the clear button was clicked');
        clearForm();
        

    },
    'click .circle': circleClickHandler,
    'click .lang' : changeLanguage
});
