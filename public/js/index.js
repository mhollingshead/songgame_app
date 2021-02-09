var socket;
var game;
var sips;

//socket = io.connect('http://localhost:3000');
socket = io.connect('/');

function hostGame(name) {
  if (document.getElementById("host_name").value === "") {
    document.getElementById("host_name").style.border = "1px solid #ff4060";
    return;
  }
  var gameId = Math.floor(1000 + Math.random() * 9000).toString();
  var data = {
    id: gameId,
    name: name
  }
  room = data.id;
  player_name = data.name;
  console.log("New game created with ID " + data.id);

  socket.emit('create', data);
  host = true;
  transition();
  awaitPlayers();
}

function joinGame(roomCode, name) {
  if (document.getElementById("player_name").value === "" && document.getElementById("room_code").value === "") {
    document.getElementById("player_name").style.border = "1px solid #ff4060";
    document.getElementById("room_code").style.border = "1px solid #ff4060";
    return;
  }
  if (document.getElementById("player_name").value === "") {
    document.getElementById("player_name").style.border = "1px solid #ff4060";
    return;
  }
  if (document.getElementById("room_code").value === "") {
    document.getElementById("room_code").style.border = "1px solid #ff4060";
    return;
  }

  var data = {
    id: roomCode.toString(),
    name: name
  }
  room = data.id;
  player_name = data.name;
  socket.emit('join', data);
  host = false;
  transition();
  awaitPlayers();
}


function startGame() {
  socket.emit('init round', room);
}

function sendSong() {
  song_data.id = game.id;
  socket.emit('get song', song_data);
}

function playGame() {
  if (game.curLetter === "-") {
    document.getElementById("error1").style.display = "block";
  }
  else {
    socket.emit('start game', game);
  }
}

function sip() {
  sips++;

  if (sips === 1) {
    document.getElementById("grammar").innerHTML = "sip";
  }
  else {
    document.getElementById("grammar").innerHTML = "sips";
  }
  document.getElementById("sip_count").innerHTML = sips;
}

function endRound() {

  document.getElementById("waiting_to_end").style.display = "block";
  document.getElementById("end_round_button").style.display = "none";

  var count=0;

  for (var i = 0; i < game.curSong.letters.length; i++) {
    if (game.curSong.letters[i] === game.curLetter) {
      count++;
    }
  }

  var score_data = {
    'sips': sips,
    'percent': Math.floor((sips/count)*100),
    'totalSips': count
  }

  var tmp;

  for (var j = 0; j < game.players.length; j++) {
    if (game.players[j].name === player_name) {
      game.players[j].roundScores.push(score_data);
      console.log(game.players);
    }
  }

  socket.emit('end game', game);
}

function nextRound() {
  socket.emit('init round', game.id);
}


socket.on('joined', function(data) {
  game = data.game;

  console.log(data.name + " joined room " + data.id);

  document.getElementById('lobby').innerHTML = "";

  for (var i = 0; i < data.game.numPlayers; i++) {
    var div = document.createElement('div');
    var text = document.createTextNode(data.game.players[i].name);

    if (i === 0) {
      console.log("Host");
      var div2 = document.createElement('div');
      var text2 = document.createTextNode('✸');
      div2.classList.add('star');
      div2.appendChild(text2);
      div.appendChild(div2);
    }

    div.appendChild(text);
    div.classList.add('lobby_name');

    document.getElementById('lobby').appendChild(div);
  }
  document.getElementById("waiting_for").innerHTML = game.players[0].name;
});

socket.on('round', function(game_data) {
  if (game_data.curRound > 1) {
    document.getElementsByClassName("slide")[cur_slide].classList.remove("in");
    document.getElementsByClassName("slide")[cur_slide].classList.add("out");
    document.getElementById("round").innerHTML = game.curRound+1;

    for (var i = 2; i < document.getElementsByClassName("slide")-1; i++) {
      document.getElementsByClassName[i].classList = "slide hidden";
    }
    cur_slide = 1;
    transition();
  }
  else {
    transition();
    document.getElementById("logo_section").classList.add("out");
  }
  game = game_data;
  if (player_name === game.players[game.songChoice].name) {
    document.getElementById("choose_song").style.display = "block";
    document.getElementById("await_choice").style.display = "none";
  }
  else {
    document.getElementById("choose_song").style.display = "none";
    document.getElementById("await_choice").style.display = "block";
    document.getElementById("await_choice_name").innerHTML = game.players[game.songChoice].name;
    getScoreBoard(game_data);
  }

  sips = 0;
  document.getElementById("sip_count").innerHTML = "0";
  document.getElementById("waiting_to_end").style.display = "none";
  document.getElementById("end_round_button").style.display = "block";
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
});

