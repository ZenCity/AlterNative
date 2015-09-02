findClosestPoint = function(lat, lon, listOfPoints) {
    var minDistance = Infinity;
    var distance;
    for (var i = 0; i < listOfPoints.length; i++) {
        distance = Math.pow(listOfPoints[i][0] - lat, 2) + Math.pow(listOfPoints[i][1] - lon, 2);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = listOfPoints[i];
        }
    }
    return closestPoint;
};

cutGeoJson = function(lon, lat, feature) {
    var coordinates = feature['geometry']['coordinates'];
    var closestPoint = findClosestPoint(lon, lat, coordinates);
    var relevantCoordinates = [];
    for (var i = 0; i <= coordinates.length; i++) {
        relevantCoordinates.push(coordinates[i]);
        if (coordinates[i] == closestPoint) {
            break;
        }
    }
    feature['geometry']['coordinates'] = relevantCoordinates;
};

cutGeoJsonFromTo = function(lon_start, lat_start, lon_end, lat_end, feature) {
    var coordinates = feature['geometry']['coordinates'];
    var closestPoint_start = findClosestPoint(lon_start, lat_start, coordinates);
    var closestPoint_end = findClosestPoint(lon_end, lat_end, coordinates);
    var relevantCoordinates = [];
    var record_route = false;
    for (var i = 0; i <= coordinates.length; i++) {
        if (coordinates[i] == closestPoint_start) {
            record_route = true;
        }
        if (record_route) {
            relevantCoordinates.push(coordinates[i]);
        }
        if (coordinates[i] == closestPoint_end) {
            break;
        }
    }
    feature['geometry']['coordinates'] = relevantCoordinates;
};
