var TELOFUN = 'TELOFUN';

var directionsDisplay;
var initializeMap = function () {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var telAviv = new google.maps.LatLng(32.054934, 34.775407);
    var mapOptions = {
        zoom:14,
        center: telAviv
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    directionsDisplay.setMap(map);
};

var calcRoute = function () {
    var directionsService = new google.maps.DirectionsService();
    var end = new google.maps.LatLng(Session.get('to').lat, Session.get('to').lng);
    var start = new google.maps.LatLng(Session.get('from').lat, Session.get('from').lng);

    var request = {
        origin: start,
        destination: end,
        travelMode: Session.get('chosen').type
    };

    if(Session.get('chosen').type == Alternative.transportTypes.TRAIN){
        request.travelMode = google.maps.TravelMode.TRANSIT;
        request.transitOptions = {
            modes: [
                google.maps.TransitMode.SUBWAY,
                google.maps.TransitMode.TRAIN,
                google.maps.TransitMode.RAIL
            ]
        };
    }
    if(Session.get('chosen').type == Alternative.transportTypes.TELOFUN){
        request.travelMode = google.maps.TravelMode.WALKING;
        var telOfunStart = new google.maps.LatLng(Session.get('tel-o-fun-start').lat, Session.get('tel-o-fun-start').lng);
        var telOfunEnd = new google.maps.LatLng(Session.get('tel-o-fun-end').lat, Session.get('tel-o-fun-end').lng);
        var waypoints = [telOfunStart, telOfunEnd];
        waypoints = waypoints.map(function(place){
            return {
                stopover: false,
                location: place
            };
        });
        request.waypoints = waypoints;
    }
    directionsService.route(request, function(result, status) {
        var leg = result.routes[0].legs[0];
        var distance = leg.distance.value;
        var duration = leg.duration.value / 60; // in minutes
        var route = leg.steps.map(function(step){
            return {
                lat: step.start_point.lat(),
                lng: step.start_point.lng()
            }
        });
        var navRecord = {
            date: new Date,
            to: Session.get('to'),
            from: Session.get('from'),
            distance: distance,
            duration: duration,
            transType: Session.get('chosen').name,
            route: route,
            searchId: Session.get('search-id'),
            searchCraitiria: Session.get('sort-by')
        };
        Navigations.insert(navRecord);
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
};

Template.map.rendered = function () {
    initializeMap();
    calcRoute();
};

