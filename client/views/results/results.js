Template.results.rendered = function() {
    $('.background-image').addClass('blurred');
    setDistanceMatric();
    Meteor.defer(function () {
        toggleCircle(Session.get('sort-by'));
        setTimeout(function () {
            toggleResult(Session.get('sort-by'));}, 240);
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
            var filteredDistances = filterDistanceMatrix(distances);
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
    },
    price: function () {
        if ((this.type==Alternative.transportTypes.TAXI) || (this.type==Alternative.transportTypes.DRIVING)) {
            return ("~"+this.price);
        }
        else {
            return this.price;
        }

    },
    duration: function () {
        if (this.type==Alternative.transportTypes.PARKNRIDE) {
            return ("~"+this.duration);
        }
        else return this.duration;
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


//filter crazy / irrelevant results --> when their duration is larger than average duration + standard deviation
var filterDistanceMatrix = function(distances) {
    var keys = Object.keys(distances);
    var maximumDistance = standardDeviationPlusAverage(distances, 'distance');
    var maximumDuration = average(distances, 'duration');
    console.log("Maximum allowed duration: " + maximumDuration);
    console.log("Maximum allowed distance: " + maximumDistance)
    for (var i = 0; i < keys.length; i++) {
        console.log("Duration of " + keys[i] + ": " + distances[keys[i]].duration + " minutes");
        var transportMethod = distances[keys[i]]
        if (transportMethod.duration > (2 * maximumDuration) || transportMethod > maximumDistance) {
            console.log("Found a bad one - remove! " + distances[keys[i]].name);
            console.log("it's duration is: " + transportMethod.duration);
            console.log("it's distance is: " + transportMethod.distance);
            console.log(distances[keys[i]]);
            delete distances[keys[i]];
        }
    }
    return distances;
};
