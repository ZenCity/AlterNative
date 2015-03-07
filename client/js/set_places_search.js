Session.setDefault('distances', {});

setAutoComplete = function () {
    _setAutoComp("from", 'from-location');
    _setAutoComp("to", 'to-location');
};

_setAutoComp = function (key, className) {
    var input = document.getElementsByClassName(className)[0];
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(31.809595, 35.150125),
        new google.maps.LatLng(31.730933, 35.255353)
    );
    var options = {
        componentRestrictions: {country: 'il'},
        types: [],
        bounds: bounds
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

    var telAviv = new google.maps.LatLng(32.054934, 34.775407);
    var mapOptions = {
        zoom:12,
        center: telAviv
    };
    var map = new google.maps.Map(
        document.getElementById('map-canvas'),
        mapOptions
    );
    autoComplete.bindTo('bounds', map);
};
