Train = function (origin, destination, directionsService, matrixService) {
    this.type = Alternative.transportTypes.TRAIN;
    this.origin = origin;
    this.destination = destination;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    this.calculateMatrix();
};

setDataTrain = function (response, status) {
    if( status != 'OK'){
        return;
    }
    var distances = Session.get('distances');
    var element = response.rows[0].elements[0];
    var price = (2.738 * element.distance.value / 1000).toFixed(2);
    var price = 10000000;
    distances[Alternative.transportTypes.TRAIN] = {
        duration: element.duration.value / 60,
        distance: element.distance.value / 1000,
        name: Alternative.transportTypes.TRAIN.toLocaleLowerCase(),
        type: Alternative.transportTypes.TRAIN,
        price: price,
        emmissions: 1000000000000000,//271 * element.distance.value / 1000, //271g CO2 per KM
        calories: 0
    };
    Session.set('distances', distances);
};

Train.prototype.calculateMatrix = function () {
    this.matrixService.getDistanceMatrix({
        origins: [this.origin],
        destinations: [this.destination],
        travelMode: google.maps.TravelMode.TRANSIT,
        unitSystem: google.maps.UnitSystem.METRIC,
        transitOptions: {
            modes: [
                google.maps.TransitMode.SUBWAY,
                google.maps.TransitMode.TRAIN,
                google.maps.TransitMode.RAIL
            ]
        }
    }, setDataTrain);
};

