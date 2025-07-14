let currentSongs = new Audio();
let songs;
let currFolder;

function songFormat(index) {
    tempSongs = []
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].includes(".mp3")) {
            tempSongs.push(songs[i])
        }
    }
    let s1 = tempSongs[index].split(`/${currFolder}/`)
    let s2 = s1[1].split("/")
    let s3 = s2[0].replaceAll("%20", " ").replaceAll("%2C", ",")

    return s3
}
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00 : 00"
    }

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if needed
    let formattedMins = mins.toString().padStart(2, '0');
    let formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins} : ${formattedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    console.log(div)
    let element = div.getElementsByTagName("li");
    // console.log(element)
    songs = []
    for (let i = 1; i < element.length; i++) {
        songs.push(element[i].getElementsByTagName("a")[0].href)
    }

    let songAdd = document.querySelector(".songList")
    songAdd.innerHTML = ""
    for (const s of songs) {
        if (s.includes(".mp3")) {

            let tempArr = s.split(`/songs/`)
            let temp = tempArr[1].split("/")
            let songInfo = temp[1].split(".")[0]
            let songName = songInfo.split("-")[0]
            let artist = songInfo.split("-")[1]
            songAdd.innerHTML += `
                            <li>
                            <img width="30px" class="invert" src="img/music.svg" alt="">
                                    <div class="info flex">
                                            <div class="hidden">${songInfo.replaceAll("%20", " ").replaceAll("%2C", ",") + ".mp3"}</div>
                                            <div class = "sn" >${songName.replaceAll("%20", " ")},</div>
                                            <div>${artist.replaceAll("%20", " ").replaceAll("%2C", ",")}</div>
                        
                                    </div>
                                    <div class="playSongLib">
                                        <span>Play Now</span>
                                        <img width="35px" src="img/playButton.svg" alt="">
                                    </div>
                                </li>`
        }

    }

    //Attach a eventListneer to each songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSongs.src = `/${currFolder}/` + track
    if (!pause) {
        currentSongs.play()
        play.src = "img/pause.svg"
    }
    let name = track.split(".")[0]
    document.querySelector(".songInfo").innerHTML = name


    // document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {

        const e = array[i]

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("songs/")[1]
            //get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML += `<div data-folder = "${folder}" class="card">
                    <div class="play">
                        <button class="play-button">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" class="play-icon"
                                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    }

    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songList = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            console.log(songs)
            playMusic(songFormat(0))
        })
    });
}

async function main() {
    await getSongs("songs/Mixed")
    let s = songFormat(0)

    playMusic(s, true)


    //Display all the albums on the page
    displayAlbums()

    //Attach an eventListneer to play next and previous
    play.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSongs.pause()
            play.src = "img/playButton.svg"
        }
    })

    //listen for timeupdate event
    currentSongs.addEventListener("timeupdate", () => {
        // console.log(currentSongs.currentTime, currentSongs.duration)
        let runTime = formatTime(currentSongs.currentTime)
        let totalTime = formatTime(currentSongs.duration)
        document.querySelector(".runTime").innerHTML = `${runTime}`
        document.querySelector(".duration").innerHTML = ` /  ${totalTime}`
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%"
    })

    //Adding an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSongs.currentTime = (percent * currentSongs.duration) / 100
    })

    //Adding event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".playlist").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".playlist").style.left = "-140%"
    })

    //Add an eventlistner for previous and next
    previous.addEventListener("click", () => {
        let index = songs.findIndex(url => decodeURIComponent(url) === decodeURIComponent(currentSongs.src));
        if ((index - 1) >= 0) {
            playMusic(songFormat(index - 1))
        }
        else {
            playMusic(songFormat(songs.length - 1))
        }
    })

    next.addEventListener("click", () => {
        // console.log(currentSongs.src)
        // let index = songList.indexOf(currentSongs.src.replaceAll(" ", "%20").replaceAll(",", "%2C"))
        let index = songs.findIndex(url => decodeURIComponent(url) === decodeURIComponent(currentSongs.src));
        // console.log(index)
        if ((index + 1) < songs.length) {
            playMusic(songFormat(index + 1))
        }
        else {
            playMusic(songFormat(0))
        }
    })

    //Adding an eventListner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSongs.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target.src)
        if (e.target.src.includes("volume.svg")) {

            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSongs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0

        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSongs.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })


}
main()
