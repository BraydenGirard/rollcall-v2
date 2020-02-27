var faunadb = require("faunadb"),
  q = faunadb.query;
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });

exports.handler = (event, context, callback) => {
  console.log("Function `player-read-all` invoked");
  return client
    .query(q.Paginate(q.Match(q.Ref("indexes/all_players"))))
    .then(response => {
      const playerRefs = response.data;
      console.log("Player refs", playerRefs);
      console.log(`${playerRefs.length} players found`);
      // create new query out of player refs. http://bit.ly/2LG3MLg
      const getAllplayerDataQuery = playerRefs.map(ref => {
        return q.Get(ref);
      });
      // then query the refs
      return client.query(getAllplayerDataQuery).then(ret => {
        return callback(null, {
          statusCode: 200,
          body: JSON.stringify(ret)
        });
      });
    })
    .catch(error => {
      console.log("error", error);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(error)
      });
    });
};
