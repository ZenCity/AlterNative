var TELOFUN = 'TELOFUN';

setDistanceMatric = cities[defaultCity]["setDistanceMatric"]

setDistanceTransit = function (callback) {
    var origin = new google.maps.LatLng(
        Session.get('from').lat,
        Session.get('from').lng
    );
    var destination = new google.maps.LatLng(
        Session.get('to').lat,
        Session.get('to').lng
    );
    directionsService = new google.maps.DirectionsService();
    var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT
    };
    directionsService.route(request, callback);
};

setDistanceCar = function (callback) {
    setDistanceByType(google.maps.TravelMode.DRIVING, callback, null, null);
};

setDistanceTaxi = function (callback) {
    setDistanceByType(google.maps.TravelMode.DRIVING, callback, null, null);
};

setDistanceWalking = function (callback) {
    setDistanceByType(google.maps.TravelMode.WALKING, callback, null, null);
};

setDistancePersonalBike = function (callback) {
    setDistanceByType(google.maps.TravelMode.WALKING, callback, null, null);
};

setDistanceByType = function (type, callback, _origin, _destination) {
    if (!_origin) { var origin = new google.maps.LatLng(
            Session.get('from').lat,
            Session.get('from').lng
        );
    }
    else{
        var origin = _origin;
    }
    if (!_destination) {
        var destination = new google.maps.LatLng(
            Session.get('to').lat,
            Session.get('to').lng
        );
    }
    else{
        var destination = _destination;
    }
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: type,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, callback);
};

setTelOfunRoute = function () {
    var start = Session.get('from');
    var end = Session.get('to');
    var telOfunStart = getNearestStation(start.lng, start.lat);
    var telOfunEnd = getNearestStation(end.lng, end.lat);
    Session.set('tel-o-fun-start', telOfunStart);
    Session.set('tel-o-fun-end', telOfunEnd);

    setDistanceByType(
        google.maps.TravelMode.WALKING,
        function(response, status) {
            telOfunWalkCallback(response, status);
        },
        new google.maps.LatLng(start.lat, start.lng),
        new google.maps.LatLng(telOfunStart.lat, telOfunStart.lng)
    );
    setDistanceByType(
        Alternative.transportTypes.WALKING,
        function(response, status) {
            telOfunWalkCallback(response, status);
        },new google.maps.LatLng(telOfunEnd.lat, telOfunEnd.lng),
        new google.maps.LatLng(end.lat, end.lng)
    );
    setDistanceByType(
        Alternative.transportTypes.WALKING,
        function(response, status) {
            telOfunBikeCallback(response, status);
        },
        new google.maps.LatLng(telOfunStart.lat, telOfunStart.lng),
        new google.maps.LatLng(telOfunEnd.lat, telOfunEnd.lng)
    );
};

telOfunBikeCallback = function (response, status) {
    var distances = Session.get('distances');
    var time = response.rows[0].elements[0].duration.value;
    var bike = Session.get('distances')[TELOFUN] || {
            name: 'tel-o-fun',
            duration: 0,
            type: TELOFUN,
            price: 0.76,
            emmissions: 0,
            calories: 0
        };
    bike.duration += time / 60 / 4;
    bike.calories += 7 * time;
    distances[TELOFUN] = bike;
    Session.set('distances', distances);
};

telOfunWalkCallback = function (response, status) {
    var distances = Session.get('distances');
    var time = response.rows[0].elements[0].duration.value;
    var bike = distances[TELOFUN] || {
            duration: 0,
            name: 'tel-o-fun',
            type: TELOFUN,
            price: 0.76,
            emmissions: 0,
            calories: 0
        };
    bike.duration += time / 60;
    bike.calories += 12.5 * time;
    distances[TELOFUN] = bike;
    Session.set('distances', distances);
};
