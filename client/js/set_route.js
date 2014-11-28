Session.setDefault('sort-by', KnowGo.sortby.ECO);

Template.setRoute.rendered = function () {
    toggleCircle("ecology");
    setAutoComplete();
    setCurrentLoaction();
};

Template.setRoute.events({
    'focus .from-location': function () {
        setAutoComplete();
    },
    'focus .to-location': function () {
        setAutoComplete();
    },
    'click .know': function () {
        setDistanceMatric();
        if (Session.get('from') && Session.get('to')) {
            moveToView('know');
        }
        else {
            // TODO: hanlde error
        }
    },
    'click .circle': circleClickHandler
});
