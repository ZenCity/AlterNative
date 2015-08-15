setCurrentLoaction = function (domElement) {

    if ( Session.get('prevent-auto-locate') == 'prevent' ) {
        Session.set('prevent-auto-locate','');
        return;
    }

    window.navigator.geolocation.getCurrentPosition(
        function (position) {
            Session.set('current_location', {
                //lat: 31.7881931,
                //lng: 35.2063973
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            _setCurrentLoaction(domElement)
        },
        function (error) {
            console.log('error setting current location', error);
        }
    );
};

_setCurrentLoaction = function  (domElement) {
    var geocoder = new google.maps.Geocoder();
    var lat = Session.get('current_location').lat; 
    var lng = Session.get('current_location').lng;
    var latlng = new google.maps.LatLng(lat, lng);
    //console.log("set _setCurrentLoaction language: "+TAPi18n.getLanguage());
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        //console.log("RESULTS:");
        //console.log(results);
      var formatted_address = results[0].formatted_address
      Session.set('from', {
        formatted_address: formatted_address,
        lat: lat,
        lng: lng 
      });
      domElement.val(formatted_address);
    });
}