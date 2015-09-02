ParkNRide = function(origin, destination, directionsService, matrixService) {

    Session.set('result-count', 0);

    Tracker.autorun(this.handleResults);

    //getShuttleDistances (ParkAndRideData, directionsService, matrixService);

    this.shuttleDestinations = ParkAndRideData.map(function(parkAndRide) {
        return {
            lat: parkAndRide.lat,
            lng: parkAndRide.lon,
            type: parkAndRide.type
        };
    });

    this.busDestinations = FreeParkingLotsWithBus.map(function(busParking) {
        return {
            lat: busParking.lat,
            lng: busParking.lon,
            type: busParking.type
        };
    });

    var destinations = this.shuttleDestinations.concat(this.busDestinations);

    this.type = google.maps.TravelMode.DRIVING;
    this.origin = origin;
    this.finalDestination = destination;
    this.destinations = destinations;
    this.directionsService = directionsService;
    this.matrixService = matrixService;

    var destinationPark = this.destinationIsParkNRide(destination);

    if (destinationPark) {
        console.log("going to park n' ride lot!!!");
        destinationPark.selectedStation = getBackStation(this.origin, destinationPark);

        console.log(destinationPark);


        var distances = Session.get("distances");

        distances[Alternative.transportTypes.PARKANDRIDEBACK] = {
            duration: destinationPark.selectedStation.sumTime + destinationPark.selectedStation.walkingTime,
            name: Alternative.transportTypes.PARKANDRIDEBACK.toLocaleLowerCase(),
            type: Alternative.transportTypes.DRIVING,
            price: 0,
            emmissions: destinationPark.selectedStation.calculatedDistance * 101,
            calories: destinationPark.selectedStation.walkingDistance * 4.4,
            park: destinationPark,
            park_type: destinationPark.type, //'shuttle' or 'bus'
            line_number: destinationPark.selectedStation.properties.ms_kav,
            station_id: destinationPark.selectedStation.properties.ms_tahana
        };

        Session.set('chosen', Alternative.transportTypes.PARKANDRIDEBACK);
        Session.set('distances', distances);

    } else {
        //console.log("user will be routed to a bus/shuttle Park N' Ride parking lot");
        this.calculateMatrixes();
    }
};

