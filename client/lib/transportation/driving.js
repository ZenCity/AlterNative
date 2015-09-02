Driving = function (origin, destination, directionsService, matrixService) {
    this.type = Alternative.transportTypes.DRIVING;
    this.origin = origin;
    this.destination = destination;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    this.calculateMatrix();
};

Driving.prototype.calculateMatrix = function () {
    this.matrixService.getDistanceMatrix({
        origins: [this.origin],
        destinations: [this.destination],
        travelMode: this.type,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, setDataDriving);
};

setDataDriving = function (response, status) {
    if( status != 'OK'){
        return;
    }
    var distances = Session.get('distances');
    var element = response.rows[0].elements[0];
    var price = Math.ceil((2.738 * element.distance.value / 1000).toFixed(2));

    distances[Alternative.transportTypes.DRIVING] = {
        duration: getDrivingTime(element.duration.value),
        distance: element.distance.value / 1000,
        name: Alternative.transportTypes.DRIVING.toLocaleLowerCase(),
        type: Alternative.transportTypes.DRIVING,
        price: price,
        emmissions: 271 * element.distance.value / 1000, //271g CO2 per KM
        calories: 0
    };
    Session.set('distances', distances);
};



