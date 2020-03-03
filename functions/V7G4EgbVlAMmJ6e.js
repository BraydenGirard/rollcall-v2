var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });
const twilio = require("twilio");
const twillioClient = new twilio(
  process.env.TWILLIO_ACCOUNT_ID,
  process.env.TWILLIO_AUTH_TOKEN
);

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
  const players = await getAllFromFauna("players");

  try {
    const next = await nextGame();

    if (next) {
      for (const player of players) {
        // Remove after testing
        if (player.name === "Brayden Girard") {
          await twillioClient.messages.create({
            body: `Will you be attending hockey on ${next}, please reply with either "yes" or "no".`,

            to: player.phone, // Text this number +16134080538

            from: "+15878186820" // From a valid Twilio number
          });
        }
      }
    } else {
      for (const player of players) {
        await twillioClient.messages.create({
          body: `There will be no game this Sunday, the next game is will be the following Sunday and you will get another notification about it next week.`,

          to: player.phone, // Text this number +16134080538

          from: "+15878186820" // From a valid Twilio number
        });
      }
    }
  } catch (err) {
    console.log(err);
  }

  callback(null, {
    statusCode: 204
  });
};
