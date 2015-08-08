Driving = function (origin, destination, directionsService, matrixService) {
    this.type = Alternative.transportTypes.DRIVING;
    this.origin = origin;
    this.destination = destination;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    this.calculateMatrix();
};

setDataDriving = function (response, status) {
    if( status != 'OK'){
        return;
    }

    var distances = Session.get('distances');
    var element = response.rows[0].elements[0];
    var price = (2.738 * element.distance.value / 1000).toFixed(2);

    distances[google.maps.TravelMode.DRIVING] = {
        duration: element.duration.value / 60,
        distance: element.distance.value / 1000,
        name: google.maps.TravelMode.DRIVING.toLocaleLowerCase(),
        type: google.maps.TravelMode.DRIVING,
        price: price,
        emmissions: 271 * element.distance.value / 1000, //271g CO2 per KM
        calories: 0
    };
    Session.set('distances', distances);
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

