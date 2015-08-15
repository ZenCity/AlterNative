defaultCity = "telAviv";

cities = {
    "jerusalem": {
        "llcrnr": [31.809595, 35.150125],
        "center": [31.777824, 35.216536],
        "urcrnr": [31.730933, 35.255353],
        "setDistanceMatric": function () {
            Session.set('distances', {});
            setDistanceTransit(setDataTransit);
            setDistanceCar(setDataDriving);
            setDistanceWalking(setDataWalking);
            setDistanceTaxi(setDataTaxi);
            setDistancePersonalBike(setDataPersonalBike);
        }
    },
    "telAviv": {
        "llcrnr": [32.020861, 34.738194],
        "center": [32.071205, 34.786260],
        "urcrnr": [32.124430, 34.826428],
        "setDistanceMatric": function () {
            var origin = new google.maps.LatLng(
                Session.get('from').lat,
                Session.get('from').lng
            );
            var destination = new google.maps.LatLng(
                Session.get('to').lat,
                Session.get('to').lng
            );
            var directionsService = new google.maps.DirectionsService();
            var matrixService = new google.maps.DistanceMatrixService();

            Session.set('distances', {});

            new Driving(origin, destination, directionsService, matrixService);
            new Train(origin, destination, directionsService, matrixService);
            new ParkNRide(origin,destination,directionsService,matrixService);
            setDistanceTransit(setDataTransit);
            setDistanceWalking(setDataWalking);
            setDistanceTaxi(setDataTaxi);
            setDistancePersonalBike(setDataPersonalBike);
            setTelOfunRoute();
        }
    }
};
