findClosestPoint = function(lat, lon, listOfPoints) {
    var minDistance = Infinity;
    var distance;
    for (var i = 0; i < listOfPoints.length; i++) {
        var distance = Math.pow(listOfPoints[i][0] - lat, 2) + Math.pow(listOfPoints[i][1] - lon, 2);
        if (distance < minDistance) {
            if (minDistance != Infinity) {
                if (Math.abs(distance - minDistance) < 2.5e-8) {
                    return closestPoint;
                }
            }
            minDistance = distance;
            closestPoint = listOfPoints[i];
            index = i;
        }
    }
    console.log("Closest point is: " + closestPoint + " " + index);
    return closestPoint;
};

findClosestPointIndex = function(lat, lon, listOfPoints) {
    var minDistance = Infinity;
    var distance;
    for (var i = 0; i < listOfPoints.length; i++) {
        var distance = Math.pow(listOfPoints[i][0] - lat, 2) + Math.pow(listOfPoints[i][1] - lon, 2);
        if (distance < minDistance) {
            if (minDistance != Infinity) {
                if (Math.abs(distance - minDistance) < 2.5e-8) {
                    return closestPointIndex;
                }
            }
            minDistance = distance;
            closestPointIndex = i;
        }
    }
    console.log("Closest point index is: " + closestPointIndex + " " + i);
    return closestPointIndex;
};

cutGeoJson = function(lon, lat, feature) {
    var coordinates = feature['geometry']['coordinates'];
    var closestPoint = findClosestPoint(lon, lat, coordinates);
    var indexOfClosestPoint = findClosestPointIndex(lon, lat, coordinates);
    var relevantCoordinates = [];
    relevantCoordinates = coordinates.slice(0, indexOfClosestPoint+1);
    console.log(closestPoint, indexOfClosestPoint, relevantCoordinates);
    feature['geometry']['coordinates'] = relevantCoordinates;
    // A hack to add to the simplified geojson the station as the last point, so the it will draw it correctly
    // without this hack a part of the line might be missing.
    feature['geometry']['coordinates'].push([lon, lat]);
    // end of hack <eoh>
    return feature;
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
