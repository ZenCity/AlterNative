getStation = function( destination, driveAndRide ) {
    for(var i in driveAndRide.stations) {
        var station = driveAndRide.stations[i];
        var walkingDistance = calcDistance(destination.lat, destination.lon, station.lat, station.lon);
        var walkingTime = walkingDistance * 20;
        driveAndRide.stations[i].calculatedTime = station.time + walkingTime;
    }
    var bestStation = driveAndRide.driveAndRide.stations.reduce(function(stationA, stationB, index, array){
       return  stationA.calculatedTime < stationB.calculatedTime ? stationA : stationB;
    });
    return bestStation;
};