import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";

const width = 80;
const height = 80;
const grid = NoiseGrid.new(width, height, 0.05, 0.05);
const canvas = document.getElementById("render-canvas");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");

const cellsPtr = grid.cells();
const drawCells = function() {
  const cells = new Float64Array(memory.buffer, cellsPtr, width * height);  
  ctx.fillStyle = `rgb(0,0,0)`;
  ctx.fillRect(0, 0, width, height);
  for (var i = 0; i < cells.length; i++) {
    const cell = (cells[i] + 0.5) * 255;
    const [x, y] = [i % width, i / width];
    
    ctx.fillStyle = `rgb(${cell}, ${cell}, ${cell})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

const renderLoop = function () {
  grid.tick();
  drawCells();
  requestAnimationFrame(renderLoop);
}

renderLoop();