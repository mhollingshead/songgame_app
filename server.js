var express = require('express');
var socket = require('socket.io');
var app = express();
app.set('port', (process.env.PORT || 5000));
var server = app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
var io = socket(server);

var rooms = [];

app.use(express.static('public'));

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log("A user connected (" + socket.id + ")");

  socket.on('create', function(data) {
    socket.join(data.id);
    console.log(data.id);
    rooms.push(data.id);
    var player = newPlayer(data);
    newGame(data, player);
    data = {
      "id": data.id,
      "name": data.name,
      "game": getGameById(data.id)
    };
    io.to(data.id).emit('joined', data);
  });

  socket.on('join', function(data) {
    if (rooms.includes(data.id.toString())) {
      socket.join(data.id);
      var player = newPlayer(data);
      addToGame(data, player);
      data = {
        "id": data.id,
        "name": data.name,
        "game": getGameById(data.id)
      };
      io.to(data.id).emit('joined', data);
    }
    else {
      console.log("Room code not found");
      console.log(rooms);
      console.log(room);
    }
  });

  socket.on('init round', function(room) {
    var game = getGameById(room);

    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i] === room) {
        rooms.splice(i, 1);

        game.curRound += 1;
        game.songChoice += 1;
        game.diffChoice += 1;

        if (game.songChoice === game.numPlayers) {
          game.songChoice = 0;
        }
        if (game.diffChoice === game.numPlayers) {
          game.diffChoice = 0;
        }

        io.to(room).emit('round', game);

        for (var j = 0; j < games.length; j++) {
          if (games[j].id === game.id) {
            games[j] = game;
          }
        }
      }
    }
    if (game.players[0].roundPoints[0]) {
      game.curRound += 1;

      if ((game.songChoice+1) === game.players.length) {
        game.songChoice = 0
      }
      else {
        game.songChoice += 1;
      }
      if ((game.diffChoice+1) === game.players.length) {
        game.diffChoice = 0
      }
      else {
        game.diffChoice += 1;
      }
      io.to(room).emit('round', game);
    }
  });

  socket.on('get song', function(data) {
    var game = getGameById(data.id);

    for (var j = 0; j < games.length; j++) {
      if (games[j].id === game.id) {
        games[j].curSong = data;
        io.to(data.id).emit('select difficulty', game);
      }
    }
  });

  socket.on('start game', function(data) {
    var game = getGameById(data.id);
    console.log("Start game ID: " + data.id);

    for (var j = 0; j < games.length; j++) {
      if (games[j].id === game.id) {
        games[j] = data;
        io.to(data.id).emit('start sipping', games[j]);
      }
    }
  });

  socket.on('end game', function(data) {

    var game = getGameById(data.id);

    for (var j = 0; j < games.length; j++) {
      if (games[j].id === game.id) {
        games[j] = data;
        var game = games[j];
      }
    }

    io.to(data.id).emit('update endgame', data);

    var count = 0;

    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].roundScores[game.curRound-1]) {
        count++;
      }
    }

    if (count === game.numPlayers) {

      for (var m = 0; m < game.players.length; m++) {
        if (game.players[m].roundScores[game.curRound-1].percent > 100) {
          game.players[m].roundPoints.push(0);
        }
        else {
          game.players[m].roundPoints.push(game.players[m].roundScores[game.curRound-1].percent);
          game.players[m].points += game.players[m].roundScores[game.curRound-1].percent;

          if ((game.players[m].roundScores[game.curRound-1].percent > 90) && (game.players[m].roundScores[game.curRound-1].percent <= 100)) {
            game.players[m].points += Math.floor(0.5*game.players[m].roundScores[game.curRound-1].totalSips);
          }
        }
      }

      for (var j = 0; j < games.length; j++) {
        if (games[j].id === game.id) {
          games[j] = game;
          io.to(data.id).emit('confirm end', games[j]);
        }
      }
    }
  });
}

/* Game Data */

var games = [];

function newPlayer(data) {
  var player = {
    "gameId": data.id,
    "name": data.name,
    "roundScores": [],
    "roundPoints": [],
    "points": 0
  }
  return player;
}

function newGame(data, player) {
  var game = {
    "id": data.id,
    "players": [player],
    "numPlayers": 1,
    "songChoice": -1,
    "diffChoice": -1,
    "curSong": {},
    "curRound": 0,
    "curLetter": "-"
  }
  games.push(game);
}

function addToGame(data, player) {
  var id = data.id;
  var game = getGameById(id);

  game.players.push(player);
  game.numPlayers++;
  if (game.diffChoice === -1) {
    game.diffChoice++;
  }
}

function getGameById(id) {
  for (var i = 0; i < games.length; i++) {
    if (games[i].id === id) {
      return games[i];
    }
  }
}
