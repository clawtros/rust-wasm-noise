import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";

const ratio = window.innerWidth / window.innerHeight;

const width = parseInt(window.innerWidth / 2);
const height = parseInt(window.innerHeight / 2);
const grid = NoiseGrid.new(width, height, 0.05, 0.025);
const canvas = document.getElementById("render-canvas");
const fps = document.getElementById("fps");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
const cellsPtr = grid.cells();

const drawCells = function() {
  const cells = new Float64Array(memory.buffer, cellsPtr, width * height);  
  const imageData = ctx.createImageData(width, height);
  for (var i = 0; i < cells.length; i++) {
    let cell = (cells[i] + 0.5) * 128;
    let idx = i * 4;
    imageData.data[idx] = cell;
    imageData.data[idx + 1] = cell;
    imageData.data[idx + 2] = cell;
    imageData.data[idx + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

let lastDelta = 0;
const renderLoop = function (delta) {
  requestAnimationFrame(renderLoop);

  grid.tick();
  drawCells();

  fps.innerText = (1000 / (delta - lastDelta)).toFixed(1) + "fps"; 
  lastDelta = delta;
}

renderLoop();