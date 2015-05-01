Template.results.rendered = function() {
    $('.background-image').addClass('blurred');
    setDistanceMatric();
    Meteor.defer(function () {
        toggleCircle(Session.get('sort-by'));
        setTimeout(function () {
            toggleResult(Session.get('sort-by'));}, 225);
    });
};

Template.results.helpers({
    routes: function () {
        if(!Session.get('distances')){
            return [];
        }
        try {
            var sorter = getSorter(Session.get('sort-by'));
            var distances = Session.get('distances');
            var rides = Object.keys(distances).map(function (type, i) {
                var ride = distances[type];
                ride.duration = Number(ride.duration.toFixed(0));
                ride.emmissions = Number(ride.emmissions.toFixed(0));
                ride.calories = Number(ride.calories.toFixed(0));
                ride.type = type;
                return ride;
            })
                .sort(sorter);
            return rides;
        }
        catch(error){
            console.log(error);
        }
    },
    fromAddressPretty: function () {
        var address = Session.get("from-address-pretty");
        var prefix =  Session.get("from-address-pretty-prefix");
        Session.set("from-address-pretty-prefix","");
        return (prefix? prefix+address : address);
    },
    toAddressPretty: function () {
        var address = Session.get("to-address-pretty");
        var prefix =  Session.get("to-address-pretty-prefix");
        Session.set("to-address-pretty-prefix","");
        return (prefix? prefix+address : address);
    }
});

Template.results.events({
    'click .circle': circleClickHandler,
    'click  div.go-btn': function (jQueryEvent, BlazeTemplateInstance){
        var type = $(jQueryEvent.target).closest('.result')[0].classList[1];
        var chosen = Session.get('distances')[type];
        Session.set('chosen', chosen);
    },
    'click .bottom-back-btn': function (jQueryEvent, BlazeTemplateInstance) {
        Session.set('prevent-auto-locate','prevent');
    }
});

