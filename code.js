var fs = require('fs');

var config = require("./config");

var request = require('request');
var PushBullet = require('pushbullet');
var pusher = new PushBullet(config.pushbulletToken);


var headers = {
    'Origin': 'https://fp.trafikverket.se',
    'Accept-Language': 'sv-SE,sv;q=0.8,en-US;q=0.6,en;q=0.4,sq;q=0.2',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Referer': 'https://fp.trafikverket.se/Boka/',
    'X-Requested-With': 'XMLHttpRequest',
    'Connection': 'keep-alive',
    'DNT': '1',
    'Cookie': 'FpsExternalIdentity=' + config.FpsExternalIdentity
};

var dataString = {
    "bookingSession": {
        "socialSecurityNumber": config.socialSecurityNumber,
        "licenceId": 5,
        "bookingModeId": 0,
        "ignoreDebt": false,
        "examinationTypeId": 0
    },
    "occasionBundleQuery": {
        "startDate": new Date(Date.now()).toISOString(),
        "languageId": 13,
        "vehicleTypeId": 2,
        "tachographTypeId": 1,
        "occasionChoiceId": 1,
        "examinationTypeId": 0
    }
};


var locationSettings = [
    // Lund
    {
        'city': "Lund",
        'locationId': 1000062,
        'lastSavedDate': null,
        'firstLoad': true
    },
    // Eslöv
    {
        'city': "Eslov",
        'locationId': 1000065,
        "lastSavedDate": null,
        'firstLoad': true
    },
    // Malmö
    {
        'city': "Malmö",
        'locationId': 1000061,
        "lastSavedDate": null,
        'firstLoad': true
    },
    {
        'city': "Trelleborg",
        'locationId': 1000063,
        "lastSavedDate": null,
        'firstLoad': true
    },
    {
        'city': "Landskrona",
        'locationId': 1000124,
        "lastSavedDate": null,
        'firstLoad': true
    },
    {
        'city': "Ystad",
        'locationId': 1000064,
        "lastSavedDate": null,
        'firstLoad': true
    },
    {
        'city': "Kristianstad",
        'locationId': 1000046,
        "lastSavedDate": null,
        'firstLoad': true
    }
];

function schedule() {
    consoleLog("Running schedule");
    locationSettings.forEach(function (element, index) {
        var tempDataString = dataString;
        // Set the id for the query
        tempDataString.occasionBundleQuery.locationId = element.locationId;
        var city = null;
        var time = null;
        var options = {
            url: 'https://fp.trafikverket.se/Boka/occasion-bundles',
            method: 'POST',
            headers: headers,
            body: JSON.stringify(tempDataString)
        };


        request(options, function (error, response, body) {
            body = JSON.parse(body);
            // Successful connection without errors
            if (!error && response.statusCode == 200 && Array.isArray(body.data) && body.data.length > 0) {

                // The fist array is always the one that is nearest in time
                var responseNearestDateWrittenTest = new Date(body.data[0].occasions[0].date + " " + body.data[0].occasions[0].time);
                var responseNearestDatePracticalTest = new Date(body.data[0].occasions[1].date + " " + body.data[0].occasions[1].time);

                // Set the nearest date to the lowest of the two dates set above
                var responseNearestDate = (responseNearestDatePracticalTest <= responseNearestDateWrittenTest ? responseNearestDatePracticalTest : responseNearestDateWrittenTest);

                var lastSavedDate = null;
                if (element.lastSavedDate !== null) {
                    lastSavedDate = new Date(element.lastSavedDate);
                }

                //there is a new time that is closer than the previous date or lastdate is not set()
                // Time from API must be nearer than the time we have stored. lastSavedDate is null when the program initially starts
                if (responseNearestDate < lastSavedDate || lastSavedDate === null) {
                    element.lastSavedDate = responseNearestDate.toUTCString();

                    // No push should be sent in the beginning as it is not necessary.
                    if (element.firstLoad === false) {
                        // send push to pushbullet
                        pushToPushbullet(element.city, responseNearestDate.toUTCString());
                        consoleLog("Pushed to pushbullet for city " + element.city);
                    }
                    else {
                        consoleLog("First load, not sending push");
                        element.firstLoad = false;
                    }
                }
            }
            else if (error) {
                consoleLog("Something went wrong. See console for more info. ");
                console.error(error);
            }
        });

    });

}


function pushToPushbullet(city, time) {
    pusher.note("", "Ny tid för " + city, "Tid: " + time);
}


function consoleLog(text) {
    console.log(new Date(Date.now()).toUTCString() + ": " + text)
}


function schedule2() {
    consoleLog("First start or restart due to error")
    console.log(locationSettings);
    schedule();
}

var minutes = config.intervalMinutes;
var the_interval = minutes * 60 * 1000;
schedule();
setInterval(schedule2, the_interval);
