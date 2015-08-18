ParkNRide = function (origin, destination, directionsService, matrixService) {

    var destinations = ParkAndRideData.map(function(parkAndRide){
        return {lat: parkAndRide.lat, lng: parkAndRide.lon};
    });

    this.type = google.maps.TravelMode.DRIVING;
    this.origin = origin;
    this.finalDestination = destination; //remember final destination
    this.destinations = destinations;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    this.calculateMatrix();
};

ParkNRide.prototype.calculateMatrix = function () {
    var self = this;
    this.matrixService.getDistanceMatrix({
        origins: [this.origin],
        destinations: this.destinations,
        travelMode: this.type,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, function(response, status){
        self.setDataParkNRide(response, status);
    });
};


ParkNRide.prototype.setDataParkNRide = function (response, status) {

    if( status != 'OK'){
        return;
    }

    var results = response.rows[0].elements;
    for (var i in ParkAndRideData) {
        var selectedStation = getStation(this.finalDestination, ParkAndRideData[i]);
        ParkAndRideData[i].selectedStation = selectedStation;
        ParkAndRideData[i].totalTime = selectedStation.calculatedTime + results[i].duration.value / 60;
    }

    for (var i in ParkAndRideData) {
        var selectedParking =  ParkAndRideData.reduce(function(parkA, parkB, index, array){
            return  parkA.totalTime < parkB.totalTime ? parkA : parkB;
        });

    }

    
    console.log(selectedParking);

    var distances = Session.get('distances');
     


    distances[Alternative.transportTypes.PARKNRIDE] = {
        duration: selectedParking.totalTime,
        distance: 99999,
        name: Alternative.transportTypes.PARKNRIDE.toLocaleLowerCase(),
        type: Alternative.transportTypes.DRIVING,
        price: 15,
        emmissions: 77777, //271g CO2 per KM
        calories: 88888
    };
    
    Session.set('distances', distances);
     
};

getStation = function( destination, parkNRideData ) {
    for(var i in parkNRideData.stations) {
        var station = parkNRideData.stations[i];
        var walkingDistance = calcDistance(destination.K, destination.G, station.geometry.coordinates[0], station.geometry.coordinates[1]);
        var walkingTime = walkingDistance * 20;
        parkNRideData.stations[i].calculatedTime = station.properties.minutes/60 + walkingTime; //TODO FIX: the minutes in the park n ride data appear to be FAKE!
    }
    var stationsArray = parkNRideData.stations;
    //console.log(stationsArray);
    var bestStation = stationsArray.reduce(function(stationA, stationB, index, array){
       return  stationA.calculatedTime < stationB.calculatedTime ? stationA : stationB;
    });
    //console.log("got best station:");
    //console.log(bestStation);
    return bestStation;
};