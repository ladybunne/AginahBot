START TRANSACTION;

/* Update statements here */
ALTER TABLE guild_data
ADD gCalendarId VARCHAR(64);

ALTER TABLE scheduled_events
ADD gEventId VARCHAR(64);

/* Testing queries here */

/* Clean up your tests */
-- TRUNCATE TABLE newTable;

COMMIT;