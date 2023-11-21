const pixelGrid = document.getElementById("pixel-grid");
const saveButton = document.getElementById("save-button");
const colorPalette = document.getElementById("color-palette");
const colorPicker = document.getElementById("color-picker");
const gridSizeInput = document.getElementById("grid-size");
const eraserSizeInput = document.getElementById("eraser-size");
const pencilButton = document.getElementById("pencil-button");
const eraseButton = document.getElementById("erase-button");
const fillButton = document.getElementById("fill-button");
const colors = ["#ffffff", "#000000", "#ff0000", "#0000ff", "#00ff00"];

let selectedColor = colorPicker.value;
let gridSize = parseInt(gridSizeInput.value);
let eraserSize = parseInt(eraserSizeInput.value);
let usingPencil = false;
let usingEraser = false;
let filling = false;

colorPicker.addEventListener("input", (event) => {
  selectedColor = event.target.value;
});

gridSizeInput.addEventListener("input", (event) => {
  gridSize = parseInt(event.target.value);
  createPixelGrid(gridSize);
});

eraserSizeInput.addEventListener("input", (event) => {
  eraserSize = parseInt(event.target.value);
});

pencilButton.addEventListener("click", () => {
  usingPencil = true;
  usingEraser = false;
  pencilButton.classList.add("active");
  eraseButton.classList.remove("active");
  fillButton.classList.remove("active");
});

eraseButton.addEventListener("click", () => {
  usingPencil = false;
  usingEraser = true;
  pencilButton.classList.remove("active");
  eraseButton.classList.add("active");
  fillButton.classList.remove("active");
});

fillButton.addEventListener("click", () => {
  usingPencil = false;
  usingEraser = false;
  pencilButton.classList.remove("active");
  eraseButton.classList.remove("active");
  fillButton.classList.add("active");
});

// Создаем сетку пикселей
function createPixelGrid(size) {
  pixelGrid.innerHTML = "";
  pixelGrid.style.gridTemplateColumns = `repeat(${size}, 20px)`;

  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.style.backgroundColor = colors[0];

    pixel.addEventListener("mousedown", () => {
      if (usingPencil) {
        drawPixel(pixel);
      } else if (usingEraser) {
        erasePixels(pixel);
      } else if (filling) {
        fillPixel(pixel);
      } else {
        pixel.style.backgroundColor = selectedColor;
      }
    });

    pixelGrid.appendChild(pixel);
  }
}

// Функция для рисования пикселя карандашом
function drawPixel(pixel) {
  pixel.style.backgroundColor = selectedColor;
}

// Функция для стирания пикселей
function erasePixels(pixel) {
  const startIndex = Array.from(pixelGrid.children).indexOf(pixel);
  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;

  const halfEraserSize = Math.floor(eraserSize / 2);

  for (let row = Math.max(startRow - halfEraserSize, 0); row < Math.min(startRow + halfEraserSize + 1, gridSize); row++) {
    for (let col = Math.max(startCol - halfEraserSize, 0); col < Math.min(startCol + halfEraserSize + 1, gridSize); col++) {
      const index = row * gridSize + col;
      const currentPixel = pixelGrid.children[index];
      currentPixel.style.backgroundColor = colors[0];
    }
  }
}

// Функция для заливки пикселя и соседних пикселей
function fillPixel(pixel) {
  const targetColor = pixel.style.backgroundColor;
  const queue = [pixel];

  while (queue.length > 0) {
    const currentPixel = queue.shift();
    if (currentPixel.style.backgroundColor === targetColor) {
      currentPixel.style.backgroundColor = selectedColor;
      const neighbors = getNeighbors(currentPixel);
      queue.push(...neighbors);
    }
  }
}

// Функция для получения соседних пикселей
function getNeighbors(pixel) {
  const index = Array.from(pixelGrid.children).indexOf(pixel);
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const neighbors = [];

  if (row > 0) neighbors.push(pixelGrid.children[(row - 1) * gridSize + col]);
  if (row < gridSize - 1) neighbors.push(pixelGrid.children[(row + 1) * gridSize + col]);
  if (col > 0) neighbors.push(pixelGrid.children[row * gridSize + col - 1]);
  if (col < gridSize - 1) neighbors.push(pixelGrid.children[row * gridSize + col + 1]);

  return neighbors;
}

// Инициализация сетки пикселей
createPixelGrid(gridSize);

// Создаем палитру цветов
colors.forEach((color) => {
  const colorDiv = document.createElement("div");
  colorDiv.classList.add("color");
  colorDiv.style.backgroundColor = color;

  colorDiv.addEventListener("click", () => {
    colors.unshift(colors.pop());
    colorDiv.style.backgroundColor = colors[0];
  });

  colorPalette.appendChild(colorDiv);
});

// Обработчик события нажатия на кнопку "Сохранить"
saveButton.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = gridSize * 20;
  canvas.height = gridSize * 20;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pixels = document.getElementsByClassName("pixel");
  for (let i = 0; i < pixels.length; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const color = pixels[i].style.backgroundColor;
    ctx.fillStyle = color;
    ctx.fillRect(col * 20, row * 20, 20, 20);
  }

  const image = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = image;
  a.download = "pixel_art.png";
  a.click();
});

// ...

// Новая кнопка "Сохранить в PNG"
const saveToPNGButton = document.getElementById("save-to-png-button");
const fileInput = document.getElementById("file-input");

// Обработчик события нажатия на кнопку "Сохранить в PNG"
saveToPNGButton.addEventListener("click", () => {
  fileInput.click();
});

// Обработчик события выбора файла
fileInput.addEventListener("change", handleFileSelect);

// Функция для обработки выбранного файла
function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // Очищаем холст
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисуем изображение на холсте
        ctx.drawImage(img, 0, 0);

        // Получаем данные URL изображения с прозрачным фоном
        const imageWithTransparentBG = canvas.toDataURL("image/png");

        // Сохраняем изображение на сервере (здесь нужно добавить логику сохранения на вашем сервере)
        saveImageOnServer(imageWithTransparentBG);
      };
    };

    reader.readAsDataURL(file);
  }
}

// Функция для сохранения изображения на сервере (замените эту функцию на вашу логику сохранения)
function saveImageOnServer(imageData) {
  // Здесь должен быть код для отправки изображения на сервер
  // Например, использование AJAX или других методов
  // Обратитесь к документации вашего сервера или фреймворка
  console.log("Изображение успешно сохранено на сервере!");
}

// ...