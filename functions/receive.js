var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });
const twilio = require("twilio");
const twillioClient = new twilio(
  process.env.TWILLIO_ACCOUNT_ID,
  process.env.TWILLIO_AUTH_TOKEN
);
const querystring = require("querystring");

const nextGame = async () => {

    const now = new Date();

    let closest = Infinity;

    let dates = await getAllFromFauna('dates');
    for (const d of dates) {

        const date = new Date(d.date)

        if (date >= now && (date < new Date(closest) || date < closest)) {

            closest = d.date;

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

    if(now.getDay === 0 || now.getDay === 1 || now.getDay === 2 || now.getDay === 6) {

        return false;

    }

    if(!nextGame()) {

       return false;

    }

    return true;

}

const resendRollCall = async phoneNumeber => {

    try {

        const message = await twillioClient.messages.create({

            body: 'Invalid response, please reply with either "yes" or "no".',

            to: phoneNumeber,

            from: '+15878186820'

        })

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

const getAllFromFauna = async index => {
    try {
        const response = await client.query(q.Paginate(q.Match(q.Ref(`indexes/all_${index}`))));
        const playerRefs = response.data;
        const getAllPlayerDataQuery = playerRefs.map(ref => {
            return q.Get(ref);
        });
        const playerData = await client.query(getAllPlayerDataQuery);
        const data = [];
        for (const player of playerData) {
            data.push(player.data);
        }
        return data;
    } catch(error) {
        console.log(error);
        return [];
    }
}

const createGame = async game => {
    try {
        await client.query(q.Create(q.Collection("games"),{ data: game }));
    } catch(error) {
        console.log(error);
    }
}

const updateGame = async game => {
    console.log(`Function 'todo-update' invoked. update date: ${game.date}`)
    try {
        await client.query(q.Update(q.Index(`update_game_by_date`), game));
    } catch(error) {
        console.log(error);
    }
}


exports.handler = async function(event, context, callback) {
    const params = querystring.parse(event.body);
    const message = params.Body.toLowerCase().trim(); 
    const phoneNumber = params.From;

  if(!validResponseDay()) {

      await twillioClient.messages.create({

                body: `You can not check-in at this time, please message Brayden directly at 613-408-0538.`,

                to: phoneNumber,

                from: '+15878186820'

            });

      return response.status(200).send();

  }

  const players = await getAllFromFauna('players');
  let player = null;
  for(const thePlayer of players) {
      if(thePlayer.phone === phoneNumber) {
          player = thePlayer;
          break;
      }
  }

  if(!player) {
    return callback(null, {
        statusCode: 404,
        body: "Player # not found"
    });
  }

    const gameDate = await nextGame();

    const games = await getAllFromFauna('games');

    let game = null;

    for(const theGame of games) {
        if(theGame.date === gameDate) {
            game = theGame;
            break;
        }
    }

  if(message === 'yes') {

    if(!game) {
        await createGame({

            date: gameDate,

            playersIn: [player.name],

            playersOut: []

        });
    } else {

        if(playerAlreadyAnswered(game.playersIn, player)) {

            return callback(null, {
                statusCode: 200,
                body: "Response received"
            });

        }

        if(playerAlreadyAnswered(game.playersOut, player)) {

            await twillioClient.messages.create({

                body: `You have already said you are not playing this week. If your response changed, you must message Brayden directly at 613-408-0538.`,

                to: player.phone,

                from: '+15878186820'

            });

            return callback(null, {
                statusCode: 200,
                body: "Response received"
            });

        }

        game.playersIn.push(player.name);

        await updateGame(game);

    }

    await twillioClient.messages.create({

        body: `Thanks for the response. If your response changes for some reason, you must message Brayden directly at 613-408-0538.`,

        to: player.phone,

        from: '+15878186820'

    });

    // Store the player response

  } else if(message === 'no') {

    if(!game) {

        await createGame({

            date: gameDate,

            playersOut: [player.name],

            playersIn: []

        });

    } else {

        if(playerAlreadyAnswered(game.playersOut, player)) {

            return callback(null, {
                statusCode: 200,
                body: "Response received"
            });

        }

        if(playerAlreadyAnswered(game.playersIn, player)) {

            await twillioClient.messages.create({

                body: `You have already said you are playing this week. If your response changed, you must message Brayden directly at 613-408-0538.`,

                to: player.phone,

                from: '+15878186820'

            });

            return callback(null, {
                statusCode: 200,
                body: "Response received"
            });

        }

        game.playersOut.push(player.name);

        await updateGame(game);

    }

    await twillioClient.messages.create({

        body: `Thanks for the response. If your response changes for some reason, you must message Brayden directly at 613-408-0538.`,

        to: player.phone,

        from: '+15878186820'

    });

  } else {

    resendRollCall(phoneNumber);

  }

    callback(null, {
        statusCode: 200,
        body: "Response received"
    });
}
