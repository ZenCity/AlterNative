
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
        
        var startStation = Session.get('tel-o-fun-start');
        var endStation = Session.get('tel-o-fun-end');

        var telOfunStart = new google.maps.LatLng(startStation.lat, startStation.lng);
        var telOfunEnd = new google.maps.LatLng(endStation.lat, endStation.lng);
        


        var TelOFunStartDesc = getTelOFunMarkerDescription("from",startStation);
        
        var infowindowStart = new google.maps.InfoWindow({
            content: TelOFunStartDesc
        });

        var startMarker = new google.maps.Marker({
            position: telOfunStart,
            map: map,
            title: 'Start Point - Tel O Fun'
        });
        
        startMarker.addListener('click', function() {
            infowindowStart.open(map, startMarker);
        });

        var TelOFunEndDesc = getTelOFunMarkerDescription("to",endStation);

        var infowindowEnd = new google.maps.InfoWindow({
            content: TelOFunEndDesc
        });

        var endMarker = new google.maps.Marker({
            position: telOfunEnd,
            map: map,
            title: 'End Point - Tel O Fun'
        });
        
        endMarker.addListener('click', function() {
            infowindowEnd.open(map, endMarker);
        });

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
        
        if (pnr.park.type=="shuttle") { //draw only the walking from the station to final destination
            request.travelMode = google.maps.TravelMode.WALKING;
            request.origin = new google.maps.LatLng(pnr.park.selectedStation.geometry.coordinates[1], pnr.park.selectedStation.geometry.coordinates[0]);
            markers.push(request.origin);
        }
        else {
            request.origin = new google.maps.LatLng(pnr.park.lat,pnr.park.lon);
            request.travelMode = google.maps.TravelMode.TRANSIT;
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

        
        // console.log("markers:");
        // console.log(markers);
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
            //console.log(maslul);
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
        
        var PNR = Session.get('distances')['PARKANDRIDEBACK'];
        if (PNR.park_type == 'shuttle'){
            
            var maslul = window["kav" + PNR.line_number]['features'][0];
            var maslulEndLon = maslul['geometry']['coordinates'].slice(-1)[0][0];
            var maslulEndLat = maslul['geometry']['coordinates'].slice(-1)[0][1];
            //console.log(PNR.from_lon, PNR.from_lat, maslulEndLon, maslulEndLat);
            cutGeoJsonFromTo(PNR.from_lon, PNR.from_lat, maslulEndLon, maslulEndLat, maslul);
            //console.log(maslul);
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

    //console.log(destination);

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

    

}


//display dashed lines for walking on map for PNR
var getRendererOptions = function () {
    var rendererOptions = {};
    var distances = Session.get('distances');

    //display "dotted" walking only if park type is shuttle
    if (Session.get('chosen').name == 'parknride' && distances[Alternative.transportTypes.PARKNRIDE] 
        && distances[Alternative.transportTypes.PARKNRIDE].park.type=="shuttle") {

        var icon = {
            fillColor: 'blue', 
            fillOpacity: 0.5,
            scale: 3,
            strokeColor: 'blue',
            strokeWeight: 1,
            strokeOpacity: 0.8,
            path: google.maps.SymbolPath.CIRCLE
        };

        var polyLineOptions = {
            strokeOpacity: 0,
            icons: [{
                icon: icon,
                  offset: '0',
                  repeat: '10px'
                }]
        };

        rendererOptions = {
            polylineOptions: polyLineOptions,
            preserveViewport: true
        };
    }
    return rendererOptions;
}

var getTelOFunMarkerDescription = function (direction,station) {

    var retString = '<div style="display: inline-block; overflow: auto; max-height: 718px; max-width: 300px;">'+
    '<div class="gm-iw gm-transit" style="max-width: 200px; direction: '+(TAPi18n.getLanguage()=='he'? 'rtl; ':'ltr; ')+ 'jstcache="0">'+
    '<img style="margin-left: -15px; margin-right: 5px; width: 20px; height: 20px; border: 0px 10px 0px 0px;" jsdisplay="$icon" jsvalues=".src:$icon" jstcache="1" src="images/icons/bicycle_000000_20.png">'+
    '<div jsvalues=".innerHTML:$this.instructions" jstcache="2">';
    if (TAPi18n.getLanguage()=='en') {
        retString+= (direction=="from"? 'Take ':'Return ' )+'a bike '+ 
        (direction=="from"? "from ":"at ")+"station: ";
    }
    else { //language=='he'
        retString+= (direction=="to"? 'קחו ':'החזירו ' )+'זוג אופניים '+ 
        (direction=="from"? "מ":"ל")+"תחנת ";
    }
    retString+="<strong>"+station.stationName+'</strong>.</div></div></div>';


    // var retStr = '<div id="content">'+
    //             '<div id="siteNotice">'+
    //             '</div>'+
    //             '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
    //             '<div id="bodyContent">'+
    //             '<p><b>Start Point - Tel O Fun</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
    //             'sandstone rock formation in the southern part of the '+
    //             'Northern Territory, central Australia.</p>'+
    //             '</div>'+
    //             ' </div>';

                //toLocaleLowerCase()
    return retString;
}

var myStyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];