ParkNRide.prototype.handleResults = function() {
    var count = Session.get('result-count');
    //console.log("Reactively running for the " + count + "th time!");

    if (count == 2) {
        // console.log(Session.get("driving-to-parking-response"));
        var parkingResponse = Session.get("driving-to-parking-response");
        // console.log(Session.get("bus-response"));
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

            var busIndex = (parseInt(i) + index); //iterate only on the parking+bus data indices

            if (busRideResults[i].elements[0].status != "OK") {
                //on error - simply make the parking lot an irrelevant result
                FreeParkingLotsWithBus[i].totalTime = 99999;
            } else {
                FreeParkingLotsWithBus[i].busRideFromParkDistance = busRideResults[i].elements[0].distance.value; //value in meters
                FreeParkingLotsWithBus[i].drivingToParkingDistance = originToParkResults[busIndex].distance.value; //value in meters
                FreeParkingLotsWithBus[i].totalTime = busRideResults[i].elements[0].duration.value / 60 + originToParkResults[busIndex].duration.value / 60;
            }
        }

        var minimumShuttle = null;
        var minimumBus = FreeParkingLotsWithBus.reduce(function(parkA, parkB, index, array) {
            return parkA.totalTime < parkB.totalTime ? parkA : parkB;
        });

        if (CheckParknRideTime()) {
            minimumShuttle = ParkAndRideData.reduce(function(parkA, parkB, index, array) {
                return parkA.totalTime < parkB.totalTime ? parkA : parkB;
            });
        }

        

        if (minimumShuttle) {
            for (var i in ParkAndRideData) {
                console.log("Parking lot: " + ParkAndRideData[i].name + " , total Time:" + ParkAndRideData[i].totalTime);
            }
        }

        for (var i in ParkAndRideData) {
            console.log("Parking lot: " + FreeParkingLotsWithBus[i].name + " , total Time:" + FreeParkingLotsWithBus[i].totalTime);
        }

        var selectedParking;

        if (minimumShuttle) {
            var selectedParking = minimumShuttle.totalTime < minimumBus.totalTime ? minimumShuttle : minimumBus;
        }
        else {
            selectedParking = minimumBus;
        }

        
        var destination = Session.get('to'); //needed to calculate calories

        var emissions = calculateParkNRideEmissions(selectedParking, selectedParking.type);
        var calories = calculateParkNRideCalories(selectedParking, destination, selectedParking.type);

        //var totalDistance = selectedParking.type=="shuttle" ? (selectedParking.distanceFromOrigin/1000)+selectedParking.shuttleDistance+selectedParking.selectedStation.walkingDistance :
        //                                                        selectedParking.busRideFromParkDistance+selectedParking.drivingToParkingDistance;

        var lineNumber = selectedParking.type == "shuttle" ? selectedParking.selectedStation.properties.ms_kav : "none";
        var stationId = selectedParking.type == "shuttle" ? selectedParking.selectedStation.properties.station_id : "none";
        var stationLon = selectedParking.type == "shuttle" ? selectedParking.selectedStation.geometry.coordinates[0] : "none";
        var stationLat = selectedParking.type == "shuttle" ? selectedParking.selectedStation.geometry.coordinates[1] : "none";

        var distances = Session.get('distances');

        distances[Alternative.transportTypes.PARKNRIDE] = {
            duration: selectedParking.totalTime,
            //distance: totalDistance,
            name: Alternative.transportTypes.PARKNRIDE.toLocaleLowerCase(),
            type: Alternative.transportTypes.DRIVING,
            price: 15,
            emmissions: emissions,
            calories: calories,
            park: selectedParking,
            park_type: selectedParking.type, //'shuttle' or 'bus'
            line_number: lineNumber,
            station_id: stationId,
            station_lon: stationLon,
            station_lat: stationLat
        };

        //console.log("Parks data:");
        //console.log(ParkAndRideData);
        //console.log(FreeParkingLotsWithBus);

        console.log("selected park:");
        console.log(selectedParking);
        console.log("distances matrix:");
        console.log(distances[Alternative.transportTypes.PARKNRIDE]);

        Session.set('chosen', Alternative.transportTypes.PARKNRIDE);
        Session.set('distances', distances);

    }
};


ParkNRide.prototype.calculateMatrixes = function() {
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
    }, function(response, status) {
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
    }, function(response, status) {
        self.setBusParkingData(response, status);
    });

};

ParkNRide.prototype.setBusParkingData = function(response, status) {
    if (status != 'OK') {
        console.log("Warning: Got a " + status + " status when getting Parking lot + bus results from Matrix API");
    } else {
        Session.set("bus-response", response);
    }

    var count = Session.get('result-count');
    Session.set('result-count', count + 1);
};

/* Calculate if destination is "very close" (<550m) from a ParkNRide parking lot */
ParkNRide.prototype.destinationIsParkNRide = function(destination) {
    //console.log("DATA:");
    //console.log(ParkAndRideData);
    for (var i in ParkAndRideData) {
        var distance = calcDistance(destination.G, destination.K, ParkAndRideData[i].lat, ParkAndRideData[i].lon);
        //console.log("distance to: "+ParkAndRideData[i].name+" is:"+distance);
        if (distance < 0.55) {
            return ParkAndRideData[i];
        }
    }
    return null;
};


ParkNRide.prototype.setDataParkNRide = function(response, status) {

    if (status != 'OK') {
        console.log("Warning: Got a " + status + " status when getting Parking lot + bus results from Matrix API");
    } else {
        Session.set("driving-to-parking-response", response);
    }


    var results = response.rows[0].elements;
    for (var i in ParkAndRideData) {

        //select the relevant shuttle station (closest to destination) for every park
        ParkAndRideData[i].selectedStation = getStation(this.finalDestination, ParkAndRideData[i]);
        ParkAndRideData[i].distanceFromOrigin = results[i].duration.value;
        ParkAndRideData[i].durationFromOrigin = results[i].duration.value / 60;
        ParkAndRideData[i].totalTime = ParkAndRideData[i].selectedStation.calculatedTime + ParkAndRideData[i].durationFromOrigin;
        //addWaitTime(ParkAndRideData[i]);

        // console.log("time calculations for " + ParkAndRideData[i].name);
        // console.log("calculated time from park to station is: " + ParkAndRideData[i].selectedStation.calculatedTime);
        // console.log("duration from origin is: " + ParkAndRideData[i].durationFromOrigin);
        // console.log("total time is: " + ParkAndRideData[i].totalTime);
    }

    var count = Session.get('result-count');
    Session.set('result-count', count + 1);
};

