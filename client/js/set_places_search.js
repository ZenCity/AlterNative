Session.setDefault('distances', {});

currentCity = cities[defaultCity];

setAutoComplete = function () {
    _setAutoComp("from", 'from-location');
    _setAutoComp("to", 'to-location');
};

_setAutoComp = function (key, className) {
    var input = document.getElementsByClassName(className)[0];
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(window.currentCity['llcrnr'][0], window.currentCity['llcrnr'][1]),
        new google.maps.LatLng(window.currentCity['urcrnr'][0], window.currentCity['urcrnr'][1])
    );
    //console.log("set autocomplete language: "+TAPi18n.getLanguage());
    var options = {
        componentRestrictions: {country: 'il'},
        types: [],
        bounds: bounds
        //language: TAPi18n.getLanguage()
        //language: 'en'
    };
    var autoComplete = new google.maps.places.Autocomplete(input, options);
    autoComplete.setBounds(bounds);
    google.maps.event.addListener(autoComplete, 'place_changed', function () {
        var place = autoComplete.getPlace();
        var location = {
            name: place.name,
            formatted_address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
        Session.set(key, location);
    });

    var mapOptions = {
        zoom:12,
        center: new google.maps.LatLng(window.currentCity['center'][0], window.currentCity['center'][1])
    };
    var map = new google.maps.Map(
        document.getElementById('map-canvas'),
        mapOptions
    );
    autoComplete.bindTo('bounds', map);
};

