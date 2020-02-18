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
  analyser.fftSize = 32;
  state.dataArray = new Uint8Array(analyser.frequencyBinCount);
  state.analyser = analyser;
};

var steps = 0;
var lastV = 0;
let vs = [];
const renderLoop = function () {
  drawCells();
  
  if (state.analyser) {
    ctx.fillStyle="#ff0000";
    state.analyser.getByteTimeDomainData(state.dataArray);
    ctx.moveTo(0, height / 2);
    let sum = 0;
    let sums = [0,0]
    for (var i = 0, l = state.dataArray.length; i  < l; i++) {
      let p = state.dataArray[i];
      sum += p;
      sums[parseInt((i / state.dataArray.length) * 2)] += p
      let barwidth = width / l;
      ctx.lineTo(i * barwidth, p);
    }

    vs.push((sum / state.dataArray.length - 127));
    vs = vs.slice(-20);
    let v = vs.reduce((a,b)=>a+b, 0) / vs.length;
    grid.tick(v * 0.01);
    grid.set_audio_level(v * 0.01);

    /* ctx.fillRect(0, 0, sums[0] / 10, 20)
     * ctx.fillRect(0, 30, sums[1] / 10, 20) */
    lastV = v;
  }
  requestAnimationFrame(renderLoop);
}

renderLoop();

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
         .then(handleSuccess);
