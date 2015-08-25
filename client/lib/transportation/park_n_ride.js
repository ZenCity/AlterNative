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
    console.log("results:");
    console.log(results);
    for (var i in ParkAndRideData) {
        var selectedStation = getStation(this.finalDestination, ParkAndRideData[i]);
        ParkAndRideData[i].selectedStation = selectedStation;
        ParkAndRideData[i].distanceFromOrigin = results[i].duration.value;
        ParkAndRideData[i].durationFromOrigin = results[i].duration.value / 60;
        ParkAndRideData[i].totalTime = selectedStation.calculatedTime + ParkAndRideData[i].durationFromOrigin;
        console.log("total time for parking i="+i+" is: "+ParkAndRideData[i].totalTime);
    }

    var selectedParking;

    for (var i in ParkAndRideData) {
        selectedParking =  ParkAndRideData.reduce(function(parkA, parkB, index, array){
            return  parkA.totalTime < parkB.totalTime ? parkA : parkB;
        });

    }

    console.log("time to parking: "+selectedParking.durationFromOrigin + " minutes");
    console.log("shai's calculated time (to stop + walking to dest): "+selectedParking.selectedStation.calculatedTime);

    
    console.log(selectedParking);
    
    var emissions = calculateParkNRideEmissions(selectedParking);
    var calories = calculateParkNRideCalories(selectedParking,this.finalDestination);


    var distances = Session.get('distances');
     


    distances[Alternative.transportTypes.PARKNRIDE] = {
        duration: selectedParking.totalTime,
        distance: 99999,
        name: Alternative.transportTypes.PARKNRIDE.toLocaleLowerCase(),
        type: Alternative.transportTypes.DRIVING,
        price: 15,
        emmissions: emissions, 
        calories: calories,
        park: selectedParking
    };

    Session.set('chosen',Alternative.transportTypes.PARKNRIDE);
    Session.set('distances', distances);
     
};

calculateParkNRideEmissions = function(selectedParking) {
    //Emissions calculated are the aggregate btwn origin + parking station (car) & parking -> stop (bus)
    selectedParking.shuttleDistance = calcDistance(selectedParking.lon,selectedParking.lat,selectedParking.selectedStation.geometry.coordinates[0],selectedParking.selectedStation.geometry.coordinates[1]);
    return ((selectedParking.distanceFromOrigin / 1000 * 271) + (selectedParking.shuttleDistance  * 101));
}

calculateParkNRideCalories = function(selectedParking, finalDestination) {
    var distance = calcDistance(finalDestination.K, finalDestination.G,selectedParking.selectedStation.geometry.coordinates[0],selectedParking.selectedStation.geometry.coordinates[1])
    //distance (in km) / 6 = distance walked in hours (since a person walks 6km/hr) * 60 (mins) * 4.4 (calories/mins) * 1.3 (add a growth factor for non-linear distance)
    return (distance / 6 * 60 * 4.4 * 1.3);
}

getStation = function( destination, parkNRideData ) {
    for(var i in parkNRideData.stations) {
        var station = parkNRideData.stations[i];
        var walkingDistance = calcDistance(destination.K, destination.G, station.geometry.coordinates[0], station.geometry.coordinates[1]);
        parkNRideData.stations[i].walkingDistance = walkingDistance;
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