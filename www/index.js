import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";
import {fps} from "./fps";

const state = {};
const smod = 4;
const width = parseInt(window.innerWidth / smod);
const height = parseInt(window.innerHeight / smod);
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
  analyser.fftSize = 2048;
  state.dataArray = new Uint8Array(analyser.frequencyBinCount);
  state.analyser = analyser;
};

var steps = 0;
var lastV = 0;
let vs = [];
let arrays = []
const renderLoop = function () {
  canvas.width = width;
  drawCells();
  if (state.analyser) {
    ctx.fillStyle="#ff0000";
    let array = new Uint8Array(state.analyser.frequencyBinCount);
    state.analyser.getByteTimeDomainData(array);
    let sum = 0;
    for (var i = 0, l = array.length; i  < l; i++) {
      let av = 0;
      let p = 0;
      if (arrays.length > 2)  {
        for (var j = 0; j < arrays.length; j++) {
          p += arrays[j][i];
        }
        p /= (arrays.length - 1);
      }
      let barwidth = width / l;
      ctx.fillRect(i * barwidth, height, barwidth, p - height);
    }    
    arrays.unshift(array);
    arrays.slice(0, 30);
    grid.tick(0.0001);
  }
  requestAnimationFrame(renderLoop);
}

renderLoop();
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
         .then(handleSuccess);
