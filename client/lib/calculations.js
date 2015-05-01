alternativeTaxiString = "taxi";

//Gets distances matrix with different transportation types, extends each object 
//with calories and CO2 emmissions data

setDataDriving = function (response, status) {
    if( status != 'OK'){
        return;
    }

	var distances = Session.get('distances');
	var element = response.rows[0].elements[0];
	var price = (2.738 * element.distance.value / 1000).toFixed(2);

	distances[google.maps.TravelMode.DRIVING] = {
		duration: element.duration.value / 60,
		distance: element.distance.value / 1000,
		name: google.maps.TravelMode.DRIVING.toLocaleLowerCase(),
		type: google.maps.TravelMode.DRIVING,
		price: price,
		emmissions: 271 * element.distance.value / 1000, //271g CO2 per KM
		calories: 0
	};
	Session.set('distances', distances);
};

setDataTaxi = function (response, status) {
    if( status != 'OK'){
        return;
    }
    var distances = Session.get('distances');
	var element = response.rows[0].elements[0];
	var price = getTaxiPrice(element.distance.value,element.duration.value);
	distances[alternativeTaxiString] = {
		duration: element.duration.value / 60,
		distance: element.distance.value / 1000,
		name: alternativeTaxiString.toLocaleLowerCase(),
		type: google.maps.TravelMode.DRIVING,
		price: price,
		emmissions: 271 * element.distance.value / 1000, //271g CO2 per KM
		calories: 0
	};
	Session.set('distances', distances);
};

/* Calculate price for taxis, taking into consideration the Tariff 
   as described in here: http://media.mot.gov.il/PDF/HE_TRAFFIC_PUBLIC/Taharif_monit.pdf
   and taking into consideration other factors such as time of day
 */
getTaxiPrice = function (distance, duration) {
	var now = new Date();
	var taarif1 = (now.getHours() < 21 && now.getHours() > 5) || (now.getHours() == 5 && now.getMinutes() >=30);
	var basePrice = 12.3; 
	var initialKMs = taarif1 ? 0.53 : 0.147;
	var initialTime = taarif1 ? 1.3 : 0.3;
	if (distance / 1000 < initialKMs && duration / 60 < initialTime) {
		//need to return defaultPrice
		return basePrice;
	}
	var baseDistance = taarif1 ? 0.7834 : 0.63; //the amount in distance unit we have to add to price
	var baseDuration = 60 / (taarif1 ? 11 : 9);  //amount in units we have to multiply distance and add to price 
	var basePriceUnit = 0.3;
	return (basePrice + ( ((distance / 1000) - initialKMs) / baseDistance + ((duration  / 60)- initialTime) * baseDuration) * basePriceUnit).toFixed(2);
	//(17.3 + (distance / 1000 * 0.7834) + (duration / 60 * 0.3)).toFixed(2);
}

setDataWalking = function (response, status) {
    if( status != 'OK'){
        return;
    }
    var distances = Session.get('distances');
	var element = response.rows[0].elements[0];
	var price = 0;
	distances[google.maps.TravelMode.WALKING] = {
		duration: element.duration.value / 60,
		distance: element.distance.value / 1000,
		name: google.maps.TravelMode.WALKING.toLocaleLowerCase(),
		type: google.maps.TravelMode.WALKING,
		price: price,
		emmissions: 0,
		calories: walkingCalories(element.duration.value)
	};
	Session.set('distances', distances);
};

setDataPersonalBike = function (response, status) {
	var distances = Session.get('distances');
	var element = response.rows[0].elements[0];
	var price = 0;
	distances[google.maps.TravelMode.BICYCLING] = {
		duration: element.duration.value / 60 / 3,
		distance: element.distance.value / 1000,
		name: 'personalbike',
		type: google.maps.TravelMode.WALKING,
		price: price,
		emmissions: 5 * element.distance.value / 1000, //5 g CO2 / KM : The calculation from the report - cost of calories
		calories: 9.45 * element.duration.value / 60 / 3 //9.45 calories / KM
	};
	Session.set('distances', distances);
};

setDataTransit = function (response, status) {
    if( status != 'OK'){
        return;
    }
    var distances = Session.get('distances');
	var leg = response.routes[0].legs[0];
    var steps = leg.steps;
    //debugger;
    var travelMods = steps
        .filter(function(step){
            return step.instructions;
        })
        .map(function(step){
            return step.instructions.split(' ')[0];
        });
    if (travelMods.indexOf('Tram') == -1 && travelMods.indexOf('Bus') == -1) {
    	return;
    }
	var isTram = travelMods.indexOf('Tram') >= 0;
    //var type = isTram ? 'TRAM' : google.maps.TravelMode.TRANSIT;
    var name = isTram ? 'tram' : 'bus';
    var transitSteps = steps
        .filter(function(step){
            return step.travel_mode == "TRANSIT";
        });
    var transitDistanceS = transitSteps
        .map(function(step){
            return step.distance.value;
        }).concat(0);
    var transitDistance = transitDistanceS
        .reduce(function(value1, value2){
            return value1 + value2;
        });

    var walkingSteps = steps
        .filter(function(step){
            return step.travel_mode == "WALKING";
        });
    var walkingDistanceS = walkingSteps
        .map(function(step){
            return step.duration.value;
        }).concat(0);
    var walkingDistance = walkingDistanceS
        .reduce(function(value1, value2){
            return value1 + value2;
        });
    distances[google.maps.TravelMode.TRANSIT] = {
		duration: leg.duration.value / 60,
		distance: leg.distance.value / 1000,
		name: name,
		type: google.maps.TravelMode.TRANSIT,
		price: 6.90,
		emmissions: 101 * transitDistance / 1000,
		calories: walkingCalories(walkingDistance)
	};
	Session.set('distances', distances);
};

//Unused in Jerusalem Ver of Alternative
setDataCycling = function (response, status) {
	var distances = Session.get('distances');
	distances[google.maps.TravelMode.BICYCLING].calories = 9.45 * distances[google.maps.TravelMode.BICYCLING].duration; //9.45 calories burnt / minute
	Session.set('distances', distances);
};
