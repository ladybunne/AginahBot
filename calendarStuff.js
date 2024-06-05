const { google } = require('googleapis');
const config = require('./config.json');

/**
 * A brief style note: I'm using the promise variant of the Google Calendar
 * API because I can't figure out how to get the callback version to play
 * nicely with async/await. I'm not super attached to this style, but it
 * works well enough for now. If I learn better ways I'll tidy it up then.
 */

// Some rabbit crimes. Will fix this later.
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

// Create a new JWT client.
const jwtClient = new google.auth.JWT(
  config.google_api_client_email,
  null,
  config.google_api_private_key,
  ['https://www.googleapis.com/auth/calendar'],
  null,
);
const calendarAPI = google.calendar({ version: 'v3', auth: jwtClient });

// Default ACL rule for making a calendar public (no need to redefine it each function call).
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

// Some boilerplate to handle promise errors.
function defaultCalendarError(err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return "";
}

// Create a calendar and make it public.
async function createCalendar(name) {
    var calendarId;

    // Create the calendar
    await calendarAPI.calendars.insert({
        auth: jwtClient,
        resource: { "summary": name }
    }).then((result) => {
        // Extract the calendar ID
        // console.log("Calendar created: ", result.data);
        calendarId = result.data.id;
    }, defaultCalendarError);

    // Use the calendar ID to make the calendar public
    await calendarAPI.acl.insert({
        auth: jwtClient,
        calendarId: calendarId,
        resource: aclRule
    }).then(() => {}, defaultCalendarError);

    return calendarId;
}

// Delete a calendar.
async function deleteCalendar(id) {
    var outcome = false;

    await calendarAPI.calendars.delete({
        auth: jwtClient,
        calendarId: id
    }).then(() => {
        outcome = true;
    }, defaultCalendarError);

    return outcome;
}

// Add an event.
async function addEvent(calendarId, name, host, role, targetDate, duration) {

    // Description string.
    const locationString = `${role ? `Type: ${role}\n` : ""}`;

    // Date magic!
    const relevantDuration = (duration) ? duration : 2;

    var event = {
        summary: name,
        location: locationString,
        description: `Host: ${host}`,
        start: {
            dateTime: targetDate.toISOString(),
        },
        end: {
            dateTime: targetDate.addHours(relevantDuration).toISOString(),
        },
    };

    // console.log(event);

    await calendarAPI.events.insert({
        calendarId: calendarId,
        resource: event
    }).then((result) => {
        console.log(result.data);
    }, defaultCalendarError);
}

async function rescheduleEvent() {

}

async function cancelEvent(calendarId, eventId) {

    await calendarAPI.events.delete({
        calendarId: calendarId,
        eventId: eventId
    }).then(() => {}, defaultCalendarError);
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

async function listCalendars() {
    var idList;

    await calendarAPI.calendarList.list({
        auth: jwtClient
    }).then((result) => {
        for (const calendar of result.data.items) {
            console.log(`${calendar.summary}: ${createLinkFromCalendarId(calendar.id)}`);
        }
        idList = result.data.items.map((calendar) => calendar.id);
    }, defaultCalendarError);

    return idList;
}

async function listEvents(calendarId) {
    var idList;

    await calendarAPI.events.list({
        auth: jwtClient,
        calendarId: calendarId
    }).then((result) => {
        for (const event of result.data.items) {
            console.log(event);
        }
        idList = result.data.items.map((event) => event.id);
        return idList;
    }, defaultCalendarError);

    return idList;
}

async function main() {

    // addEvent("your calendar id here",
    //     "The Rabbit Crimes 1.5", "Ladybunne", "LFG Themed (Unsupported)", new Date(1717714800 * 1000), null
    // );

    // var idList = await listCalendars();

    // Delete all calendars. Use with extreme caution.
    // for (const id of idList) {
    //     deleteCalendar(id);
    // }

    // Delete all events in a specified calendar.
    // const calendarId = "your calendar id here";
    // var idList = await listEvents(calendarId);
    // for(const id of idList) {
    //     console.log(id);
    //     await cancelEvent(calendarId, id);
    // }
}

main();

exports.createLinkFromCalendarId = createLinkFromCalendarId;
exports.createCalendar = createCalendar;
exports.deleteCalendar = deleteCalendar;
