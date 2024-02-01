async function songFetch() {
  try {
    let a = await fetch('http://127.0.0.1:5500/songs')
    let response = await a.text()
    console.log(response)

    let div = document.createElement('div')
    div.innerHTML = response

    let as = div.getElementsByTagName('a')
    let songsname = []
    let songshref = []

    for (let index = 0; index < as.length; index++) {
      const element = as[index]
      if (element.href.endsWith('.mp3')) {
        songsname.push(element.title.slice(0, -4))
        songshref.push(element.href)
      }
    }
    console.log(songshref)
    console.log(songsname)
    return { songshref, songsname }
  } catch (error) {
    console.error('Error fetching songs:', error)
    return { songshref: [], songsname: [] }
  }
}

async function listSongs() {
  try {
    let { songshref, songsname } = await songFetch()
    const songcards = document.querySelector('.songs')
    for (let i = 0; i < songsname.length; i++) {
      let div = document.createElement('div')
      div.className = 'song-select'
      let a = document.createElement('a')
      a.className = 'song-anchor'
      div.innerText = songsname[i]
      a.style.color = 'white'
      a.href = songshref[i]
      a.appendChild(div)
      songcards.appendChild(a)
    }
  } catch (error) {
    console.error('Error listing songs:', error)
  }
}
listSongs()

let shufflemode = false
let audioElement = new Audio()
let playsong = null
let songstack = []
let repeatmode = 0

async function selectfromLibrary() {
  let { songshref, songsname } = await songFetch()
  const songcards = document.querySelector('.songs')
  songcards.addEventListener('click', async function (e) {
    e.preventDefault()
    playsong = e.target.closest('.song-anchor')
    if (playsong) {
      const musicPlayer = document.querySelector('.music-player')
      musicPlayer.style.opacity = 1
      const play_pause = document.querySelector('.play-pause')
      const next = document.querySelector('.next')
      const previous = document.querySelector('.previous')
      const shuffle = document.querySelector('.shuffle')
      const repeat = document.querySelector('.repeat')
      play_pause.addEventListener('click', function newclick(e) {
        e.preventDefault()
        if (audioElement.paused) {
          audioElement.play()
          play_pause.querySelector('img').src = 'button imgs/pause.svg'
        } else {
          audioElement.pause()
          play_pause.querySelector('img').src = 'button imgs/play.svg'
        }
        play_pause.removeEventListener('click', newclick)
        play_pause.addEventListener('click', newclick)
      })

      next.addEventListener('click', function newclick(e) {
        e.preventDefault()
        audioElement.pause()
        let currentIndex = songshref.indexOf(audioElement.src)
        let nextIndex
        if (shufflemode) {
          nextIndex = getRandomIndex(currentIndex, songshref.length)
        } else if (repeatmode === 2) {
          nextIndex = currentIndex
        } else {
          nextIndex = (currentIndex + 1) % songshref.length
        }
        audioElement.src = songshref[nextIndex]
        songstack.push(audioElement.src)
        audioElement.play()
        document.querySelector('.nowplaying-songname').innerText =
          songsname[nextIndex]
        next.removeEventListener('click', newclick)
        next.addEventListener('click', newclick)
      })

      previous.addEventListener('click', function newclick(e) {
        e.preventDefault()
        audioElement.pause()
        const currentIndex = songshref.indexOf(audioElement.src)
        let previousIndex = songshref.indexOf(songstack.pop())
        audioElement.src = songshref[previousIndex]
        audioElement.play()
        document.querySelector('.nowplaying-songname').innerText =
          songsname[previousIndex]
        previous.removeEventListener('click', newclick)
        previous.addEventListener('click', newclick)
      })
      shuffle.addEventListener('click', function newclick(e) {
        // e.preventDefault();
        // audioElement.pause();
        shufflemode = !shufflemode
        shuffle.querySelector('img').style.filter = invert(1)
        shuffle.removeEventListener('click', newclick)
        shuffle.addEventListener('click', newclick)
      })
      repeat.addEventListener('click', function newclick(e) {
        e.preventDefault()
        // const currentIndex = songshref.indexOf(audioElement.src);

        if (repeat.querySelector('img').src === 'button imgs/repeat-off.svg') {
          repeatmode = 1
          repeat.querySelector('img').style.filter = invert(1)
          repeat.querySelector('img').src = 'button imgs/repeat.svg'
        } else if (
          repeat.querySelector('img').src === 'button imgs/repeat.svg'
        ) {
          repeatmode = 2
          repeat.querySelector('img').src = 'button imgs/repeat-one-01.svg'
        } else {
          repeat.querySelector('img').src = 'button imgs/repeat-off.svg'
          repeatmode = 0
        }

        repeat.removeEventListener('click', newclick)
        repeat.addEventListener('click', newclick)
      })

      const audioResponse = await fetch(playsong.href)
      const audioBlob = await audioResponse.blob()
      const audioObjectURL = URL.createObjectURL(audioBlob)
      audioElement.src = audioObjectURL
      audioElement.play()

      audioElement.addEventListener('ended', function () {
        if (repeatmode === 1) {
          audioElement.src =
            songshref[
              (songshref.indexOf(audioElement.src) + 1) % songshref.length
            ]
          audioElement.play()
        } else if (repeatmode === 2) {
          audioElement.currentTime = 0 // Reset the current time
          audioElement.play()
        } else {
          audioElement.src =
            songshref[
              (songshref.indexOf(audioElement.src) + 1) % songshref.length
            ]
          audioElement.play()
        }
        displayTime(audioElement)
      })

      document.querySelector('.nowplaying-songname').innerText =
        songsname[songshref.indexOf(audioElement.src)]
      if (document.querySelector('.nowplaying-songname').innerText !== null) {
        document.querySelector('.songimg-container').style.background =
          'rgb(105,64,182)'
        document.querySelector('.songimg-container').style.background =
          'linear-gradient(90deg, rgba(105,64,182,1) 50%, rgba(52,163,169,1) 90%)'
        document.querySelector('.nowplaying-songimage').src =
          'button imgs/music.svg'
      }
    }
  })
}
selectfromLibrary()
function getRandomIndex(currentIndex, arrayLength) {
  let randomIndex
  do {
    randomIndex = Math.floor(Math.random() * arrayLength)
  } while (randomIndex === currentIndex)
  return randomIndex
}
function displayTime(audio) {
  document.querySelector(
    '.currentPlayTime'
  ).innerText = `${secondsToMinutesSeconds(audio.currentTime)}`
  document.querySelector(
    '.totalPlayTime'
  ).innerText = `${secondsToMinutesSeconds(audio.duration)}`
}
