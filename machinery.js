
var stockTable = document.querySelector('#main-stock-table');

var stockCanvas = document.querySelector('#main-stock-canvas');
var canvasContext = stockCanvas.getContext('2d');
canvasContext.imageSmoothingEnabled = true;


// var actives = [ {
//     ticker: 'AAA',
//     name: 'American Airconditioner and Airbags',
//     color: '#FFFF8C',
//     history: [15, 16, 19, 24, 28, 30, 31, 37, 39, 34, 42, 45, 50, 56, 61, 59, 57, 58, 56, 54, 66, 85, 110, 176.52]
//   },
//   {
//     ticker: 'BBB',
//     name: 'Bobby\'s Bristol Barbershop',
//     color: '#FF8FAC',
//     history: [35, 38, 42, 45, 42, 46, 51, 57, 58, 54, 61, 54, 48, 45, 42, 48, 51, 57, 62, 58, 61, 54, 48, 36.55]
//   },
//   {
//     ticker: 'CCC',
//     name: 'Charles & Cody Carpentry',
//     color: '#88FFFF',
//     history: [76, 72, 78, 86, 82, 78, 71, 76, 68, 66, 68, 67, 70, 76, 82, 78, 71, 67, 68, 68, 51, 43, 39, 30.43]
//   }
// ];

var actives = [
  {
    ticker: 'AAA',
    name: 'American Airconditioner and Airbags',
    color: '#FFFF8C',
    history: [0.005, 0.003, 0.008, 0.007, 0.009, 0.012, 0.014, 0.008, 0.0091]
  },
  {
    ticker: 'BBB',
    name: 'Bobby\'s Bristol Barbershop',
    color: '#FF8FAC',
    history: [0.028, 0.030, 0.035, 0.037, 0.034, 0.032, 0.031, 0.026, 0.02437]
  },
  {
    ticker: 'CCC',
    name: 'Charles & Cody Carpentry',
    color: '#88FFFF',
    history: [0.02, 0.016, 0.015, 0.012, 0.016, 0.023, 0.0286, 0.0426, 0.04894]
  }
];

var canvasHeight = stockCanvas.offsetHeight;
var canvasWidth = stockCanvas.offsetWidth;

function initCanvas (canvas) {
  console.log('Initiating Canvas');
  canvasContext.lineCap = 'round';
  canvasContext.lineWidth = 1;
  canvas.strokeStyle = "#FCFCFC22";

  var figure = calcScale(240, extremities.min, extremities.max);
  var activeHeight = figure.ceiling - figure.stride;

  var steps = idealStep(figure.floor, figure.ceiling);

  var stepVertical = canvasHeight / steps;
  var stepCanvas = activeHeight / steps;
  var stride = figure.stride * figure.scale;

  // Draw Guidelines
  for (var i = 0; i <= steps; i++) {
    var vy = i*stepVertical;
    var yy = i*stepCanvas;
    canvas.beginPath();
    canvas.moveTo(0, vy);
    canvas.lineTo(canvasWidth, vy);
    canvas.stroke();

    var top = figure.ceiling - yy;

    var ruler = document.createElement('label');
    ruler.classList.add('guideline-label');
    // ruler.innerHTML = Math.floor(top);
    ruler.innerHTML = top.toRepresent();
    ruler.style = `top: ${vy}; `;
    stockCanvas.parentElement.insertBefore(ruler, stockCanvas);
  }
}
function idealStep (floor, ceiling) {
  var stridiff = ceiling - floor;
  var step = 5;
  for (var i = 8; i >= 3; i--) {
    var calci = floorBy(stridiff/i);
    if (calci%5 === 0 || calci%5 === 5) {
      step = i;
      break;
    }
  }
  return step;
}

function drawCanvas (canvas, source, highlight) {
  var color = source.color;
  console.log(`Drawing '${source.ticker}' Canvas`);
  canvas.strokeStyle = color + (highlight ? (highlight == source.ticker ? '': '55') : '99');
  canvas.lineWidth = 2;
  canvas.setLineDash([]);

  var stepHorizontal = canvasWidth / (source.history.length -1);
  var figure = calcScale(canvasHeight, extremities.min, extremities.max);
  var stride = figure.stride * figure.scale;

  canvas.beginPath();

  var initialHeight = propVertical(canvasHeight, source.history[0], figure.scale, stride);
  canvas.moveTo(0, initialHeight);
  renderDot(canvas, source, stockCanvas, xx, yy, color, source.history[0]);

  for (var i = 1; i < source.history.length; i++) {
    var xx = stepHorizontal*i;
    var yy = propVertical(canvasHeight, source.history[i], figure.scale, stride);
    canvas.lineTo(xx, yy);

    // if (!highlight || highlight == source.ticker) {
      renderDot(canvas, source, stockCanvas, xx, yy, color, source.history[i]);
    // }

    // console.log(`${i}: ${xx}, ${yy}`);
  }
  canvas.stroke();

  if (highlight == source.ticker) {
    drawGradient(canvas, source, stepHorizontal, initialHeight, figure.scale, stride, color);
  }

  var active = document.createElement('label');
  active.classList.add('active-label');
  active.innerHTML = source.ticker;
  active.style = `color: ${color}AA; top: ${initialHeight}; `;
  active.onclick = () => { updateCanvas(canvas, source.ticker) };
  stockCanvas.parentElement.insertBefore(active, stockCanvas);

  renderRow(canvas, stockTable, source, color);
}

