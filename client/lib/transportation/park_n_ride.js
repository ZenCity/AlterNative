ParkNRide = function (origin, destination, directionsService, matrixService) {

    Session.set('result-count',0);

    Tracker.autorun(this.handleResults);

    //getShuttleDistances (ParkAndRideData, directionsService, matrixService);
    
    this.shuttleDestinations = ParkAndRideData.map(function(parkAndRide){
        return {lat: parkAndRide.lat, lng: parkAndRide.lon, type: parkAndRide.type};
    });

    this.busDestinations = FreeParkingLotsWithBus.map(function(busParking){
        return {lat: busParking.lat, lng: busParking.lon, type:busParking.type};
    });
    
    var destinations =  this.shuttleDestinations.concat(this.busDestinations);  

    this.type = google.maps.TravelMode.DRIVING;
    this.origin = origin;
    this.finalDestination = destination; 
    this.destinations = destinations;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    
    if (this.destinationIsParkNRide(destination)) {
        console.log("going to park n'w ride lot!!!");
    }
    else {
        //console.log("user will be routed to a bus/shuttle Park N' Ride parking lot");
        this.calculateMatrixes();
    }
};

ParkNRide.prototype.handleResults = function () {
      var count = Session.get('result-count');
      console.log("Reactively running for the "+count+"th time!");  

      if (count==2) {
        console.log("Got enough results. Can run the Park N'Ride algorithm:");
        console.log(Session.get("driving-to-parking-response"));
        console.log(Session.get("bus-response"));
        var parkingResponse = Session.get("driving-to-parking-response");
        var busResponse = Session.get("bus-response");

        var originToParkResults = parkingResponse.rows[0].elements;
        var busRideResults = busResponse.rows;

        console.log("originToParkResults:");
        console.log(originToParkResults);
        console.log("busRideResults:");
        console.log(busRideResults);

        //first, set time to the bus results
        var index = ParkAndRideData.length;
        for (var i in FreeParkingLotsWithBus) {
  
            var busIndex = (parseInt(i)+index); //iterate only on the parking+bus data indices
            
            //console.log(parkingResponse.rows[0].elements[busIndex].duration.value/60);
            if (busRideResults[i].elements[0].status!="OK") {
                //on error - simply make the parking lot an irrelevant result
                FreeParkingLotsWithBus[i].totalTime = 99999;
            }
            else {
                FreeParkingLotsWithBus[i].totalTime = busRideResults[i].elements[0].duration.value/60 +originToParkResults[busIndex].duration.value/60;
            }
        }

        var minimumShuttle = ParkAndRideData.reduce(function(parkA, parkB, index, array){
                return  parkA.totalTime < parkB.totalTime ? parkA : parkB;
            });

        var minimumBus = FreeParkingLotsWithBus.reduce(function(parkA, parkB, index, array){
                return  parkA.totalTime < parkB.totalTime ? parkA : parkB;
            });

        for (var i in ParkAndRideData) {
            console.log("Parking lot: "+ ParkAndRideData[i].name+ " , total Time:"+ParkAndRideData[i].totalTime);
        }

        for (var i in ParkAndRideData) {
            console.log("Parking lot: "+ FreeParkingLotsWithBus[i].name+ " , total Time:"+FreeParkingLotsWithBus[i].totalTime);
        }


        var selectedParking = minimumShuttle.totalTime < minimumBus.totalTime ? minimumShuttle : minimumBus;

        console.log(selectedParking);      

      }
};




