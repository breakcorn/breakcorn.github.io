function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function openLinkInOtherWindow(link) { // https://habr.com/ru/articles/282880/
  let otherWindow = window.open();
  otherWindow.opener = null;
  otherWindow.location = link;
}

document.addEventListener("DOMContentLoaded", () => {

  console.log('DOM fully loaded and parsed');

  let linkToFAQ = 'https://www.wikihow.com/Use-VLC-Media-Player-to-Listen-to-Internet-Radio'
  document.getElementById('BTN_FAQ_1').addEventListener('click', () => openLinkInOtherWindow(linkToFAQ));
  document.getElementById('BTN_FAQ_2').addEventListener('click', () => openLinkInOtherWindow(linkToFAQ));

  $('.masthead').visibility({ // fix menu when passed
    once: false,
    onBottomPassed:        function() { $('.fixed.menu').transition('fade in');  },
    onBottomPassedReverse: function() { $('.fixed.menu').transition('fade out'); }
  });
  $('.ui.sidebar').sidebar('attach events', '.toc.item'); // create sidebar and attach to menu open
  let interval1, interval2,
      el_scanlines = document.getElementById('SCANLINES'),
      el_noise = document.getElementById('NOISE'),
      variation;

  setInterval(() => {
    clearInterval(interval1)
    if (getRandomInt(16) > 14) {
      interval1 = setInterval(() => {
        if (getRandomInt(8) > 5) { el_scanlines.classList.add('accent'); }
        else                     { el_scanlines.classList.remove('accent'); }
        if (getRandomInt(8) > 5) { el_noise.style.display = 'block'; }
        else                     { el_noise.style.display = 'none'; }
      }, 8 + getRandomInt(9));
    }
    el_noise.style.display = 'none';
  }, 500);
  
  setInterval(() => {
    clearInterval(interval2)
    if (getRandomInt(16) > 14) {
      interval2 = setInterval(() => {
        if (getRandomInt(8) > 5) {
          switch(getRandomInt(5)) {
            case 0: variation = 'a'; break;
            case 1: variation = 'b'; break;
            case 2: variation = 'c'; break;
            case 3: variation = 'd'; break;
            case 4: variation = 'e'; break;
          }
          el_scanlines.classList.add('accent', 'variations', variation);
        }
        else { el_scanlines.classList.remove('accent', 'variations', 'a', 'b', 'c', 'd', 'e'); }
      }, 8 + getRandomInt(9));
    }
    el_scanlines.classList.remove('accent');
  }, 500);

});

let obj_BTN_HIDE_INTERFACE = { 'element': document.getElementById('BTN_HIDE_INTERFACE'), 'hover': false, 'state': true }
obj_BTN_HIDE_INTERFACE.element.addEventListener('mouseover', () => { obj_BTN_HIDE_INTERFACE.hover = true;  });
obj_BTN_HIDE_INTERFACE.element.addEventListener('mouseout',  () => { obj_BTN_HIDE_INTERFACE.hover = false; });

function show_BTN_HIDE_INTERFACE() {
  animation = 'animate__fadeIn';
  obj_BTN_HIDE_INTERFACE.element.style.display = 'block';
  obj_BTN_HIDE_INTERFACE.element.style.setProperty('--animate-duration', '1s');
  obj_BTN_HIDE_INTERFACE.element.classList.add('animate__animated', 'animate__fadeIn');
}

function hide_BTN_HIDE_INTERFACE() {
  animation = 'animate__fadeOut';
  obj_BTN_HIDE_INTERFACE.element.style.display = 'block';
  obj_BTN_HIDE_INTERFACE.element.style.setProperty('--animate-duration', '1s');
  obj_BTN_HIDE_INTERFACE.element.classList.add('animate__animated', 'animate__fadeOut');
}

let animation = 'animate__fadeIn';

