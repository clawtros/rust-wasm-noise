import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";
import {fps} from "./fps";

const state = {};
const smod = 4;
const width = 512; //parseInt(window.innerWidth / smod);
const height = 512; //parseInt(window.innerHeight / smod);
const initialScale = 0.00625;
const grid = NoiseGrid.new(width, height, initialScale);
const canvas = document.getElementById("render-canvas");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");

const drawCells = function() {  
  const imageData = ctx.getImageData(0,0, width, height);
  const newData = new Uint8Array(memory.buffer, grid.image_data(), width * height * 4)
  imageData.data.set(newData);
  ctx.putImageData(imageData, 0, 0);
}

const handleSuccess = function(stream) {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 128;
  state.dataArray = new Uint8Array(analyser.frequencyBinCount);
  state.analyser = analyser;
};

const audioframes = 5;
var steps = 0;
var lastV = 0;
let vs = [];
let arrays = []
const renderLoop = function () {
  fps.render();
  // canvas.width = width;
  drawCells();
  if (state.analyser) {
    let max = -Infinity;
    let min = Infinity;
    ctx.fillStyle="#ff0000ff";
    let array = new Uint8Array(state.analyser.frequencyBinCount);
    state.analyser.getByteTimeDomainData(array);
    arrays.unshift(array);
    let sum = 0;
    
    let barwidth = width / state.analyser.frequencyBinCount;
    for (var i = 0, l = state.analyser.frequencyBinCount; i  < l; i++) {
      let av = 0;
      let p = 0;
      
      if (arrays.length > audioframes)  {
        for (var j = 0; j < audioframes; j++) {
          p += arrays[j][i];
          ctx.fillStyle = `hsl(${parseInt((j * 360) / audioframes)}deg, 70%, 50%)`;
          ctx.fillRect(i * barwidth, arrays[j][i], barwidth, 10);
        }
        p /= audioframes;
      }
      ctx.fillStyle = `#ffffff`;
      ctx.fillRect(i * barwidth, p - 3, barwidth, 10);
      
      max = Math.max(max, p);
      min = Math.min(min, p);
    }
    arrays = arrays.slice(0, audioframes + 1)
    grid.tick(0.00125 * (max - min));
    grid.set_audio_level((max - min) * 0.125);
  }
  requestAnimationFrame(renderLoop);
}

renderLoop();
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
         .then(handleSuccess);
