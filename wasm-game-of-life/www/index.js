import { Universe, Cell } from "wasm-game-of-life";

// Import the WebAssembly memory at the top of the file.
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 5; //px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
const ctx = canvas.getContext('2d');
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;


canvas.addEventListener("click", event => {
	const boundingRect = canvas.getBoundingClientRect();

	const scaleX = canvas.width / boundingRect.width;
	const scaleY = canvas.height / boundingRect.height;

	const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
	const canvasTop = (event.clientY - boundingRect.top) * scaleY;

	const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
	const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

	universe.toggle_cell(row, col);

	drawGrid();
	drawCells();
});

// keeping track of requestAnimationFrame so that we can turn it off
let animationId = null;


const playPauseButton = document.getElementById("play-pause");

playPauseButton.addEventListener("click", event => {
	if (isPaused()) {
		play();
	} else {
		pause();
	}
});


const isPaused = () => {
	return animationId === null;
};

const play = () => {
	playPauseButton.textContent = "⏸";
	renderLoop();
};

const pause = () => {
	playPauseButton.textContent = "▶";
	cancelAnimationFrame(animationId);
	animationId = null;
};

const renderLoop = () => {
	// debugger;
	universe.tick();

	drawGrid();
	drawCells();

	animationId = requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
	ctx.beginPath();
	ctx.strokeStyle = GRID_COLOR;

	// Vertical lines.
	for (let i = 0; i <= width; i++) {
		ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
		ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
	}

	// Horizontal lines.
	for (let j = 0; j <= height; j++) {
		ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
		ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
	}

	ctx.stroke();
};

const getIndex = (row, column) => {
	return row * width + column;
};

const drawCells = () => {
	const cellsPtr = universe.cells();
	const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

	ctx.beginPath();

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const idx = getIndex(row, col);

			ctx.fillStyle = cells[idx] === Cell.Dead
				? DEAD_COLOR
				: ALIVE_COLOR;

			ctx.fillRect(
				col * (CELL_SIZE + 1) + 1,
				row * (CELL_SIZE + 1) + 1,
				CELL_SIZE,
				CELL_SIZE,
			);
		}
	}

	ctx.stroke();
};

drawGrid();
drawCells();
play();