obj_BTN_HIDE_INTERFACE.element.addEventListener('animationend', () => {
  obj_BTN_HIDE_INTERFACE.element.classList.remove('animate__animated', animation);
  if (animation == 'animate__fadeOut') {    
    obj_BTN_HIDE_INTERFACE.element.style.display = 'none';
    y = false;
  }
});

let x, y;
document.addEventListener('mousemove', () => {
  if (!obj_BTN_HIDE_INTERFACE.hover) { // if (!obj_BTN_HIDE_INTERFACE.hover && !obj_BTN_HIDE_INTERFACE.state) {
    if (!y) { y = true; show_BTN_HIDE_INTERFACE(); }
    if (x) { clearTimeout(x) }; x = setTimeout(() => { hide_BTN_HIDE_INTERFACE(); }, 750);
  } else {
    clearTimeout(x)
    obj_BTN_HIDE_INTERFACE.element.classList.remove('animate__animated', 'animate__fadeIn', 'animate__fadeOut'); // Preventive.
    obj_BTN_HIDE_INTERFACE.element.style.display = 'block';
  }
});


$('#BTN_HIDE_INTERFACE').click(() => { if (obj_BTN_HIDE_INTERFACE.state) {
  obj_BTN_HIDE_INTERFACE.state = false; $('#BTN_HIDE_INTERFACE').html('<i id="ICON_BTN_HIDE_INTERFACE" class="low vision icon"></i>'); $('.interface').hide(); } else {
  obj_BTN_HIDE_INTERFACE.state = true;  $('#BTN_HIDE_INTERFACE').html('<i id="ICON_BTN_HIDE_INTERFACE" class="eye icon"></i>');        $('.interface').show();
}});

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

