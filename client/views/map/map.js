
var directionsDisplay, map, directionsService;
markers = [];
var initializeMap = function() {

    
    var telAviv = new google.maps.LatLng(32.054934, 34.775407);
    var mapOptions = {
        zoom: 13,
        center: telAviv,
        styles: myStyle
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var rendererOptions = getRendererOptions();

    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    directionsDisplay.setMap(map);
};

var calcRoute = function() {
    if (!directionsService) {
        directionsService = new google.maps.DirectionsService();
    }
    var end = new google.maps.LatLng(Session.get('to').lat, Session.get('to').lng);
    var start = new google.maps.LatLng(Session.get('from').lat, Session.get('from').lng);
    markers.push(new google.maps.LatLng(Session.get('to').lat, Session.get('to').lng));
    markers.push(new google.maps.LatLng(Session.get('from').lat, Session.get('from').lng));

    var request = {
        origin: start,
        destination: end,
        travelMode: Session.get('chosen').type
    };

    if (Session.get('chosen').type == Alternative.transportTypes.TRAIN) {
        request.travelMode = google.maps.TravelMode.TRANSIT;
        request.transitOptions = {
            modes: [
                google.maps.TransitMode.SUBWAY,
                google.maps.TransitMode.TRAIN,
                google.maps.TransitMode.RAIL
            ]
        };
    }
    if (Session.get('chosen').type == Alternative.transportTypes.TELOFUN) {
        request.travelMode = google.maps.TravelMode.WALKING;
        var telOfunStart = new google.maps.LatLng(Session.get('tel-o-fun-start').lat, Session.get('tel-o-fun-start').lng);
        var telOfunEnd = new google.maps.LatLng(Session.get('tel-o-fun-end').lat, Session.get('tel-o-fun-end').lng);
        var waypoints = [telOfunStart, telOfunEnd];
        waypoints = waypoints.map(function(place) {
            return {
                stopover: false,
                location: place
            };
        });
        request.waypoints = waypoints;
    }
    if (Session.get('chosen').name == 'parknride') {
        var distances = Session.get('distances');
        var pnr = distances[Alternative.transportTypes.PARKNRIDE];
        markers.push(new google.maps.LatLng(pnr.park.lat,pnr.park.lon));
        console.log(pnr);

        if (pnr.park.type=="shuttle") { //draw only the walking from the station to final destination
            request.travelMode = google.maps.TravelMode.WALKING;
            request.origin = new google.maps.LatLng(pnr.park.selectedStation.geometry.coordinates[1], pnr.park.selectedStation.geometry.coordinates[0]);
            markers.push(request.origin);
        }

        //now, draw the drive from the starting point to the Park
        drawDriveToParkingResult(start, pnr);


    }

    directionsService.route(request, function(result, status) {
        var leg = result.routes[0].legs[0];
        var distance = leg.distance.value;
        var duration = leg.duration.value / 60; // in minutes
        var route = leg.steps.map(function(step) {
            return {
                lat: step.start_point.lat(),
                lng: step.start_point.lng()
            };
        });
        var navRecord = {
            date: new Date,
            to: Session.get('to'),
            from: Session.get('from'),
            distance: distance,
            duration: duration,
            transType: Session.get('chosen').name,
            route: route,
            searchId: Session.get('search-id'),
            searchCraitiria: Session.get('sort-by')
        };

        //console.log(navRecord);
        Navigations.insert(navRecord);
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }

        console.log("DREW WALKING RESULT");
        console.log("markers:");
        console.log(markers);
        var markerBounds = new google.maps.LatLngBounds();

        
        for (var i = 0; i < markers.length; i++) {
           markerBounds.extend(markers[i]);
        }

        map.setCenter(markerBounds.getCenter());
        map.fitBounds(markerBounds);
        markers = [];

    });
};

Template.map.rendered = function() {
    initializeMap();
    calcRoute();
    var shuttle = Session.get('distances').shuttle;
    if (Session.get('chosen').name == 'parknride') {
        var PNR = Session.get('distances')['PARKNRIDE'];
        if (PNR.park_type == 'shuttle'){
            var maslul = window["kav" + PNR.line_number]['features'][0];
            cutGeoJson(PNR.to_lon, PNR.to_lat, maslul);
            console.log(maslul);
            map.data.addGeoJson(maslul);
            // Set the stroke width and color for each shuttle line
            var line_color = maslul['properties']['colorEn'];
            map.data.setStyle({
                strokeColor: line_color,
                strokeWeight: 5
            });

        }
    }
    if (Session.get('chosen').name == 'parkandrideback') {
        console.log('bam - riding back!');
        var PNR = Session.get('distances')['PARKANDRIDEBACK'];
        if (PNR.park_type == 'shuttle'){
            console.log('bam bam - riding back!');
            var maslul = window["kav" + PNR.line_number]['features'][0];
            var maslulEndLon = maslul['geometry']['coordinates'].slice(-1)[0][0];
            var maslulEndLat = maslul['geometry']['coordinates'].slice(-1)[0][1];
            console.log(PNR.from_lon, PNR.from_lat, maslulEndLon, maslulEndLat);
            cutGeoJsonFromTo(PNR.from_lon, PNR.from_lat, maslulEndLon, maslulEndLat, maslul);
            console.log(maslul);
            map.data.addGeoJson(maslul);
            // Set the stroke width and color for each shuttle line
            var line_color = maslul['properties']['colorEn'];
            map.data.setStyle({
                strokeColor: line_color,
                strokeWeight: 5
            });


        }
    }
};

var drawDriveToParkingResult = function(start ,pnr) {
    //console.log(pnr);


    //console.log(start);
    //console.log(destination);

    var destination = null;

    if (pnr.park_type=="shuttle") {

        var kav_num  = pnr.park.selectedStation.properties.ms_kav;
        park_coordinates = window["kav" + kav_num]['features'][0]['geometry']['coordinates'][0];
        destination =  new google.maps.LatLng(park_coordinates[1], park_coordinates[0]);

    }
    else {
        destination = new google.maps.LatLng(pnr.park.lat,pnr.park.lon);
    }
    markers.push(start);
    markers.push(destination);

    console.log(destination);

    var request = {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };

    if (!directionsService) {
        directionsService = new google.maps.DirectionsService();
    }

    directionsService.route(request, function(result, status) {
        //console.log("result");
        //console.log(result);
        var myDirectionsDisplay = new google.maps.DirectionsRenderer();

        if (status == google.maps.DirectionsStatus.OK) {
            myDirectionsDisplay.setDirections(result);
            myDirectionsDisplay.setMap(map);
        }
    });

    console.log("DREW DRIVING RESULT");

}


//display dashed lines for walking on map for PNR
var getRendererOptions = function () {
    var rendererOptions = {};
    if (Session.get('chosen').name == 'parknride') {
        //draw dotted lines
        var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4
          };

        var polyLineOptions = {
            strokeOpacity: 0,
            icons: [{
                icon: lineSymbol,
                  offset: '0',
                  repeat: '20px'
                }]
        };

        rendererOptions = {
            polylineOptions: polyLineOptions,
            preserveViewport: true
        };
    }
    return rendererOptions;
}

var myStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];
