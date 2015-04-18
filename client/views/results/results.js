Template.results.rendered = function() {
    setDistanceMatric();
    toggleCircle(Session.get('sort-by'));
    toggleResult(Session.get('sort-by'));
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
        return Session.get("from-address-pretty");
    },
    toAddressPretty: function () {
        return Session.get("to-address-pretty");
    },
    idoGetLang: function () { //TODO: Shai - remove this 
        return TAPi18n.getLanguage();
    }
});

Template.results.events({
    'click .circle': circleClickHandler,
    'click  div.go-btn': function (jQueryEvent, BlazeTemplateInstance){
        var type = $(jQueryEvent.target).closest('.result')[0].classList[1];
        var chosen = Session.get('distances')[type];
        Session.set('chosen', chosen);
    }
});