document.addEventListener('DOMContentLoaded', function() { // Analogue of $(document).ready(function() { … } from jQuery. See more at SRC: https://ru.stackoverflow.com/a/414523

// console.clear(); console.log('Hallo World!');

const canvas = document.getElementById('CANVAS'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const audioElement = document.querySelector('audio');
const sourceElements = Array.from(audioElement.querySelectorAll('source')); let currentSourceElementIndex = 0;
const button_PlaySwitch = document.querySelector('.controls-play');
const volumeControl = document.querySelector('[data-action="volume"]');
const inputCheckbox_presetCycle = document.getElementById('presetCycle');
const inputNumber_presetCycleLength = document.getElementById('presetCycleLength');
const inputCheckbox_presetRandom = document.getElementById('presetRandom');
const select_presetSelect = document.getElementById('presetSelect');
const select_sourceServerSelect = document.getElementById('SOURCE_SERVER_SELECT');

let gl; try { gl = canvas.getContext("webgl2"); } catch (x) { gl = null; }
const webGL2Supported = !!gl;
const audioApiSupported = !!(window.AudioContext || window.webkitAudioContext);

if (webGL2Supported && audioApiSupported) {

let audioCtx,
    source,
    gainNode,
    analyser,
    dynamicsCompressorNode,
    threshold = 0.0,
    knee = 30.0,
    ratio = 1.0,
    attack = 0.003,
    release = 0.25;

let visualizer = null,
    rendering = false,
    sourceNode = null,
    delayedAudible = null,
    cycleInterval = null,
    presets = {},
    presetKeys = [],
    presetIndexHistory = [],
    presetIndex = Math.floor(Math.random() * presetKeys.length),
    presetCycle = inputCheckbox_presetCycle.checked,
    presetCycleLength = 15000,
    presetRandom = inputCheckbox_presetRandom.checked,
    defaultBlendTime = 5.7; // the number of seconds to blend preset;

if (window.butterchurnPresets)      { Object.assign(presets, butterchurnPresets.getPresets());      }
if (window.butterchurnPresetsExtra) { Object.assign(presets, butterchurnPresetsExtra.getPresets()); }
presets = _(presets).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value();
presetKeys = _.keys(presets);

for(let i = 0; i < presetKeys.length; i++) {
  let opt = document.createElement('option');
  opt.innerHTML = presetKeys[i].substring(0,60) + (presetKeys[i].length > 60 ? '...' : '');
  opt.value = i;
  select_presetSelect.appendChild(opt);
}

function initPlayer() { // Инициализация плеера
  presetSourceElementIndex = select_sourceServerSelect.value;
  currentSourceElementIndex = presetSourceElementIndex;
  audioElement.src = sourceElements[currentSourceElementIndex].src; // Начальная загрузка первого источника
  audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // audioCtx = new AudioContext();
  source = new MediaElementAudioSourceNode(audioCtx, { mediaElement: audioElement });
  gainNode = new GainNode(audioCtx); // create the node that controls the volume.
  analyser = audioCtx.createAnalyser(); // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
  dynamicsCompressorNode = audioCtx.createDynamicsCompressor();
  dynamicsCompressorNode.threshold.setValueAtTime(threshold, audioCtx.currentTime);
  dynamicsCompressorNode.knee.setValueAtTime(knee, audioCtx.currentTime);
  dynamicsCompressorNode.ratio.setValueAtTime(ratio, audioCtx.currentTime);
  dynamicsCompressorNode.attack.setValueAtTime(attack, audioCtx.currentTime);
  dynamicsCompressorNode.release.setValueAtTime(release, audioCtx.currentTime);
  volumeControl.addEventListener('input', () => { gainNode.gain.value = volumeControl.value; }, false);
  const panner = new StereoPannerNode(audioCtx, { pan: 0 }); // create the node that controls the panning
  const pannerControl = document.querySelector('[data-action="panner"]');
  pannerControl.addEventListener('input', () => { panner.pan.value = pannerControl.value; }, false);
  // source.connect(analyser); // you don't need to connect the analyser's output to another node for it to work, as long as the input is connected to the source, either directly or via another node. (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API#:~:text=you%20don%27t%20need%20to%20connect%20the%20analyser%27s%20output%20to%20another%20node%20for%20it%20to%20work%2C%20as%20long%20as%20the%20input%20is%20connected%20to%20the%20source%2C%20either%20directly%20or%20via%20another%20node.)
  source.connect(dynamicsCompressorNode).connect(gainNode).connect(panner).connect(audioCtx.destination); // connect the graph

  visualizer = butterchurn.default.createVisualizer(audioCtx, canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    textureRatio: 1,
  });
  visualizer.loadPreset(presets[presetKeys[presetIndex]], 0.0);
  select_presetSelect.value = presetIndex;
  presetIndexHistory.push(presetIndex);
  if (presetCycle) {
    cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
  }

  startRenderer();
}

button_PlaySwitch.addEventListener('click', () => { // Добавляем обработчик на кнопку Play/Pause
  if (!audioCtx) { initPlayer(); }
  if (audioCtx.state === 'suspended') { audioCtx.resume(); } // check if context is in suspended state (autoplay policy)
  if (button_PlaySwitch.dataset.playing === 'false') {
    audioElement.play();
    button_PlaySwitch.dataset.playing = 'true';
  } else if (button_PlaySwitch.dataset.playing === 'true') { // if track is playing pause it
    audioElement.pause();
    button_PlaySwitch.dataset.playing = 'false';
  }
  let state = button_PlaySwitch.getAttribute('aria-checked') === 'true' ? true : false; // toggle the state between play and not playing
  button_PlaySwitch.setAttribute('aria-checked', state ? 'false' : 'true');

  audioCtx.resume();
  visualizer.connectAudio(source); // startRenderer(); // Подключаем аудио к визуализатору
}, false );

$('.audio-player').click(function() {
  button_PlaySwitch.click();
  if (!audioElement.paused) {
    // audioElement.currentTime = 0.0; // restarts the whole audio from the beginning
  }
});

document.getElementById('SOURCE_SERVER_SELECT').addEventListener('change', function() {
  presetSourceElementIndex = select_sourceServerSelect.value;
  audioElement.src = sourceElements[presetSourceElementIndex].src;
  currentSourceElementIndex = presetSourceElementIndex;
  audioElement.load(); audioElement.play();
  console.log('Selected source server: ', presetSourceElementIndex);
});

function switchSource() { // Функция для аварийной смены источника на резервный
  currentSourceElementIndex = (currentSourceElementIndex + 1) % sourceElements.length;
  audioElement.src = sourceElements[currentSourceElementIndex].src;
  audioElement.load();
  audioElement.play();
}

// Обработчик ошибки воспроизведения
audioElement.addEventListener('error', () => {
  console.log('Ошибка воспроизведения, переключаемся на следующий источник.');
  switchSource();
});

audioElement.addEventListener('ended', () => { // if track ends
  switchSource();
  // button_PlaySwitch.dataset.playing = 'false';
  // button_PlaySwitch.setAttribute('aria-checked', 'false');
}, false);

setInterval(() => { // Плановая попытка вернуться на главный источник, в случае аварийной замены источника вещания (`switchSource()`)
  if (currentSourceElementIndex != presetSourceElementIndex) {
    audioElement.src = sourceElements[presetSourceElementIndex].src;
    currentSourceElementIndex = presetSourceElementIndex;
    audioElement.load(); audioElement.play();
  }
}, 1000 * 60 * 13); // after each 13th minute

function connectToAudioAnalyzer(sourceNode) {
  if (delayedAudible) { delayedAudible.disconnect(); }
  delayedAudible = audioCtx.createDelay();
  delayedAudible.delayTime.value = 0.26;
  sourceNode.connect(delayedAudible)
  delayedAudible.connect(audioCtx.destination);
  visualizer.connectAudio(delayedAudible);
}

function startRenderer() {
  requestAnimationFrame(() => startRenderer());
  visualizer.render();
  $('#PRELOADER').hide();
}

function playBufferSource(buffer) {
  if (!rendering) { rendering = true; startRenderer(); }
  if (sourceNode) { sourceNode.disconnect(); }
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = buffer;
  connectToAudioAnalyzer(sourceNode);
  sourceNode.start(0);
}

function loadLocalFiles(files, index = 0) {
  audioCtx.resume();
  let reader = new FileReader();
  reader.onload = (event) => {
    audioCtx.decodeAudioData(event.target.result, (buf) => {
      playBufferSource(buf);
      setTimeout(() => {
        if (files.length > index + 1) { loadLocalFiles(files, index + 1); }
        else {
          sourceNode.disconnect();
          sourceNode = null;
        }
      }, buf.duration * 1000);
    });
  };
  let file = files[index];
  reader.readAsArrayBuffer(file);
}

function connectMicAudio(sourceNode, audioCtx) {
  audioCtx.resume();
  let gainNode = audioCtx.createGain(); gainNode.gain.value = 1.25; sourceNode.connect(gainNode);
  visualizer.connectAudio(gainNode); startRenderer();
}

function nextPreset(bt = defaultBlendTime) {
  presetIndexHistory.push(presetIndex);
  let numPresets = presetKeys.length;
  if (presetRandom) { presetIndex = Math.floor(Math.random() * presetKeys.length); }
  else              { presetIndex = (presetIndex + 1) % numPresets; }
  visualizer.loadPreset(presets[presetKeys[presetIndex]], bt);
  select_presetSelect.value = presetIndex;
}

function prevPreset(bt = defaultBlendTime) {
  let numPresets = presetKeys.length;
  if (presetIndexHistory.length > 0) { presetIndex = presetIndexHistory.pop(); }
  else                               { presetIndex = ((presetIndex - 1) + numPresets) % numPresets; }
  visualizer.loadPreset(presets[presetKeys[presetIndex]], bt);
  select_presetSelect.value = presetIndex;
}

function restartCycleInterval() {
  if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
  if (presetCycle) { cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength); }
}

document.addEventListener('keydown', (e) => { // https://www.toptal.com/developers/keycode/table
  if      (e.which === 32 || e.which === 39) { nextPreset(5.7); } // Spacebar  || ArrowRight
  else if (e.which === 8  || e.which === 37) { prevPreset(0.0); } // Backspace || ArrowLeft
  else if (e.which === 72)                   { nextPreset(0.0); } // KeyH
});

select_presetSelect.addEventListener('change', (e) => {
  presetIndex = parseInt(e.target.value);
  visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.7);
  presetIndexHistory.push(presetIndex);
});

inputCheckbox_presetCycle.addEventListener('change', (e) => {
  presetCycle = e.target.checked;
  restartCycleInterval();
});

inputNumber_presetCycleLength.addEventListener('change', (e) => {
  presetCycleLength = parseInt(e.target.value * 1000);
  restartCycleInterval();
});

inputCheckbox_presetRandom.addEventListener('change', (e) => {
  presetRandom = e.target.checked;
});

document.getElementById('localFileBut').addEventListener('click', (e) => {
  let fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('accept', 'audio/*');
  fileSelector.setAttribute('multiple', 'multiple');
  fileSelector.onchange = function(event) { loadLocalFiles(fileSelector[0].files); }
  fileSelector.click();
});

document.getElementById('micSelect').addEventListener('click', (e) => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) { // https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia
    // debug: https://stackoverflow.com/questions/60957829/navigator-mediadevices-is-undefined
    let micSourceNode = audioCtx.createMediaStreamSource(stream);
    connectMicAudio(micSourceNode, audioCtx);
  }).catch(function (err) { console.log('Error getting audio stream from getUserMedia'); });
});

