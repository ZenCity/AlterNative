Template.results.rendered = function() {
    setDistanceMatric();
    toggleCircle(Session.get('sort-by'));
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
    }
});

Template.results.events({
    'click .circle': circleClickHandler,
    'click .go-btn': function (jQueryEvent, BlazeTemplateInstance){
        var type = $(jQueryEvent.target).parents('.result')[0].classList[1];
        var choosen = Session.get('distances')[type];
        Session.set('choosen', choosen);
    }
});

