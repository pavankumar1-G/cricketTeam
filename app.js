const express = require("express");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const { open } = require("sqlite");

// database connection process:
let database = null;
const intializingDBAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};
intializingDBAndServer();

// API's to communicate with sever and database:

//Get players by using API:

const convertDbObjectToResponseObject = (DBObject) => {
  return {
    playerId: DBObject.player_id,
    playerName: DBObject.player_name,
    jerseyNumber: DBObject.jersey_number,
    role: DBObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersListWithQuery = `
    SELECT *
    FROM
    cricket_team;
    `;
  const playersListArray = await database.all(getPlayersListWithQuery);
  response.send(
    playersListArray.map((each_player) =>
      convertDbObjectToResponseObject(each_player)
    )
  );
});

// Add player by using API:

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlayerWithQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    (
        "${playerName}",
        ${jerseyNumber},
        "${role}"
    );
    `;
  await database.run(addPlayerWithQuery);
  response.send("Player Added to Team");
});

// Get player by using API:

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerWithQuery = `
    SELECT *
    FROM 
    cricket_team
    WHERE
    player_id = ${playerId};
    `;
  const playerDetails = await database.get(getPlayerWithQuery);

  response.send(convertDbObjectToResponseObject(playerDetails));
});

//Update player details by using API:

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsWithQuery = `
    UPDATE
      cricket_team
    SET
      player_name = "${playerName}",
      jersey_number = ${jerseyNumber},
      role = "${role}"
    WHERE
      player_id = ${playerId};
    `;
  await database.run(updatePlayerDetailsWithQuery);
  response.send("Player Details Updated");
});

// Delete player details by using API:

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetailsWithSqlQuery = `
    DELETE
    FROM
    cricket_team
    WHERE
    player_id = ${playerId};

    `;
  await database.run(deletePlayerDetailsWithSqlQuery);
  response.send("Player Removed");
});

module.exports = app;