initPlayer();

const audioPlayer = document.querySelector('.audio-player');
const glitch = document.querySelector('#BG_FIXED');
const statusText = document.querySelector('.triangle__text');
const triangle = document.querySelector('.triangle');

audioPlayer.style.setProperty('--animate-duration', '1s');
audioPlayer.style.display = 'block';
audioElement.addEventListener('playing',  (event) => {
  $('.audio-player-button').attr('src', './static/Pause-Icon.svg');
  audioPlayer.classList.add('animate__animated', 'animate__pulse', 'animate__infinite');
  button_PlaySwitch.dataset.playing = 'true';
  statusText.innerText = 'playing';
  statusText.setAttribute('data-text', 'playing');
  triangle.style.animationName = 'triangleMove2';
});
audioElement.addEventListener('pause', (event) => {
  $('.audio-player-button').attr('src', './static/Play-Icon.svg');
  audioPlayer.classList.remove('animate__animated', 'animate__pulse', 'animate__infinite');
  button_PlaySwitch.dataset.playing = 'false';
  statusText.innerText = 'pause';
  statusText.setAttribute('data-text', 'pause');
  triangle.style.animationName = 'none';
});
audioElement.play();

glitch.style.display = 'block';
glitch.style.setProperty('--animate-duration', '1s');
glitch.classList.add('animate__animated', 'animate__fadeIn');