socket.on('select difficulty', function(game_data) {
  game = game_data;
  transition();
  getLetters();

  var i;
  for (i = 0; i < document.getElementsByClassName("artwork").length; i++) {
    document.getElementsByClassName("artwork")[i].src = game.curSong.artwork;
    if (game.curSong.artwork === "") {
      document.getElementsByClassName("artwork")[i].src = "https://www.tunefind.com/i/album-art-empty.png";
    }
  }
  for (i = 0; i < document.getElementsByClassName("title_text").length; i++) {
    document.getElementsByClassName("title_text")[i].innerHTML = game.curSong.title;
  }
  for (i = 0; i < document.getElementsByClassName("artist_text").length; i++) {
    document.getElementsByClassName("artist_text")[i].innerHTML = game.curSong.artist;
  }

  if (player_name === game.players[game.diffChoice].name) {
    document.getElementById("choose_difficulty").style.display = "block";
    document.getElementById("await_difficulty").style.display = "none";
  }
  else {
    document.getElementById("choose_difficulty").style.display = "none";
    document.getElementById("await_difficulty").style.display = "block";
    document.getElementById("await_difficulty_name").innerHTML = game.players[game.diffChoice].name;
    getScoreBoard(game_data);
  }
});

socket.on('start sipping', function(game_data) {
  transition();
  game = game_data;
  sips = 0;
  document.getElementById("letter_disp").innerHTML = game.curLetter;
});

socket.on('update endgame', function(game_data) {
  game = game_data;
});

socket.on('confirm end', function(game_data) {
  console.log(game_data);
  game = game_data;
  var player;

  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].name === player_name) {
      player = game.players[i];
    }
  }

  var round_ind = game.curRound-1;

  document.getElementById("your_score").innerHTML = player.roundScores[round_ind].percent+"%";
  var score = player.roundScores[round_ind].percent;
  document.getElementById("sipped").innerHTML = player.roundScores[round_ind].sips;
  document.getElementById("real_sips").innerHTML = player.roundScores[round_ind].totalSips;
  document.getElementById("percent_off").innerHTML = (score - 100) + "%";

  var sc = document.getElementById("your_score");
  var sps = document.getElementById("sipped");
  var po = document.getElementById("percent_off");

  if (score < 65) {
    sc.style.color = "#ff4060";
    sps.style.color = "#ff4060";
    po.style.color = "#ff4060";
  }
  else if (score < 90) {
    sc.style.color = "#f2b600";
    sps.style.color = "#f2b600";
    po.style.color = "#f2b600";
  }
  else if (score < 101) {
    sc.style.color = "#1fcf2e";
    sps.style.color = "#1fcf2e";
    po.style.color = "#1fcf2e";
  }
  else {
    sc.style.color = "#ff4060";
    sps.style.color = "#ff4060";
    po.style.color = "#ff4060";
  }

  if (game.songChoice+1 === game.players.length) {
    document.getElementById("wait_for_round").innerHTML = game.players[0].name;
  }
  else {
    document.getElementById("wait_for_round").innerHTML = game.players[game.songChoice+1].name;
  }

  if (game.songChoice+1 === game.players.length) {
    if (player_name === game.players[0].name) {
      document.getElementById("waiting_for_round").style.display = "none";
      document.getElementById("final_end_round_button").style.display = "block";
    }
    else {
      document.getElementById("waiting_for_round").style.display = "block";
      document.getElementById("final_end_round_button").style.display = "none";
    }
  }
  else {
    if (player_name === game.players[game.songChoice+1].name) {
      document.getElementById("waiting_for_round").style.display = "none";
      document.getElementById("final_end_round_button").style.display = "block";
    }
    else {
      document.getElementById("waiting_for_round").style.display = "block";
      document.getElementById("final_end_round_button").style.display = "none";
    }
  }

  getRoundBoard();
  transition();
});
