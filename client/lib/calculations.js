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
	var price = (17.3 + (element.distance.value / 1000 * 0.7834) + (element.duration.value / 60 * 0.3)).toFixed(2);
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
		duration: element.duration.value / 60 / 4,
		distance: element.distance.value / 1000,
		name: 'personalbike',
		type: google.maps.TravelMode.WALKING,
		price: price,
		emmissions: 21 * element.distance.value / 1000, //21 g CO2 / KM
		calories: 9.45 * element.duration.value / 60 / 4 //9.45 calories / KM
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
    // debugger;
    var travelMods = steps
        .filter(function(step){
            return step.instructions;
        })
        .map(function(step){
            return step.instructions.split(' ')[0];
        });
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
