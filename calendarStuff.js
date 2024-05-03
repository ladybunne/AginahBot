const { google } = require('googleapis');
const config = require('./config.json');
const { calendar } = require('googleapis/build/src/apis/calendar');

// create new JWT client
const jwtClient = new google.auth.JWT(
  config.google_api_client_email,
  null,
  config.google_api_private_key,
  ['https://www.googleapis.com/auth/calendar'],
  null,
);
const calendarAPI = google.calendar({ version: 'v3', auth: jwtClient });

// Default ACL rule for making a calendar public (no need to redefine it each function call)
const aclRule = {
    scope: {
        type: "default"
    },
    role: "reader",
};

// Produces a nicely-formatted string link to a calendar, given its id.
function createLinkFromCalendarId(id) {
    return `https://calendar.google.com/calendar/embed?src=${id.replace("@", "%40")}`;
}

// Create a calendar and make it public.
// TODO take a guild id and use it for database stuff
// TODO put the calendar id in the database
function createCalendar(name) {
    // Calendar resource data
    const newCalendarData = {
        "summary": name
    };

    // Create the calendar
    calendarAPI.calendars.insert({
        auth: jwtClient,
        resource: newCalendarData
    }, function(err, result) {
        if(err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log("Calendar created: ", result.data);
        const calendarId = result.data.items[0].id;

        // Make the calendar public with ACL
        calendarAPI.acl.insert({
            auth: jwtClient,
            calendarId: calendarId,
            resource: aclRule
        }, function(err, result) {
            if(err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log("Here is the thing you wanted. ", result.data);
        });
    });
}


function deleteCalendar() {

}

function addEvent() {

}

function rescheduleEvent() {

}

function cancelEvent() {

}

// function addEvent(name, location, description, startTime, endTime) {
//   const event = {
//     'summary': name,
//     'location': location,
//     'description': description,
//     'start': {
//       'dateTime': startTime,
//     },
//     'end': {
//       'dateTime': endTime,
//     },
//   };
//   calendar.events.insert({
//     auth: jwtClient,
//     calendarId: config.calendarId,
//     resource: event,
//   }, function(err, result) {
//     if (err) {
//       console.log('There was an error contacting the Calendar service: ' + err);
//       return;
//     }
//     console.log('Event created: %s', result.data.htmlLink);
//   });
// }



// var calendarId;

// calendarAPI.calendarList.list({
//     auth: jwtClient
// }, function(err, result) {
//     if(err) {
//         console.log('There was an error contacting the Calendar service: ' + err);
//         return;
//     }
//     console.log("Here is the thing you wanted. ", result.data);
//     calendarId = result.data.items[0].id;
//     console.log(createLinkFromCalendarId(calendarId));
// });

// calendar_api.acl.list({
//     auth: jwtClient,
//     calendarId: calendarId,
// }, function(err, result) {
//     if(err) {
//         console.log('There was an error contacting the Calendar service: ' + err);
//         return;
//     }
//     console.log("Here is the thing you wanted. ", result.data);
// });




// createCalendar("Test Calendar");