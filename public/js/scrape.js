var data_obj;
var song_data;
var tit = [];
var art = [];

/* Scrape html from lyric page */
var cors_api_url = 'http://alloworigin.com/get?url=';

function doCORSRequest(options) {
  var x = new XMLHttpRequest();

  x.open(options.method, cors_api_url + options.url);
  x.send();

  x.onload = x.onerror = function() {
    formatLyrics(x.responseText);
  };
}

function scrapeLyrics() {
  var title = document.getElementById("title").value.replaceAll(" ", "-").toLowerCase().replaceAll("$", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("#", "").replaceAll("%", "").replaceAll("'", "").replaceAll('"', "").replaceAll('?', "").replaceAll('!', "");
  var artist = document.getElementById("artist").value.replaceAll(" ", "-").toLowerCase().replaceAll("$", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("#", "").replaceAll("%", "").replaceAll("'", "").replaceAll('"', "").replaceAll('?', "").replaceAll('!', "");
  var urlField = 'https://www.metrolyrics.com/' + title + '-lyrics-' + artist + '.html';

  if (document.getElementById("select_song").classList.contains("noclick")) {
    return;
  }

  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(urlField), function (data) {
    formatLyrics(data.contents);
  });
}

/* Take the lyric text from the html and get official Title & Artist */
function formatLyrics(data) {
  var lyrics = [];
  var error = false;
  data_obj = data;
  art = [];
  tit = [];
  var artwork = "";

  for (var i = 0; i < data_obj.length; i++) {
    // Scrape lyrics
    if (checkPhrase(i, "<p class='verse'>")) {
      i += 17;
      while (!checkPhrase(i, "</p>")) {
        if(checkPhrase(i, "<br>")) {
          i += 4;
        }
        lyrics.push(data_obj[i]);
        i++;
      }
    }
    if (checkPhrase(i, "<h1>")) {
      i += 4;
      //Scrape artist
      while (!checkPhrase(i, ' - ')) {
        art.push(data_obj[i]);
        i++;
        if (checkPhrase(i, '</h1>')) {
          document.getElementById("error1").style.display = "block";
          error = true;
          break;
        }
      }
      i += 3;
      //Scrape song
      while (!checkPhrase(i, ' Lyrics')) {
        tit.push(data_obj[i]);
        i++;
      }
    }
    if (checkPhrase(i, 'img src="')) {
      i+=9;
      if (checkPhrase(i, "://netstorage.metrolyrics.com/albums")) {
        while (!checkPhrase(i, '"')) {
          artwork += data_obj[i];
          i++
        }
      }
    }
    //Check for 404 error
    if (checkPhrase(i, 'content="404 Not Found"')) {
      console.log(404);
      document.getElementById("error").style.display = "block";
      error = true;
      break;
    }

  }

  if (!lyrics[0]) {
    document.getElementById("error").style.display = "block";
    error = true;
  }

  /* Build song object and start the game cycle */
  var lyr = "";
  for (var k = 0; k < lyrics.length; k++) {
    if (lyrics[k] === "[") {
      while (lyrics[k] != "]") {
        k++;
      }
      k++;
    }
    lyr += lyrics[k];
  }
  var tits = "";
  for (var k = 0; k < tit.length; k++) {
    tits += tit[k];
  }
  var arts = "";
  for (var k = 0; k < art.length; k++) {
    arts += art[k];
  }

  if (!error) {
    song_result = {'title': tits, 'artist': arts, 'lyrics': lyr, 'artwork': artwork};

    makeArrays(song_result);
  }
}

function checkForStart() {
  if (document.getElementById("select_song").classList.contains('noclick')) {
    document.getElementById("select_song").classList.remove('noclick');
  }
  if (document.getElementById("title").value === "" || document.getElementById("artist").value === "") {
    document.getElementById("select_song").classList.add('noclick');
  }
}

/* Check for a given series of characters in a document */
function checkPhrase(cur, phrase) {
  var count = 0;
  for (var i = 0; i < phrase.length; i++) {
    if (!(data_obj[cur+i] === phrase[i])) {
      return false;
    }
  }
  return true;
}

function makeArrays(song_result) {
  var lyrics = [];
  for (var i = 0; i < song_result.lyrics.length; i++) {
    if (song_result.lyrics[i] === "[") {
      while (song_result.lyrics[i] != "]") {
        i++;
      }
      i++;
    }
    if (song_result.lyrics[i] != ' ' && song_result.lyrics[i] != ',' && song_result.lyrics[i] != "'" && song_result.lyrics[i] != '"' && song_result.lyrics[i] != '-' && song_result.lyrics[i] != '–' && song_result.lyrics[i] != ';' && song_result.lyrics[i] != ':' && song_result.lyrics[i] != '?' && song_result.lyrics[i] != '↵') {
      lyrics.push(song_result.lyrics[i].toUpperCase());
    }
  }
  song_data = {
    "title": song_result.title,
    "artist": song_result.artist,
    "lyrics": song_result.lyrics,
    "artwork": song_result.artwork,
    "letters": lyrics
  };

  sendSong();
}
