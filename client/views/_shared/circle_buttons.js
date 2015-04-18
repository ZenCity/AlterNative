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
    //Object {name: "Migdal St 7", formatted_address: "Migdal St 7, Tel Aviv-Yafo, Israel", lat: 32.0618181, lng: 34.763799800000015, language: "en"}
    var fromStr = Session.get('from');
    var fromStrFormattedList = fromStr.formatted_address.split(',');
    var toStr = Session.get('to');
    var toStrFormattedList = toStr.formatted_address.split(',');
    setPrettyAddressSession('from-address-pretty',fromStrFormattedList);
    setPrettyAddressSession('to-address-pretty',toStrFormattedList);
};

setSorter = function( jQueryEvent ) {
    var circleId = $(jQueryEvent.target).attr('id');
    toggleCircle(circleId);
    toggleResult(Session.get('sort-by'));
}

setPrettyAddressSession = function(attrName, listAddress) {
    if (listAddress.length == 0) {
        console.log("BUG: address should not be empty");
    }
    else if (listAddress.length == 1) {
        Session.set(attrName,listAddress[0]);
    }
    else { 
        Session.set(attrName,(listAddress[0] + ', ' + listAddress[1]));
    }
}

missingInput = function(element){
    element.addClass('error');
    element.parent().addClass('error');
}

removeMissingInputError = function(element){
    element.removeClass('error');
    element.parent().removeClass('error');
}