let dial_threshold = new Nexus.Dial('#dial_threshold', {
  'size': [75,75],
  'interaction': 'vertical', // "radial", "vertical", or "horizontal"
  'mode': 'relative', // "absolute" or "relative"
  'min': -100,
  'max': 0,
  'step': 0.1,
  'value': -50
})
let number_threshold = new Nexus.Number('#number_threshold')
number_threshold.link(dial_threshold)
dial_threshold.on('change', function(v) { dynamicsCompressorNode.threshold.setValueAtTime(v, audioCtx.currentTime); })
let dial_knee = new Nexus.Dial('#dial_knee', {
  'size': [75,75],
  'interaction': 'vertical', // "radial", "vertical", or "horizontal"
  'mode': 'relative', // "absolute" or "relative"
  'min': 0.1,
  'max': 40.0,
  'step': 0.1,
  'value': 40.0
})
let number_knee = new Nexus.Number('#number_knee')
number_knee.link(dial_knee)
dial_knee.on('change', function(v) { dynamicsCompressorNode.knee.setValueAtTime(v, audioCtx.currentTime); })
let dial_ratio = new Nexus.Dial('#dial_ratio', {
  'size': [75,75],
  'interaction': 'vertical', // "radial", "vertical", or "horizontal"
  'mode': 'relative', // "absolute" or "relative"
  'min': 1,
  'max': 20,
  'step': 0.1,
  'value': 12.0
})
let number_ratio = new Nexus.Number('#number_ratio')
number_ratio.link(dial_ratio)
dial_ratio.on('change', function(v) { dynamicsCompressorNode.ratio.setValueAtTime(v, audioCtx.currentTime); })
let dial_attack = new Nexus.Dial('#dial_attack', {
  'size': [75,75],
  'interaction': 'vertical', // "radial", "vertical", or "horizontal"
  'mode': 'relative', // "absolute" or "relative"
  'min': 0.001,
  'max': 1.0,
  'step': 0.001,
  'value': 0.0
})
let number_attack = new Nexus.Number('#number_attack')
number_attack.link(dial_attack)
dial_attack.on('change', function(v) { dynamicsCompressorNode.attack.setValueAtTime(v, audioCtx.currentTime); })
let dial_release = new Nexus.Dial('#dial_release', {
  'size': [75,75],
  'interaction': 'vertical', // "radial", "vertical", or "horizontal"
  'mode': 'relative', // "absolute" or "relative"
  'min': 0.001,
  'max': 1.0,
  'step': 0.001,
  'value': 0.25
})
let number_release = new Nexus.Number('#number_release')
number_release.link(dial_release)
dial_release.on('change', function(v) { dynamicsCompressorNode.release.setValueAtTime(v, audioCtx.currentTime); })

