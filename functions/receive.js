/*
var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });
const twilio = require("twilio");
const client = new twilio(
  process.env.TWILLIO_ACCOUNT_ID,
  process.env.TWILLIO_AUTH_TOKEN
);

const nextGame = () => {

    const now = new Date();

    let closest = Infinity;

    for (const d of dates) {

        const date = new Date(d)

        if (date >= now && (date < new Date(closest) || date < closest)) {

            closest = d;

        }

    }

    const closestDate = new Date(closest);

    const diffInTime = closestDate.getTime() - now.getTime(); 

    const diffInDays = diffInTime / (1000 * 3600 * 24); 

    if(diffInDays > 8) {

        return null;   

    }

    return closest

}



const validResponseDay = () => {

    const now = new Date();

    if(now.getDay === 0 || now.getDay === 1 || now.getDay === 2) {

        return false;

    }

    if(!nextGame()) {

       return false;

    }

    return true;

}

const resendRollCall = async phoneNumeber => {

    try {

        const message = await client.messages.create({

            body: 'Invalid response, please reply with either "yes" or "no".',

            to: phoneNumeber,  // Text this number +16134080538

            from: '+15878186820' // From a valid Twilio number

        })

        console.log(message)

    } catch(err) {

        console.log(err)

    }

}

const playerAlreadyAnswered = (playersChecked, player) => {

    for(const playerChecked of playersChecked) {

        if(playerChecked === player.name) {

            return true

        }

    }

    return false

}


exports.handler = function(event, context, callback) {

const message = request.body.Body.toLowerCase().trim();

  const phoneNumber = request.body.From;

  if(!validResponseDay()) {

      await client.messages.create({

                body: `You can not check-in at this time, please message Brayden directly at 613-408-0538.`,

                to: phoneNumber,  // Text this number +16134080538

                from: '+15878186820' // From a valid Twilio number

            });

      return response.status(200).send();

  }

  const player = db.get('players')

    .find({ phone: phoneNumber })

    .value();

  if(!player) {

    console.log(`The person with the number ${phoneNumber} is not in the database as a player`);

    return response.status(200).send();

  }

    const gameDate = nextGame();

    const game = db.get('games')

    .find({ date: gameDate })

    .value();

  if(message === 'yes') {

    if(!game) {

        db.get('games')

        .push({

            date: gameDate,

            playersIn: [player.name],

            playersOut: []

        })

        .write();

    } else {

        if(playerAlreadyAnswered(game.playersIn, player)) {

            return response.status(200).send();

        }

        if(playerAlreadyAnswered(game.playersOut, player)) {

            await client.messages.create({

                body: `You have already said you are not playing this week. If your response changed, you must message Brayden directly at 613-408-0538.`,

                to: player.phone,  // Text this number +16134080538

                from: '+15878186820' // From a valid Twilio number

            });

            return response.status(200).send();

        }

        game.playersIn.push(player.name);

        db.get('games')

        .find({ date: gameDate })

        .update('playersIn', game.playersIn)

        .write();

    }

    await client.messages.create({

        body: `Thanks for the response. If your response changes for some reason, you must message Brayden directly at 613-408-0538.`,

        to: player.phone,  // Text this number +16134080538

        from: '+15878186820' // From a valid Twilio number

    });

    // Store the player response

  } else if(message === 'no') {

    if(!game) {

        db.get('games')

        .push({

            date: gameDate,

            playersIn: [],

            playersOut: [player.name]

        })

        .write();

    } else {

        if(playerAlreadyAnswered(game.playersOut, player)) {

            return response.status(200).send();

        }

        if(playerAlreadyAnswered(game.playersIn, player)) {

            await client.messages.create({

                body: `You have already said you are playing this week. If your response changed, you must message Brayden directly at 613-408-0538.`,

                to: player.phone,  // Text this number +16134080538

                from: '+15878186820' // From a valid Twilio number

            });

            return response.status(200).send();

        }

        game.playersOut.push(player.name);

        db.get('games')

        .find({ date: gameDate })

        .update('playersOut', game.playersOut)

        .write();

    }

    await client.messages.create({

        body: `Thanks for the response. If your response changes for some reason, you must message Brayden directly at 613-408-0538.`,

        to: player.phone,  // Text this number +16134080538

        from: '+15878186820' // From a valid Twilio number

    });

  } else {

    resendRollCall(phoneNumber);

  }

    callback(null, {
        statusCode: 200,
        body: "Response received"
    });
}
*/