calculateParkNRideEmissions = function(selectedParking, parkType) {
    if (parkType == "shuttle") {
        //Emissions calculated are the aggregate btwn origin + parking station (car) & parking -> stop (bus)
        selectedParking.shuttleDistance = calcDistance(selectedParking.lon, selectedParking.lat, selectedParking.selectedStation.geometry.coordinates[0], selectedParking.selectedStation.geometry.coordinates[1]);
        return ((selectedParking.distanceFromOrigin / 1000 * 271) + (selectedParking.shuttleDistance * 101));
    } else { //parktype=="bus"
        return (((selectedParking.busRideFromParkDistance / 1000) * 101) + ((selectedParking.drivingToParkingDistance / 1000) * 271));
    }
};

calculateParkNRideCalories = function(selectedParking, finalDestination, parkType) {
    if (parkType == "shuttle") {
        var distance = calcDistance(finalDestination.lng, finalDestination.lat, selectedParking.selectedStation.geometry.coordinates[0], selectedParking.selectedStation.geometry.coordinates[1]);
            //distance (in km) / 6 = distance walked in hours (since a person walks 6km/hr) * 60 (mins) * 4.4 (calories/mins) * 1.3 (add a growth factor for non-linear distance)
        return (distance / 6 * 60 * 4.4 * 1.3);
    } else { //parkType=="bus"
        return 0;
    }
};

getBackStation = function(origin, parkNRideDataLot) {

    //initialize safe index of station closest to origin & the walkingDistance
    var minWalkingDistance = Number.MAX_SAFE_INTEGER;
    var minIndex = -1;
    var sumTime = 0;

    for (var i in parkNRideDataLot.stations) {
        var station = parkNRideDataLot.stations[i];
        station.walkingDistance = calcDistance(origin.K, origin.G, station.geometry.coordinates[0], station.geometry.coordinates[1]);
        station.walkingTime = station.walkingDistance * 10;
        if (station.walkingDistance < minWalkingDistance) {
            minWalkingDistance = station.walkingDistance;
            minIndex = i;
        }
    }

    //console.log(parkNRideDataLot.stations[minIndex]);

    var lastJ = 0;

    for (var j = minIndex; j < parkNRideDataLot.stations.length; j++) {
        //console.log("j="+j+" , i="+i);
        if (parkNRideDataLot.stations[j].properties.ms_kav == parkNRideDataLot.stations[minIndex].properties.ms_kav) {
            sumTime += parkNRideDataLot.stations[j].properties.newMinutes;
            lastJ = j;
        }
    }

    //console.log(parkNRideDataLot.stations[lastJ]);

    //console.log("Add: "+parkNRideDataLot.stations[lastJ].properties.newMinutesLast + " subract:"+parkNRideDataLot.stations[lastJ].properties.newMinutes);
    sumTime = sumTime + parkNRideDataLot.stations[lastJ].properties.newMinutesLast - parkNRideDataLot.stations[lastJ].properties.newMinutes;

    parkNRideDataLot.stations[minIndex].sumTime = sumTime;
    parkNRideDataLot.stations[minIndex].calculatedDistance = calcDistance(parkNRideDataLot.stations[minIndex].geometry.coordinates[0],
        parkNRideDataLot.stations[minIndex].geometry.coordinates[1],
        parkNRideDataLot.lon, parkNRideDataLot.lat);


    if (i == -1) {
        console.log("An error happened - did not find a station that's close to ")
    } else {
        console.log("chose station #" + minIndex + ": kav " + parkNRideDataLot.stations[minIndex].properties.color + " station: " + parkNRideDataLot.stations[minIndex].properties.ms_tahana);
        console.log("Sum time: " + parkNRideDataLot.stations[minIndex].sumTime);
    }

    return parkNRideDataLot.stations[minIndex];

    // else if (transportationType==Alternative.transportTypes.PARKANDRIDEBACK) {

    //             //for each station calculate time from station to end of line
    //             for (var j = i; j< parkNRideData.stations.length; j++){
    //                 //console.log("j="+j+" , i="+i);
    //                 if (parkNRideData.stations[j].properties.ms_kav==parkNRideData.stations[i].properties.ms_kav) {
    //                     sumTime+=parkNRideData.stations[j].properties.newMinutes;
    //                 }
    //             }
    //         }

};

