/*
var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });

const nextGame = () => {
  const now = new Date();

  let closest = Infinity;

  for (const d of dates) {
    const date = new Date(d);

    if (date >= now && (date < new Date(closest) || date < closest)) {
      closest = d;
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

exports.handler = function(event, context, callback) {
  const gameDate = nextGame();

  if (gameDate) {
    const game = db
      .get("games")

      .find({ date: gameDate })

      .value();

    if (!game) {
      const games = db
        .get("games")

        .value();

      return response.status(200).send(games);
    }

    const players = db.get("players").value();

    const unknownPlayers = [];

    const playersInOut = game.playersIn.concat(game.playersOut);

    for (player of players) {
      let found = false;

      for (playerName of playersInOut) {
        if (player.name === playerName) {
          found = true;

          break;
        }
      }

      if (!found) {
        unknownPlayers.push(player.name);
      }
    }

    game["unknownPlayers"] = unknownPlayers;

    let playersInFullData = [];

    for (player of players) {
      for (inPlayer of game.playersIn) {
        if (player.name === inPlayer) {
          playersInFullData.push(player);
        }
      }
    }

    const teams = playerSort.generateTeams(playersInFullData);

    game["teamBrown"] = teams.brownTeam;

    game["teamBlack"] = teams.blackTeam;

    return response.render("status", {
      blackPlayers: game.teamBlack,

      brownPlayers: game.teamBrown,

      playersIn: game.playersIn,

      playersOut: game.playersOut,

      playersUnknown: game.unknownPlayers
    });
  }

  callback(null, {
    statusCode: 200,
    body: "No game this week"
  });
};
*/
