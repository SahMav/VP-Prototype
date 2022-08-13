const playPauseBtn = document.querySelector(".play-pause-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".full-screen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")
const timelineContainer = document.querySelector(".timeline-container")
const timeline = document.querySelector(".Timeline");
const video = document.querySelector("video")

const slideTimeList = [5, 10, 25, 35, 45, 55, 65, 75, 95, 135, 143, 155];
const videoLength = 175
let isActive = true;
let sectionEndTime = 0;

document.addEventListener("keydown", e => {
  const tagName = document.activeElement.tagName.toLowerCase()

  if (tagName === "input") return

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return
    case "k":
      togglePlay()
      break
    case "f":
      toggleFullScreenMode()
      break
    case "t":
      toggleTheaterMode()
      break
    case "i":
      toggleMiniPlayerMode()
      break
    case "m":
      toggleMute()
      break
    case "arrowleft":
    case "j":
      skip(-5)
      break
    case "arrowright":
    case "l":
      skip(5)
      break
    case "c":
      toggleCaptions()
      break
  }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
// timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}



function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  )
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`
  previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent)

  if (isScrubbing) {
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)
  }

  // if (video.currentTime > 0){
  //   console.log("h")
  //   slideMarkerList[0].style.display = "none";
  //   if (video.currentTime > slideTransitionList[slideInd]){
  //     slideMarkerList[slideInd].style.left = slideTransitionList[slideInd]/videoLength * 100 + "%";
  //     slideInd++
  //     console.log(video.currentTime)
  //   }
  // }
}


// Slides
let slideMarkerList = []
function addSlideMarkers(){
  for(let i = 0; i < slideTimeList.length; i++){
    const marker = document.createElement("div")
    marker.setAttribute("class", "slide-marker")
    marker.style.left = i / slideTimeList.length * 100 +"%";
    marker.style.display = "inline-block";
    timelineContainer.appendChild(marker)

    slideMarkerList.push(marker)


    // const img = document.createElement("img");
    // img.setAttribute("src", "./assets/slide.png");
    // img.setAttribute("class","img-marker");
    // marker.appendChild(img);
  }
}

addSlideMarkers()

function addTimelineSection(){
  const section = document.createElement("div")
  section.setAttribute("class", "timeline-section")
  section.style.left = (sectionEndTime / videoLength) * 100 + "%";
  section.style.width = (video.currentTime - sectionEndTime) / videoLength * 100 + "%";
  timelineContainer.appendChild(section)

  if(isActive) {
    section.style.backgroundColor = "red"
  } else{
    section.style.backgroundColor = "yellow"
  }

  isActive = !isActive
  sectionEndTime = video.currentTime;
}

let futureAlertsList = []

function toggleAlert(i){
  if (futureAlertsList.includes(i)){
    console.log("remove alert");
    futureAlertsList.splice(futureAlertsList.indexOf(i), 1);
    slideMarkerList[i].style.backgroundColor = "#bbb"
    slideMarkerList[i].removeChild(slideMarkerList[i].firstChild);
    console.log(futureAlertsList);
  }
  else{
    if (slideTimeList[i] > video.currentTime){
      futureAlertsList.push(i);
      slideMarkerList[i].style.backgroundColor = "#80CBC4";
      const img = document.createElement("img");
      img.setAttribute("src", "./assets/timer.png");
      img.setAttribute("class","img-timer");
      slideMarkerList[i].appendChild(img);
    }
  }
}

function setAlert(i){
  if (slideTimeList[i] > video.currentTime){
      futureAlertsList.push(i);
      slideMarkerList[i].style.backgroundColor = "#80CBC4";
    }
}

for (let i = 0; i < slideMarkerList.length ; i++) {
  slideMarkerList[i].addEventListener("click", function() { toggleAlert(i); }, false);
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}

// Captions
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration)
})


let slideInd = 0


video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime)
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent)

  //move slide markers with time
  if (video.currentTime > slideInd/slideTimeList.length * videoLength || video.currentTime > slideTimeList[slideInd]){
    slideMarkerList[slideInd].style.display = "none";
    if (video.currentTime > slideTimeList[slideInd]){
      slideMarkerList[slideInd].style.left = slideTimeList[slideInd]/videoLength * 100 + "%";
      slideMarkerList[slideInd].style.display = "block";
      if (futureAlertsList.indexOf(slideInd)) toggleAlert(slideInd)
      isActive? slideMarkerList[slideInd].style.backgroundColor = "red" : slideMarkerList[slideInd].style.backgroundColor = "yellow";
      slideInd++
      console.log(video.currentTime)
    }
  }
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`
  }
}

function skip(duration) {
  video.currentTime += duration
}

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

function toggleMute() {
  video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture()
  } else {
    video.requestPictureInPicture()
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player")
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
  video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})

window.addEventListener("blur", addTimelineSection)

window.addEventListener("focus", addTimelineSection)
