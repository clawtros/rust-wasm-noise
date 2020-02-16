import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";
import {fps} from "./fps";

const state = {
  currentScale: 0.00465
}
const smod = 4;
const width = parseInt(window.innerWidth / smod);
const height = parseInt(window.innerHeight / smod);
const initialScale = 0.00625;
const grid = NoiseGrid.new(width, height, initialScale);
const canvas = document.getElementById("render-canvas");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
const cellsPtr = grid.cells();

const drawCells = function() {
  const imageData = ctx.getImageData(0,0,width, height);
  imageData.data.set(new Uint8Array(memory.buffer, grid.image_data(), width * height * 4));
  ctx.putImageData(imageData, 0, 0);
}

const handleSuccess = function(stream) {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 64;
  state.dataArray = new Uint8Array(analyser.frequencyBinCount);
  state.analyser = analyser;
};

var steps = 0;
const renderLoop = function () {
  //fps.render();
  //  grid.set_scale(initialScale - (Math.sin(steps++ * 0.0125) + 5.5) / 100);
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0, 0, width, height);

  drawCells();
  if (state.analyser) {
    ctx.fillStyle="#ff0000";
    state.analyser.getByteTimeDomainData(state.dataArray);
    ctx.moveTo(0, height / 2);
    let sum = 0;
    for (var i = 0, l = state.dataArray.length; i  < l; i++) {
      let p = state.dataArray[i];
      sum += p;
      let barwidth = width / l;
      //ctx.lineTo(i * barwidth, p);
    }
    let v = (sum / state.dataArray.length - 127) / 1000;
    grid.tick(v);
    console.log(v)
    //ctx.strokeStyle="#ff0000";
    //ctx.stroke();
  }
  requestAnimationFrame(renderLoop);
}

renderLoop();

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
         .then(handleSuccess);
