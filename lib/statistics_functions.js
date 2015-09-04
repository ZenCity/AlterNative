average = function(arr, param) {
    var keys = Object.keys(arr);
    var avg = 0;
    for (var i = 0; i < keys.length; i++) {
        avg += arr[keys[i]][param];
    }
    avg = avg / keys.length;
    return avg;
};

standardDeviation = function(arr, param) {
    var keys = Object.keys(arr);
    var avg = average(arr, param);
    var variance = 0;
    for (var i = 0; i < keys.length; i++) {
        variance += Math.pow((arr[keys[i]][param] - avg), 2);
    }
    var std = Math.sqrt(variance / keys.length);
    return std;
};

standardDeviationPlusAverage = function(arr, param) {
    var keys = Object.keys(arr);
    var avg = average(arr, param);
    var variance = 0;
    for (var i = 0; i < keys.length; i++) {
        variance += Math.pow((arr[keys[i]][param] - avg), 2);
    }
    var std = Math.sqrt(variance / keys.length);
    return std + avg;
};
