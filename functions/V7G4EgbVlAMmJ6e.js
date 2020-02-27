/*
var faunadb = require('faunadb'),
  q = faunadb.query
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET })
const twilio = require('twilio');
const client = new twilio(process.env.TWILLIO_ACCOUNT_ID, process.env.TWILLIO_AUTH_TOKEN);

exports.handler = function(event, context, callback) {
    const theDbPlayers = db.get("players").value();

    try {

        const next = nextGame();

        if(next) {

            for(const player of players) {

                await client.messages.create({

                    body: `Will you be attending hockey on ${next}, please reply with either "yes" or "no".`,

                    to: player.phone,  // Text this number +16134080538

                    from: '+15878186820' // From a valid Twilio number

                });

            }

        } else {

            for(const player of players) {

                await client.messages.create({

                    body: `There will be no game this Sunday, the next game is will be the following Sunday and you will get another notification about it next week.`,

                    to: player.phone,  // Text this number +16134080538

                    from: '+15878186820' // From a valid Twilio number

                });

            }

        }
    } catch(err) {

        console.log(err);

    }

    callback(null, {
        statusCode: 200,
        body: "Rollcall sent"
    });
};
*/
