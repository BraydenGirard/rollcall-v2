var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });

const getAllFromFauna = async index => {
  try {
    const response = await client.query(
      q.Paginate(q.Match(q.Ref(`indexes/all_${index}`)))
    );
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
  } catch (error) {
    console.log(error);
    return [];
  }
};

const nextGame = async () => {
  const now = new Date();
  now.setHours( now.getHours() - 4 );
  console.log(now.toUTCString())
  let closest = Infinity;
  let dates = await getAllFromFauna("dates");
  for (const d of dates) {
    const date = new Date(d.date);

    if (date >= now && (date < new Date(closest) || date < closest)) {
      closest = d.date;
    }
  }

  const closestDate = new Date(closest);

  const diffInTime = closestDate.getTime() - now.getTime();

  const diffInDays = diffInTime / (1000 * 3600 * 24);

  if (diffInDays > 8) {
    return null;
  }

  return closest;
};

exports.handler = async function(event, context, callback) {
  const gameDate = await nextGame();
  console.log(gameDate)
  if (gameDate) {
    const games = await getAllFromFauna("games");
    console.log(games);
    let game = null;

    for (const theGame of games) {
      if (theGame.date === gameDate) {
        game = theGame;
        break;
      }
    }

    if (!game) {
      return callback(null, {
        statusCode: 200,
        body: games
      });
    }

    const players = await getAllFromFauna("players");

    const unknownPlayers = [];
    const playersIn = [];
    const playersOut = [];

    for (player of players) {
      let found = false;

      for (playerName of game.playersIn) {
        if (player.name === playerName) {
          found = true;
          if(playersIn.length == 0) {
              playersIn.push('<br>' + player.name + ' (' + player.phone + ')<br>');
          } else {
            playersIn.push('<br>' + player.name + ' (' + player.phone + ')<br>');
          }
          break;
        }
      }

      if (!found) {
        for (playerName of game.playersOut) {
          if (player.name === playerName) {
            found = true;
            if(playersOut.length == 0) {
              playersOut.push('<br>' + player.name + ' (' + player.phone + ')<br>');
            } else {
              playersOut.push(player.name + ' (' + player.phone + ')<br>');
            }
            break;
          }
        }
        if (!found) {
          if(unknownPlayers.length == 0) {
              unknownPlayers.push('<br>' + player.name + ' (' + player.phone + ')<br>');
          } else {
            unknownPlayers.push('<br>' + player.name + ' (' + player.phone + ')<br>');
          }
        }
      }
    }    

    return callback(null, {
      headers: {
        "Content-Type": "text/html"
      },
      statusCode: 200,
      body:
        "<strong>Players In:</strong> " +
        playersIn.toString().replace(/,/g, ", ") +
        "<br><strong>Players Out:</strong> " +
        playersOut.toString().replace(/,/g, ", ") +
        "<br><strong>Players Unknown:</strong> " +
        unknownPlayers.toString().replace(/,/g, ", ")
    });
  }

  callback(null, {
    headers: {
      "Content-Type": "text/html"
    },
    statusCode: 200,
    body: "<h1>No game this week!</h1>"
  });
};