function renderRow (canvas, table, source, color) {

  var rowFirst = document.createElement('tr');
  rowFirst.classList.add('stock-row');
  rowFirst.onclick = () => { updateCanvas(canvas, source.ticker) };

  var cellColor = document.createElement('td');
  cellColor.classList.add('stock-cell-color');
  cellColor.style = `background: ${color}; `;
  cellColor.setAttribute('rowspan', 2);
  rowFirst.appendChild(cellColor);

  var cellName = document.createElement('td');
  cellName.classList.add('stock-cell-name');
  cellName.innerHTML = `<i>${source.name}</i>`;
  rowFirst.appendChild(cellName);

  var cellValue = document.createElement('td');
  cellValue.classList.add('stock-cell-rate');
  cellValue.innerHTML = `$${source.history[source.history.length-1]}`;
  rowFirst.appendChild(cellValue);

  // Second Row
  var rowSecond = document.createElement('tr');
  rowSecond.classList.add('stock-row');
  rowSecond.classList.add('sub');
  rowSecond.onclick = () => { updateCanvas(canvas, source.ticker) };

  var cellInfo = document.createElement('td');
  cellInfo.classList.add('stock-cell-name');
  cellInfo.innerHTML = `${source.ticker}`;
  rowSecond.appendChild(cellInfo);

  var cellRate = document.createElement('td');
  cellRate.classList.add('stock-cell-rate');
  var diff = source.history[source.history.length-1] - source.history[0];
  var rate = diff / source.history[0];
  var ratePercent = rate*100;
  cellRate.innerHTML = `${ratePercent.toFixed(2)}% ($${(rate > 0 ? '+': '') + diff.toRepresent(2)})`;
  cellRate.style = `color: ${rate > 0 ? '#22FF99' : '#FF6666'}; `;
  rowSecond.appendChild(cellRate);

  table.appendChild(rowFirst);
  table.appendChild(rowSecond);
}
function renderDot (canvas, source, parent, xx, yy, color, value) {
  var spot = document.createElement('div');
  spot.classList.add('stock-slot');
  spot.style = `top: ${yy}px; left: ${xx}px; color: ${color}`;
  spot.setAttribute('value', `$${value.toRepresent(2)}`);

  spot.onclick = () => { updateCanvas(canvas, source.ticker) };
  parent.parentElement.insertBefore(spot, parent);
}

function drawGradient (canvas, source, steph, iy, scale, stride, color) {
  var gradient = canvas.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, `${source.color}77`);
  gradient.addColorStop(1, `${source.color}01`);
  canvas.fillStyle = gradient;

  canvas.beginPath();
  canvas.moveTo(0, canvasHeight);
  canvas.lineTo(0, iy);

  for (var i = 1; i < source.history.length; i++) {
    var xx = steph*i;
    var yy = propVertical(canvasHeight, source.history[i], scale, stride);
    canvas.lineTo(xx, yy);
  }

  canvas.lineTo(canvasWidth, canvasHeight);
  canvas.closePath();
  canvas.fill();
}

var currentHighlight;
function updateCanvas (canvas, highlight) {
  if (highlight !== currentHighlight) {
    currentHighlight = highlight;

    removeClassElements('.guideline-label');
    removeClassElements('.stock-slot');
    removeClassElements('.stock-row');
    removeClassElements('.active-label');

    canvas.clearRect(0, 0, stockCanvas.width, stockCanvas.height);
    initCanvas(canvasContext);

    for (var active in actives) {
      drawCanvas(canvas, actives[active], highlight);
    }
  }
}
stockCanvas.onclick = () => { updateCanvas(canvasContext) };

function removeClassElements (className) {
  var elements = document.querySelectorAll(className);
  for(var i = 0; i < elements.length; i++) {
    elements[i].parentNode.removeChild(elements[i]);
  }
}

var extremities = extremities(actives);

initCanvas(canvasContext);
for (var active in actives) {
  drawCanvas(canvasContext, actives[active]);
}
