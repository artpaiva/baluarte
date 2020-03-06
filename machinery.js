
var stockTable = document.querySelector('#main-stock-table');

var stockCanvas = document.querySelector('#main-stock-canvas');
var canvasContext = stockCanvas.getContext('2d');
canvasContext.imageSmoothingEnabled = true;

var actives = [ {
    ticker: 'AAA',
    name: 'American Airconditioner and Airbags',
    color: '#FFFF8C',
    history: [15, 16, 19, 30, 38, 41, 31, 37, 56, 54, 66, 85, 110, 176.52]
  },
  {
    ticker: 'BBB',
    name: 'Bobby\'s Bristol Barbershop',
    color: '#FF8FAC',
    history: [35, 38, 48, 45, 42, 38, 51, 57, 78, 58, 61, 54, 48, 36.55]
  },
  {
    ticker: 'CCC',
    name: 'Charles & Cody Carpentry',
    color: '#88FFFF',
    history: [76, 72, 78, 86, 82, 78, 71, 67, 68, 68, 51, 43, 28, 30.43]
  }
];

var canvasHeight = stockCanvas.offsetHeight;
var canvasWidth = stockCanvas.offsetWidth;

function initCanvas (canvas) {
  console.log('Initiating Canvas');
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
    var hy = i*stepVertical;
    var yy = i*stepCanvas;
    canvas.beginPath();
    canvas.moveTo(0, hy);
    canvas.lineTo(canvasWidth, hy);
    canvas.stroke();

    var top = figure.ceiling - yy;

    var ruler = document.createElement('label');
    ruler.classList.add('guideline-label');
    ruler.innerHTML = Math.floor(top);
    ruler.style = `top: ${hy}; `;
    stockCanvas.parentElement.insertBefore(ruler, stockCanvas);
  }
}
function idealStep (floor, ceiling) {
  var stridiff = ceiling - floor;
  var step = 5;
  for (var i = 8; i >= 3; i--) {
    var calci = Math.floor(stridiff/i);
    if (calci%5 === 0 || calci%5 === 5) {
      step = i;
      break;
    }
  }
  return step;
}

function drawCanvas (canvas, source) {
  var color = source.color;
  console.log('Drawing Canvas');
  canvasContext.strokeStyle = `${color}77`;
  canvasContext.lineWidth = 2;

  var stepHorizontal = canvasWidth / (source.history.length -1);
  var figure = calcScale(240, extremities.min, extremities.max);
  var stride = figure.stride * figure.scale;

  canvas.beginPath();

  var initialHeight = canvasHeight - source.history[0] * figure.scale + stride;
  canvas.moveTo(0, initialHeight);

  var active = document.createElement('label');
  active.classList.add('active-label');
  active.innerHTML = source.ticker;
  active.style = `color: ${color}AA; top: ${initialHeight}; `;
  stockCanvas.parentElement.insertBefore(active, stockCanvas);

  for (var i = 1; i < source.history.length; i++) {
    var xx = stepHorizontal*i;
    var yy = canvasHeight - source.history[i] * figure.scale + stride;
    canvas.lineTo(xx, yy);

    var spot = document.createElement('div');
    spot.classList.add('stock-slot');
    spot.style = `top: ${yy}px; left: ${xx}px; color: ${color}`;
    spot.setAttribute('value', `$${source.history[i].toFixed(2)}`);
    stockCanvas.parentElement.insertBefore(spot, stockCanvas);

    console.log(`${i}: ${xx}, ${yy}`);
  }
  canvas.stroke();

  addRow(stockTable, source, color);
}

function addRow (table, source, color) {
  var row = document.createElement('tr');
  row.classList.add('stock-row');

  var cellColor = document.createElement('td');
  cellColor.classList.add('stock-cell-color');
  cellColor.style = `background: ${color}; `;
  row.appendChild(cellColor);

  var cellName = document.createElement('td');
  cellName.classList.add('stock-cell-name');
  cellName.innerHTML = `${source.ticker} - <i>${source.name}</i>`;
  row.appendChild(cellName);

  var cellRate = document.createElement('td');
  cellRate.classList.add('stock-cell-rate');
  var diff = source.history[source.history.length-1] - source.history[0];
  var rate = diff / source.history[0];
  var ratePercent = rate*100;
  cellRate.innerHTML = `${ratePercent.toFixed(2)}% ($ ${(rate > 0 ? '+': '') + diff.toFixed(2)})`;
  cellRate.style = `color: ${rate > 0 ? '#22FF99' : '#FF6666'}; `;
  row.appendChild(cellRate);

  table.appendChild(row);
}

function extremities (source) {
  var min = 100000000000;
  var max = 0;
  for (var i = 0; i < source.length; i++) {
    var active = source[i].history;
    for (var j = 0; j < active.length; j++) {
      if (active[j] > max) max = active[j];
      if (active[j] < min) min = active[j];
    }
  }
  return {
    min: min,
    max: max
  }
}

function calcScale (height, min, max) {
  var sub = max - min;
  var ratio = Math.pow(10, Math.floor(Math.log10(sub)));
  var minratio = Math.pow(10, Math.floor(Math.log10(min)));
  if (ratio > minratio*10) {
    ratio /= 10;
  }

  var ceiling = Math.ceil((max+1)/ratio)*ratio;
  var floor = Math.floor(min/ratio)*ratio;
  var diff = ceiling - floor;

  return {
    diff: diff,
    ceiling: ceiling,
    floor: floor,
    scale: height / diff,
    stride: floor
  };
}

var extremities = extremities(actives);

initCanvas(canvasContext);
for (var active in actives) {
  drawCanvas(canvasContext, actives[active]);
}
