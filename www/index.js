import {NoiseGrid} from "wasm-noise";
import {memory} from "wasm-noise/wasm_noise_bg";

const width = parseInt(window.innerWidth / 15) ;

const height = parseInt(window.innerHeight / 15);
const grid = NoiseGrid.new(width, height, 0.025, 0.025);
const canvas = document.getElementById("render-canvas");
const fps = document.getElementById("fps");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
const cellsPtr = grid.cells();

const drawCells = function() {
  const cells = new Float64Array(memory.buffer, cellsPtr, width * height);  
  for (var i = 0; i < cells.length; i++) {
    const [x, y] = [i % width, i / width];
    ctx.fillStyle = `hsl(${parseInt((cells[i] + 0.5) * 360)}deg, 70%, 50%)`;
    ctx.fillRect(x, y, 1, 1);
  }
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