function setPreset_dynamicsCompressor(a, b, c, d, e) {
  number_threshold.value = a;
  number_knee.value = b;
  number_ratio.value = c;
  number_attack.value = d;
  number_release.value = e;
}

document.getElementById('button_setPreset_dynamicsCompressor_None').addEventListener('click', () => {
  setPreset_dynamicsCompressor(0.0, 30.0, 1.0, 0.003, 0.25)
});
document.getElementById('button_setPreset_dynamicsCompressor_Low').addEventListener('click', () => {
  setPreset_dynamicsCompressor(-12.0, 30.0, 6.0, 0.003, 0.25)
});
document.getElementById('button_setPreset_dynamicsCompressor_Medium').addEventListener('click', () => {
  setPreset_dynamicsCompressor(-30.0, 30.0, 12.0, 0.003, 0.25)
});
document.getElementById('button_setPreset_dynamicsCompressor_High').addEventListener('click', () => {
  setPreset_dynamicsCompressor(-50.0, 30.0, 20.0, 0.003, 0.25)
});

// function updateCurrentPlayingTitle(uri) { // https://stackoverflow.com/questions/8567114/how-can-i-make-an-ajax-call-without-jquery
//   const xhttp = new XMLHttpRequest();
//   xhttp.onload = function() { document.getElementById('CURRENT_PLAYING_TITLE').innerHTML = JSON.parse(this.responseText).icestats.source[0].title.slice(0, 512); }
//   xhttp.open("GET", uri, true);
//   xhttp.send();
// }
// setInterval(() => {
//   updateCurrentPlayingTitle('https://www.radiomast.io/stream/0096c4fc-e4c2-4bdc-bce7-0419448040a8/icecast/status-json.xsl')
// }, 1000*3);

} else { alert('Requires browser support for WebGL 2 and Web Audio API.') }

});