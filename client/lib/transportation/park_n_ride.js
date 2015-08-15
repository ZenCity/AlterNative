var parking_hane_ve_sa = {"displayFieldName":"name","fieldAliases":{"oid_hanion":"מזהה ממג","name":"שם חניון","ktovet":"כתובת","ms_mekomot":"מקומות חניה","ms_kavim":"מספר קווים","hours":"שעות פעילות","tadirut_high":"תדירות שיא","tadirut_low":"תדירות שפל","price_hanaya":"מחיר חניה","pice_hasaa":"מחיר הסעה"},"geometryType":"esriGeometryPoint","spatialReference":{"wkid":2039,"latestWkid":2039},"fields":[{"name":"oid_hanion","type":"esriFieldTypeOID","alias":"מזהה ממג"},{"name":"name","type":"esriFieldTypeString","alias":"שם חניון","length":255},{"name":"ktovet","type":"esriFieldTypeString","alias":"כתובת","length":255},{"name":"ms_mekomot","type":"esriFieldTypeInteger","alias":"מקומות חניה"},{"name":"ms_kavim","type":"esriFieldTypeInteger","alias":"מספר קווים"},{"name":"hours","type":"esriFieldTypeString","alias":"שעות פעילות","length":255},{"name":"tadirut_high","type":"esriFieldTypeString","alias":"תדירות שיא","length":255},{"name":"tadirut_low","type":"esriFieldTypeString","alias":"תדירות שפל","length":255},{"name":"price_hanaya","type":"esriFieldTypeInteger","alias":"מחיר חניה"},{"name":"pice_hasaa","type":"esriFieldTypeInteger","alias":"מחיר הסעה"}],"features":[{"attributes":{"oid_hanion":1,"name":"חוף תל ברוך","ktovet":"חוף תל ברוך","ms_mekomot":700,"ms_kavim":2,"hours":"6:00-22:00","tadirut_high":"כל 5-7 דקות","tadirut_low":"כל 15-20 דקות","price_hanaya":15,"pice_hasaa":null},"geometry":{"x":179831.21500000003,"y":669989.80200000003}},{"attributes":{"oid_hanion":2,"name":"אצטדיון המושבה","ktovet":"דרך אם המושבות 12, קרית אריה, פתח תקוה","ms_mekomot":1000,"ms_kavim":1,"hours":"6:00-22:00","tadirut_high":"כל 5-7 דקות","tadirut_low":"כל 15-20 דקות","price_hanaya":15,"pice_hasaa":null},"geometry":{"x":187468.69400000002,"y":668101.37699999998}},{"attributes":{"oid_hanion":3,"name":"חניון מצפה מודיעין","ktovet":"חניון מבוא מודיעין","ms_mekomot":550,"ms_kavim":2,"hours":null,"tadirut_high":"כל 10 דקות","tadirut_low":null,"price_hanaya":0,"pice_hasaa":null},"geometry":{"x":195911.30599999998,"y":651107.79000000004}},{"attributes":{"oid_hanion":4,"name":"פארק גני יהושע","ktovet":"ישראל רוקח 94","ms_mekomot":1000,"ms_kavim":2,"hours":"6:00-22:00","tadirut_high":"כל 5-7 דקות","tadirut_low":"כל 15-20 דקות","price_hanaya":15,"pice_hasaa":null},"geometry":{"x":182477.25,"y":668037.21299999999}}]};

function createHanionimLatLngObjArray(parkingArray) {
    //var origin1 = new google.maps.LatLng(55.930385, -3.118425);
    var hanionimArray = [];

    var parkingFeatures = parking_hane_ve_sa.features;

    for (parkingFeature in parkingFeatures)
    {
        if (parkingFeatures.hasOwnProperty(parkingFeature)) {
            console.log("hanyon's x,y" + " -> " + parkingFeatures[parkingFeature].geometry.x + "," + parkingFeatures[parkingFeature].geometry.y);
            var parkingLatLong = getLatLongFromXY(parkingFeatures[parkingFeature].geometry.x,parkingFeatures[parkingFeature].geometry.y);
            hanionimArray.push(new google.maps.LatLng(parkingLatLong[1],parkingLatLong[0]));
        }
        else {
            console.log("ERROR: station not found!");
        }
    }

    return hanionimArray;

}


ParkNRide = function (origin, destination, directionsService, matrixService) {
    
    var destinations = createHanionimLatLngObjArray(parking_hane_ve_sa);

    this.type = google.maps.TravelMode.DRIVING;
    this.origin = origin;
    this.destination = destinations;
    this.directionsService = directionsService;
    this.matrixService = matrixService;
    this.calculateMatrix();
};

ParkNRide.prototype.calculateMatrix = function () {
    this.matrixService.getDistanceMatrix({
        origins: [this.origin],
        destinations: this.destination,
        travelMode: this.type,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
    }, setDataParkNRide);
};

setDataParkNRide = function (response, status) {
    if( status != 'OK'){
        return;
    }

    console.log("GOT PARKNRIDE RESPONSE:");
    console.log(response);

    /*

    var distances = Session.get('distances');
    var element = response.rows[0].elements[0];
    var price = (2.738 * element.distance.value / 1000).toFixed(2);

    distances[Alternative.transportTypes.DRIVING] = {
        duration: element.duration.value / 60,
        distance: element.distance.value / 1000,
        name: Alternative.transportTypes.DRIVING.toLocaleLowerCase(),
        type: Alternative.transportTypes.DRIVING,
        price: price,
        emmissions: 271 * element.distance.value / 1000, //271g CO2 per KM
        calories: 0
    };
    Session.set('distances', distances);
    */
};


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