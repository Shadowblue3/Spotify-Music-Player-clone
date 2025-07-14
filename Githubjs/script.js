let currentSongs = new Audio();
let songs = [];
let currFolder = "";

function songFormat(index) {
  const cleanName = songs[index]
    .split("/")
    .pop()
    .replaceAll("%20", " ")
    .replaceAll("%2C", ",");
  return cleanName;
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00 : 00";
  let mins = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")} : ${secs
    .toString()
    .padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let res = await fetch(`${folder}/info.json`);
  let data = await res.json();

  songs = data.songs.map((song) => `${folder}/${song}`);

  let songAdd = document.querySelector(".songList");
  songAdd.innerHTML = "";

  for (let s of songs) {
    if (!s.endsWith(".mp3")) continue;
    let fileName = s.split("/").pop().replace(".mp3", "");
    let [songName, artist] = fileName.split("-");

    songAdd.innerHTML += `
            <li>
                <img width="30px" class="invert" src="img/music.svg" alt="">
                <div class="info flex">
                    <div class="hidden">${fileName + ".mp3"}</div>
                    <div class="sn">${songName ?? ""},</div>
                    <div>${artist ?? ""}</div>
                </div>
                <div class="playSongLib">
                    <span>Play Now</span>
                    <img width="35px" src="img/playButton.svg" alt="">
                </div>
            </li>
        `;
  }

  document.querySelectorAll(".songList li").forEach((el, i) => {
    el.addEventListener("click", () => {
      playMusic(songFormat(i));
    });
  });
}

function playMusic(track, pause = false) {
  currentSongs.pause(); // stop previous audio first
  currentSongs.src = `${currFolder}/${track}`;

  // Wait for metadata (duration, etc.) to be loaded
  currentSongs.onloadedmetadata = async () => {
    if (!pause) {
      try {
        await currentSongs.play();
        play.src = "img/pause.svg";
      } catch (err) {
        console.error("Autoplay failed:", err);
      }
    }
    document.querySelector(".songInfo").innerHTML = track.replace(".mp3", "");
  };
}

async function displayAlbums() {
  const folders = ["Mixed", "Chill", "Casual"];
  let cardContainer = document.querySelector(".cardContainer");

  for (const folder of folders) {
    let res = await fetch(`songs/${folder}/info.json`);
    let data = await res.json();
    cardContainer.innerHTML += `
            <div data-folder="songs/${folder}" class="card">
                <div class="play">
                    <button class="play-button">
                        <svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7..."></path></svg>
                    </button>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      await getSongs(card.dataset.folder);
      playMusic(songFormat(0));
    });
  });
}

async function main() {
  await getSongs("songs/Mixed");
  playMusic(songFormat(0), true);
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSongs.paused) {
      currentSongs.play();
      play.src = "img/pause.svg";
    } else {
      currentSongs.pause();
      play.src = "img/playButton.svg";
    }
  });

  currentSongs.addEventListener("timeupdate", () => {
    let run = formatTime(currentSongs.currentTime);
    let dur = formatTime(currentSongs.duration);
    document.querySelector(".runTime").innerHTML = run;
    document.querySelector(".duration").innerHTML = ` / ${dur}`;
    document.querySelector(".circle").style.left =
      (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSongs.currentTime = (percent * currentSongs.duration) / 100;
    document.querySelector(".circle").style.left = percent + "%";
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".playlist").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".playlist").style.left = "-140%";
  });

  previous.addEventListener("click", () => {
    let index = songs.findIndex((s) => s === currentSongs.src);
    playMusic(songFormat((index - 1 + songs.length) % songs.length));
  });

  next.addEventListener("click", () => {
    let index = songs.findIndex((s) => s === currentSongs.src);
    playMusic(songFormat((index + 1) % songs.length));
  });

  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSongs.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSongs.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSongs.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
