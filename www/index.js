import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";

const width = parseInt(window.innerWidth / 4);
const height = parseInt(window.innerHeight / 4);
const grid = NoiseGrid.new(width, height, 0.025, 0.005);
const canvas = document.getElementById("render-canvas");
const fps = document.getElementById("fps");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");

const drawCells = function() {
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(new Uint8Array(memory.buffer, grid.image_data(), width * height * 4));
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