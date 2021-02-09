var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var difficulty = 2;

function changeDifficulty(level) {
  game.curLetter = "-";
  for (var j = 0; j < document.getElementsByClassName('mug').length; j++) {
    if (!document.getElementsByClassName('mug')[j].classList.contains('bw')) {
      document.getElementsByClassName('mug')[j].classList.add('bw');
    }
  }
  for (var i = 0; i <= level; i++) {
    document.getElementsByClassName('mug')[i].classList.remove('bw');
  }
  difficulty = level + 1;
  getLetters();
}

/* Display available letters depending on the selected difficulty */
function getLetters() {
  scores = [];
  lyrics = game.curSong.letters;

  for (var i = 0; i < letters.length; i++) {
    count = 0;
    for (var j = 0; j < game.curSong.letters.length; j++) {
      if (letters[i] === game.curSong.letters[j]) {
        count++;
      }
    }
    var calc = (count/game.curSong.letters.length)*100;
    var tmp = {};
    tmp.letter = letters[i];
    tmp.count = count;
    tmp.score = calc;
    scores.push(tmp);
  }

  var area = document.getElementById("letters");
  area.innerHTML = "";

  if (difficulty === 1) {
    for (var k = 0; k < scores.length; k++) {
      if (scores[k].score > 0 && scores[k].score < 1) {
        createDiv(scores[k].letter);
      }
      document.getElementById("sips").innerHTML = "1 to " + (Math.floor(0.01*game.curSong.letters.length)) + " sips";
    }
  }
  else if (difficulty === 2) {
    for (var k = 0; k < scores.length; k++) {
      if (scores[k].score >= 1 && scores[k].score < 2) {
        createDiv(scores[k].letter);
      }
    }
    document.getElementById("sips").innerHTML = (Math.ceil(0.01*game.curSong.letters.length)) + " to " + (Math.floor(0.02*game.curSong.letters.length)) + " sips";
  }
  else if (difficulty === 3) {
    for (var k = 0; k < scores.length; k++) {
      if (scores[k].score >= 2 && scores[k].score < 3) {
        createDiv(scores[k].letter);
      }
    }
    document.getElementById("sips").innerHTML = (Math.ceil(0.02*game.curSong.letters.length)) + " to " + (Math.floor(0.03*game.curSong.letters.length)) + " sips";
  }
  else if (difficulty === 4) {
    for (var k = 0; k < scores.length; k++) {
      if (scores[k].score >= 3 && scores[k].score < 4) {
        createDiv(scores[k].letter);
      }
    }
    document.getElementById("sips").innerHTML = (Math.ceil(0.03*game.curSong.letters.length)) + " to " + (Math.floor(0.04*game.curSong.letters.length)) + " sips";
  }
  else {
    for (var k = 0; k < scores.length; k++) {
      if (scores[k].score >= 4) {
        createDiv(scores[k].letter);
      }
    }
    document.getElementById("sips").innerHTML = (Math.ceil(0.04*game.curSong.letters.length)) + "+ sips";
  }

  if (document.getElementById("letters").innerHTML === "") {
    document.getElementById("letters").innerHTML = "<i>No letters available</i>"
  }
}

/* Create divs for letter displays */
function createDiv(letter) {
  var area = document.getElementById("letters");
  var div = document.createElement('div');
  var text= document.createTextNode(letter);

  div.appendChild(text);
  div.classList.add('letter');
  div.setAttribute( "onclick", "javascript: select(this);" );
  area.appendChild(div);
}

/* Select a letter */
function select(el) {
  if (document.getElementsByClassName('selected')[0]) {
    document.getElementsByClassName('selected')[0].classList.remove('selected');
  }
  el.classList.add('selected');
  game.curLetter = el.innerHTML;
}

function getScoreBoard(game_data) {
  game = game_data;

  players = game.players;

  players.sort((a, b) => {
    return b.points - a.points;
  });

  var table = document.getElementById("scoreboard");
  var table1 = document.getElementById("scoreboard1");
  table.innerHTML = '<tr style="border: none; background: white;"><th width="75px">Place</th><th>Player</th><th width="75px">Score</th></tr>';
  table1.innerHTML = '<tr style="border: none; background: white;"><th width="75px">Place</th><th>Player</th><th width="75px">Score</th></tr>';

  for (var i = 1; i <= players.length; i++) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var text = document.createTextNode(i);
    td.appendChild(text);
    td.style.fontWeight = "800";
    if (i === 1) {
      td.style.color = "#f2b600";
    }
    else if (i === 2) {
      td.style.color = "#bfbfbf";
    }
    else if (i === 3) {
      td.style.color = "#997450";
    }
    else {
      td.style.color = "#4a4a4a";
    }
    tr.appendChild(td);

    td = document.createElement('td');
    text = document.createTextNode(players[i-1].name);
    td.appendChild(text);
    tr.appendChild(td);

    td = document.createElement('td');
    text = document.createTextNode(players[i-1].points);
    td.appendChild(text);
    td.style.fontWeight = "600";
    td.style.color = "rgba(18,84,187,1)";
    tr.appendChild(td);
    var tr1 = tr.cloneNode(true);

    table.appendChild(tr);
    table1.appendChild(tr1);
  }
}

function getRoundBoard() {
  players = game.players;

  players.sort((a, b) => {
    return b.roundPoints[game.curRound-1] - a.roundPoints[game.curRound-1];
  });

  var table = document.getElementById("round_board");
  table.innerHTML = '<tr style="border: none; background: white;"><th>Player</th><th width="75px">Sips</th><th width="75px">Points</th></tr>';

  for (var i = 0; i < players.length; i++) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var text = document.createTextNode(players[i].name);
    td.appendChild(text);
    tr.appendChild(td);

    td = document.createElement('td');
    text = document.createTextNode(players[i].roundScores[game.curRound-1].sips);
    td.appendChild(text);
    tr.appendChild(td);

    td = document.createElement('td');
    text = document.createTextNode(players[i].roundPoints[game.curRound-1]);
    td.appendChild(text);
    td.style.fontWeight = "600";
    td.style.color = "rgba(18,84,187,1)";
    tr.appendChild(td);
    var tr1 = tr.cloneNode(true);

    table.appendChild(tr);
  }
}