ParkNRide.prototype.calculateMatrixes = function () {
    var self = this;

    //calcaulate teims between origin to all parking lots (with / without shuttles)
    this.matrixService.getDistanceMatrix({
        origins: [this.origin],
        destinations: this.destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, function(response, status){
        self.setDataParkNRide(response, status);
    });

    //calcaulate times from "free" parking lots with buses to destination
    this.matrixService.getDistanceMatrix({
        origins: this.busDestinations,
        destinations: [this.finalDestination],
        travelMode: google.maps.TravelMode.TRANSIT,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, function(response, status){
        self.setBusParkingData(response, status);
    });

};

ParkNRide.prototype.setBusParkingData = function(response, status) {
    if( status != 'OK'){
        console.log("Warning: Got a "+status+" status when getting Parking lot + bus results from Matrix API");
    }
    else {
        Session.set("bus-response",response);
    }
    
    var count = Session.get('result-count');
    Session.set('result-count',count+1);
}

/* Calculate if destination is "very close" (<550m) from a ParkNRide parking lot */
ParkNRide.prototype.destinationIsParkNRide = function(destination) {
    //console.log("DATA:");
    //console.log(ParkAndRideData);
    for (var i in ParkAndRideData) {
        var distance = calcDistance(destination.G, destination.K,ParkAndRideData[i].lat,ParkAndRideData[i].lon);
        //console.log("distance to: "+ParkAndRideData[i].name+" is:"+distance);
        if (distance < 0.55) {
            return true;
        }
    }
    return false;
}


ParkNRide.prototype.setDataParkNRide = function (response, status) {

    if( status != 'OK'){
        console.log("Warning: Got a "+status+" status when getting Parking lot + bus results from Matrix API");
    }
    else {
        Session.set("driving-to-parking-response",response);
    }

    
    var results = response.rows[0].elements;
    for (var i in ParkAndRideData) {

        //select the relevant shuttle station (closest to destination) for every park 
        ParkAndRideData[i].selectedStation = getStation(this.finalDestination, ParkAndRideData[i]);
        ParkAndRideData[i].distanceFromOrigin = results[i].duration.value;
        ParkAndRideData[i].durationFromOrigin = results[i].duration.value / 60;
        ParkAndRideData[i].totalTime = ParkAndRideData[i].selectedStation.calculatedTime + ParkAndRideData[i].durationFromOrigin;
        addWaitTime(ParkAndRideData[i]);

        console.log("time calculations for "+ParkAndRideData[i].name);
        console.log("calculated time is: "+selectedStation.calculatedTime);
        console.log("duration from origin is: "+ParkAndRideData[i].durationFromOrigin);
        //console.log("total time for parking i="+i+" is: "+ParkAndRideData[i].totalTime);
         console.log("total time is: "+ParkAndRideData[i].totalTime);
    }


    /*


    for (var i in ParkAndRideData) {
        selectedParking =  ParkAndRideData.reduce(function(parkA, parkB, index, array){
            return  parkA.totalTime < parkB.totalTime ? parkA : parkB;
        });

    }

   

    addWaitTime(selectedParking);


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
    */

    var count = Session.get('result-count');
    Session.set('result-count',count+1);
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
        var walkingTime = walkingDistance * 10;
        var sumTime = 0;
        for (var j = 0; j<=i; j++){
            if (parkNRideData.stations[j].properties.ms_kav==parkNRideData.stations[i].properties.ms_kav){
                sumTime+=parkNRideData.stations[j].properties.newMinutes;
                //console.log(parkNRideData.stations[j].properties.newMinutes);
            }
        }
        //console.log(sumTime);

        parkNRideData.stations[i].calculatedTime = sumTime+walkingTime;


        //station.properties.minutes/60 + walkingTime; //TODO FIX: the minutes in the park n ride data appear to be FAKE!
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

addWaitTime = function(selectedParking) {
    if (!selectedParking.totalTime) {
        console.log("Selected Parking Space has no total time!");
        return;
    }
    var now = new Date();

    //calculate now time + added time to get to the destination
    var minutesAtPark = now.getMinutes()+ selectedParking.durationFromOrigin;
    var hoursAtPark = now.getHours();
    if (minutesAtPark>60) {
        
        //add an amount of hours equal to the new minutes 
        var addedHours = Math.floor(minutesAtPark/60);
        hoursAtPark+= addedHours;
        minutesAtPark -= addedHours*60;
    }
    
    var shuttleWaitTime = 0;

    if ((hoursAtPark > 9 && minutesAtPark >= 30) && (hoursAtPark <= 15 && minutesAtPark < 30)) {
        //non peak time
        selectedParking.totalTime += 7.5;
    }
    else {
        selectedParking.totalTime += 2.5;
    }
    

}

//interal stuff - code written to help us retrieve shuttle maslulim's real timings
//TODO: remove this

getShuttleDistances = function (parkNRideData, directionsService, matrixService) {
    for (var i in parkNRideData) {
        i++;
        console.log (i);
        var j=0;
        for (j=0; j<parkNRideData[i].stations.length; j++){
            if (j==0){
                parkNRideData[i].stations[0].newMinutes=0;
                console.log( parkNRideData[i].stations[0]);
                continue;
            }
            // else if (parkNRideData[i].stations[j].newMinutes!=undefined)
            //     continue;
            else{
            directionsService.route({
                        origin: new google.maps.LatLng(parkNRideData[i].stations[j-1].geometry.coordinates[1], parkNRideData[i].stations[j-1].geometry.coordinates[0]),
                        destination: new google.maps.LatLng(parkNRideData[i].stations[j].geometry.coordinates[1], parkNRideData[i].stations[j].geometry.coordinates[0]),
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        durationInTraffic: false,
                        avoidHighways: false,
                        avoidTolls: false
                        }, 
                        function (response, status) {
                            if (status === google.maps.DirectionsStatus.OK) {
                                console.log(response);
                              //directionsDisplay.setDirections(response);
                              var time = response.routes[0].legs[0].duration.value/60;
                              var station = findStationByTo(ParkAndRideData[0].stations, response.request.destination);
                              console.log("newMinutes: "+time);
                              console.log("mikum: "+station.properties.mikum);
                              console.log("oid_shuttle: "+station.properties.oid_shuttl);
                              console.log("Ms_tahana: "+station.properties.ms_tahana);
                              console.log("Ms_kav: "+station.properties.ms_kav);

                              

                            } else {
                              window.alert('Directions request failed due to ' + status);
                            }
                          }
                        );
                }
            }
        break;

    }
    
    //console.log(parkNRideData);
}

findStationByTo = function (parkNRideDataStations, To){
    // console.log(To);
    // console.log(parkNRideDataStations);
    for (var i in parkNRideDataStations)
        if (To.G.toFixed(5) == parkNRideDataStations[i].geometry.coordinates[1].toFixed(5) && To.K.toFixed(5) == parkNRideDataStations[i].geometry.coordinates[0].toFixed(5))
            return parkNRideDataStations[i];

    console.log("got no station biatch");
}