var formattedAddressReverse = "";

toggleCircle = function(chosen){
    $('button.circle').not('button.circle #'+chosen).not('.circle-main').removeClass('active').addClass('deactivate');
    $('#' + chosen).not('.circle-main').toggleClass('active').removeClass('deactivate');
    Session.set('sort-by', chosen);
};

toggleResult = function(chosen){
    $('.result-text').not('.' + chosen).removeClass('chosen');
    $('.result-text.' + chosen).addClass('chosen');
}

circleClickHandler = function (jQueryEvent, BlazeTemplateInstance) {
    setSorter( jQueryEvent );
    toggleResult(Session.get('sort-by'));
    if(!Session.get('from')){
        missingInput($('.from-location'));
    }
    else if(!Session.get('to')){
        missingInput($('.to-location'));
    }
    else {
        var fromStr = Session.get('from');
        var fromStrFormattedList = fromStr.formatted_address.split(',');
        var toStr = Session.get('to');
        var toStrFormattedList = toStr.formatted_address.split(',');
        setPrettyAddressSession('from-address-pretty',fromStrFormattedList,fromStr.lat,fromStr.lng);
        setPrettyAddressSession('to-address-pretty',toStrFormattedList,toStr.lat,toStr.lng);
    }
};

setSorter = function( jQueryEvent ) {
    var circleId = $(jQueryEvent.target).attr('id');
    toggleCircle(circleId);
    toggleResult(Session.get('sort-by'));
}

setPrettyAddressSession = function(attrName, listAddress,lat,lng) {
    if (listAddress.length==0) {
        console.log("Error: address should not be empty");
    }
    else if (listAddress.length == 1) {
        Session.set(attrName,listAddress[0]);
    }
    else { //listAddress.length >= 2
        var geocoder = new google.maps.Geocoder();

        //sometimes directions API returns only "city, State" - do reverse geocoding if that happens to get a full place
        if (trimStr(listAddress[1])=="Israel" || trimStr(listAddress[1])=="ישראל") {
            //console.log("extending address with geolocation");
            var latlng = new google.maps.LatLng(lat, lng);
            Session.set(attrName,listAddress[0]);
            
            geocoder.geocode({'latLng': latlng, 'region':'IL'}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //console.log("UPDATE REVERSE GEOCODE ADDRESS: "+results[0].formatted_address);
                    formattedAddressReverse = results[0].formatted_address.split(',')[0];
                    formattedAddressReverse = formattedAddressReverse+' ,';
                    //set a session variable as prefix to the results place display
                    Session.set(attrName+"-prefix",formattedAddressReverse);
                }

            });
        }
        else { //just use the street / city
            Session.set(attrName,(listAddress[0]+', '+listAddress[1]));        
        }
    }
};

function trimStr (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

missingInput = function(element){
    element.addClass('error');
    element.parent().addClass('error');
}

removeMissingInputError = function(element){
    element.removeClass('error');
    element.parent().removeClass('error');
}
