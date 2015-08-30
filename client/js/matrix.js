//var TELOFUN = 'TELOFUN';

setDistanceMatric = cities[defaultCity]["setDistanceMatric"];

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
    var bike = Session.get('distances')[Alternative.transportTypes.TELOFUN] || {
            name: Alternative.transportTypes.TELOFUN.toLocaleLowerCase(),
            duration: 0,
            type: Alternative.transportTypes.TELOFUN,
            price: 0.76,
            emmissions: 0,
            calories: 0
        };
    bike.duration += time / 60 / 3;
    bike.calories += 9.45 * time / 60 / 3;
    distances[TELOFUN] = bike;
    Session.set('distances', distances);
};

telOfunWalkCallback = function (response, status) {

    var distances = Session.get('distances');
    var time = response.rows[0].elements[0].duration.value;
    var price = _calcTelOfunPrice(time);

    var bike = distances[Alternative.transportTypes.TELOFUN] || {
            duration: 0,
            name: Alternative.transportTypes.TELOFUN.toLocaleLowerCase(),
            type: Alternative.transportTypes.TELOFUN,
            price: price,
            emmissions: 0,
            calories: 0
        };
    bike.duration += time / 60;
    bike.calories += walkingCalories(time);
    distances[Alternative.transportTypes.TELOFUN] = bike;
    Session.set('distances', distances);
};

_calcTelOfunPrice = function(rideTime) {
    var price=17;
    var now = new Date();
    if ((now.getDay()==6&&now.getHours()<19) || (now.getDay()==5&&now.getHours()>=14)) {
        price = 23
    }
    if (rideTime/60>30)
        price+=6;
    return price;
}