getStation = function(destination, parkNRideData) {
    for (var i in parkNRideData.stations) {
        var station = parkNRideData.stations[i];
        var walkingDistance = calcDistance(destination.K, destination.G, station.geometry.coordinates[0], station.geometry.coordinates[1]);
        parkNRideData.stations[i].walkingDistance = walkingDistance;
        var walkingTime = walkingDistance * 10;
        var sumTime = 0;

        //for each station calculate time from beginning of the line to station
        for (var j = 0; j <= i; j++) {
            if (parkNRideData.stations[j].properties.ms_kav == parkNRideData.stations[i].properties.ms_kav) {
                sumTime += parkNRideData.stations[j].properties.newMinutes;
                //console.log(parkNRideData.stations[j].properties.newMinutes);
            }
        }

        parkNRideData.stations[i].sumTime = sumTime;
        parkNRideData.stations[i].calculatedTime = sumTime + walkingTime;
    }

    var stationsArray = parkNRideData.stations;
    //console.log(stationsArray);
    var bestStation = stationsArray.reduce(function(stationA, stationB, index, array) {
        return stationA.calculatedTime < stationB.calculatedTime ? stationA : stationB;
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
    var minutesAtPark = now.getMinutes() + selectedParking.durationFromOrigin;
    var hoursAtPark = now.getHours();
    if (minutesAtPark > 60) {

        //add an amount of hours equal to the new minutes
        var addedHours = Math.floor(minutesAtPark / 60);
        hoursAtPark += addedHours;
        minutesAtPark -= addedHours * 60;
    }

    var shuttleWaitTime = 0;

    if ((hoursAtPark > 9 && minutesAtPark >= 30) && (hoursAtPark <= 15 && minutesAtPark < 30)) {
        //non peak time
        selectedParking.totalTime += 7.5;
    } else {
        selectedParking.totalTime += 2.5;
    }


};

//interal stuff - code written to help us retrieve shuttle maslulim's real timings
//TODO: remove this

getShuttleDistances = function(parkNRideData, directionsService, matrixService) {
    for (var i in parkNRideData) {
        i++;
        console.log(i);
        var j = 0;
        for (j = 0; j < parkNRideData[i].stations.length; j++) {
            if (j == 0) {
                parkNRideData[i].stations[0].newMinutes = 0;
                console.log(parkNRideData[i].stations[0]);
                continue;
            }
            // else if (parkNRideData[i].stations[j].newMinutes!=undefined)
            //     continue;
            else {
                directionsService.route({
                        origin: new google.maps.LatLng(parkNRideData[i].stations[j - 1].geometry.coordinates[1], parkNRideData[i].stations[j - 1].geometry.coordinates[0]),
                        destination: new google.maps.LatLng(parkNRideData[i].stations[j].geometry.coordinates[1], parkNRideData[i].stations[j].geometry.coordinates[0]),
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        durationInTraffic: false,
                        avoidHighways: false,
                        avoidTolls: false
                    },
                    function(response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            console.log(response);
                            //directionsDisplay.setDirections(response);
                            var time = response.routes[0].legs[0].duration.value / 60;
                            var station = findStationByTo(ParkAndRideData[0].stations, response.request.destination);
                            console.log("newMinutes: " + time);
                            console.log("mikum: " + station.properties.mikum);
                            console.log("oid_shuttle: " + station.properties.oid_shuttl);
                            console.log("Ms_tahana: " + station.properties.ms_tahana);
                            console.log("Ms_kav: " + station.properties.ms_kav);



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
};

findStationByTo = function(parkNRideDataStations, To) {
    // console.log(To);
    // console.log(parkNRideDataStations);
    for (var i in parkNRideDataStations)
        if (To.G.toFixed(5) == parkNRideDataStations[i].geometry.coordinates[1].toFixed(5) && To.K.toFixed(5) == parkNRideDataStations[i].geometry.coordinates[0].toFixed(5))
            return parkNRideDataStations[i];

    console.log("got no station biatch");
};

CheckParknRideTime = function (){
    var now = new Date();
    if (now.getDay()<5){
        if(now.getHours()>=6 && now.getHours()<=21)
            return true;
        return false;
    }
    return false;
}
