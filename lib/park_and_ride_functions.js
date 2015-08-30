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
    var coordinates = feature['features'][0]['geometry']['coordinates'];
    var closestPoint = findClosestPoint(lon, lat, coordinates);
    var relevantCoordinates = [];
    for (var i = 0; i <= coordinates.length; i++) {
        relevantCoordinates.push(coordinates[i]);
        if (coordinates[i] == closestPoint) {
            break;
        }
    }
    feature['features'][0]['geometry']['coordinates'] = relevantCoordinates;
};
