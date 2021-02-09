var cur_slide = 0;
var host = false;
var room;
var player_name;
players = 0;

function transition() {
  slide1 = document.getElementsByClassName("slide")[cur_slide];
  cur_slide++;
  slide2 = document.getElementsByClassName("slide")[cur_slide];

  if (slide1.classList.contains("in")) {
    slide1.classList.remove("in");
  }

  slide1.classList.add("out");
  slide2.classList.add("in");
}

function awaitPlayers() {
  if (host) {
    document.getElementById("start_game_button").style.display = "block";
    document.getElementsByClassName("message")[0].style.display = "none";
  }
  document.getElementById("code_area").innerHTML = room;
}
