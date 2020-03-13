
var stockTable = document.querySelector('#main-stock-table');

var stockCanvas = document.querySelector('#main-stock-canvas');
var canvasContext = stockCanvas.getContext('2d');
canvasContext.imageSmoothingEnabled = true;

var chart = 'line';
var lastChart = chart;

var limit = 25;

var shares = [ {
    ticker: 'AAA',
    name: 'American Airconditioner and Airbags',
    color: '#FFFF8C',
    history: [15, 16, 19, 24, 28, 30, 31, 37, 39, 34, 42, 45, 50, 56, 61, 59, 57, 58, 56, 54, 66, 85, 110, 176.52]
  },
  {
    ticker: 'BBB',
    name: 'Bobby\'s Bristol Barbershop',
    color: '#FF8FAC',
    history: [35, 38, 42, 45, 42, 46, 51, 57, 58, 54, 61, 54, 48, 45, 42, 48, 51, 57, 62, 58, 61, 54, 48, 36.55]
  },
  {
    ticker: 'CCC',
    name: 'Charles & Cody Carpentry',
    color: '#88FFFF',
    history: [76, 72, 78, 86, 82, 78, 71, 76, 68, 66, 68, 67, 70, 76, 82, 78, 71, 67, 68, 68, 51, 43, 39, 30.43]
  }
];

// var shares = [
//   {
//     ticker: 'AAA',
//     name: 'American Airconditioner and Airbags',
//     color: '#FFFF8C',
//     history: [0.005, 0.003, 0.008, 0.007, 0.009, 0.012, 0.014, 0.008, 0.0091]
//   },
//   {
//     ticker: 'BBB',
//     name: 'Bobby\'s Bristol Barbershop',
//     color: '#FF8FAC',
//     history: [0.028, 0.030, 0.035, 0.037, 0.034, 0.032, 0.031, 0.026, 0.02437]
//   },
//   {
//     ticker: 'CCC',
//     name: 'Charles & Cody Carpentry',
//     color: '#88FFFF',
//     history: [0.02, 0.016, 0.015, 0.012, 0.016, 0.023, 0.0286, 0.0426, 0.04894]
//   }
// ];

var canvasHeight = stockCanvas.offsetHeight;
var canvasWidth = stockCanvas.offsetWidth;

function initCanvas (canvas) {
  // console.log('Initiating Canvas');
  canvasContext.lineCap = 'round';
  canvasContext.lineWidth = 1;
  canvas.strokeStyle = "#FCFCFC22";
  canvas.setLineDash([]);

  var figure = calcScale(240, extreme.min, extreme.max);
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

function drawCanvas (canvas, source, chart, highlight) {
  var color = source.color;
  // console.log(`Drawing '${source.ticker}' Canvas`);

  var stepHorizontal = canvasWidth / (Math.min(source.history.length -1, limit));
  var figure = calcScale(canvasHeight, extreme.min, extreme.max);
  var stride = figure.stride * figure.scale;

  var initialHeight = propVertical(canvasHeight, source.history[source.history.length -1], figure.scale, stride);
  var finalHeight = propVertical(canvasHeight, source.history[propLimit(source.history.length, limit)], figure.scale, stride);

  switch (chart) {
    case 'candle':
      graphCandle(canvas, source, highlight, color, stepHorizontal, figure, stride, initialHeight);
      break;
    case 'both':
      graphCandle(canvas, source, highlight, color, stepHorizontal, figure, stride, initialHeight, true);
      break;
    case 'line':
    default:
      graphLine(canvas, source, highlight, color, stepHorizontal, figure, stride, initialHeight);
      break;
  }

  if (!highlight || highlight == source.ticker) {
    var active = document.createElement('label');
    active.classList.add('active-label');
    active.innerHTML = source.ticker;
    active.style = `color: ${color}AA; top: ${finalHeight}; `;
    active.onclick = () => { updateCanvas(canvas, source.ticker) };
    stockCanvas.parentElement.insertBefore(active, stockCanvas);
  }

  renderRow(canvas, stockTable, source, color);
}
function graphLine (canvas, source, highlight, color, step, figure, stride, iy, padding, rear) {
  canvas.strokeStyle = color + (highlight ? (highlight == source.ticker ? '': '33') : '99');
  canvas.lineWidth = 2;
  canvas.setLineDash([]);

  canvas.beginPath();
  canvas.moveTo(canvasWidth-rear, iy);

  padding = padding || 0;
  rear = rear || 0;

  renderDot(canvas, source, stockCanvas, xx, yy, color, source.history[0]);

  for (var i = source.history.length-1; i >= propLimit(source.history.length, limit); i--) {
    var index = source.history.length-1 - i;

    var xx = canvasWidth - step*index - padding*index - rear;
    var yy = propVertical(canvasHeight, source.history[i], figure.scale, stride);
    canvas.lineTo(xx, yy);

    if (!highlight || highlight == source.ticker) {
      renderDot(canvas, source, stockCanvas, xx, yy, color, source.history[i]);
    }
  }
  canvas.stroke();

  if (highlight == source.ticker) {
    drawGradient(canvas, source, step, iy, figure.scale, stride, color, padding, rear);

    var trend = trendline(source.history, source.history.length, limit);
    trend.y1 = propVertical(canvasHeight, trend.y1, figure.scale, stride);
    trend.y2 = propVertical(canvasHeight, trend.y2, figure.scale, stride);

    drawTrend(canvas, source, trend, xx);
  }
}
function graphCandle (canvas, source, highlight, color, step, figure, stride, iy, both) {
  // step = 7;
  var rear = step/2;
  var padding = 2;
  canvas.lineWidth = 1;

  if (highlight == source.ticker) {
    for (var i = source.history.length-1; i > propLimit(source.history.length, limit); i--) {
      canvas.beginPath();

      var last = source.history[i-1];
      var diff = source.history[i] - last;
      var index = source.history.length-i;

      var pos = step * index;
      var xx = canvasWidth - pos - padding*index;
      var yy = propVertical(canvasHeight, source.history[i], figure.scale, stride);
      var hh = diff * figure.scale;

      canvas.fillStyle = diff >= 0 ? '#22FF99' : '#FF6666';
      canvas.fillRect(xx+padding, yy, step, hh );

      canvas.strokeStyle = canvas.fillStyle;
      var yl = propVertical(canvasHeight, source.history[i]*0.9, figure.scale, stride);
      var yh = propVertical(canvasHeight, source.history[i]*1.1, figure.scale, stride);

      canvas.moveTo(xx + rear, yl+hh);
      canvas.lineTo(xx + rear, yy+hh);
      canvas.moveTo(xx + rear, yy);
      canvas.lineTo(xx + rear, yh);

      canvas.stroke();
    }
    if (both) {
      graphLine(canvas, source, highlight, color, step, figure, stride, iy, padding, rear);
    } else {
      var trend = trendline(source.history, source.history.length, limit);
      trend.y1 = propVertical(canvasHeight, trend.y1, figure.scale, stride);
      trend.y2 = propVertical(canvasHeight, trend.y2, figure.scale, stride);

      drawTrend(canvas, source, trend, xx);
    }
  }
}

function drawTrend (canvas, source, trend, xx) {
  // console.log(trend);
  canvas.strokeStyle = `${source.color}AA`;
  canvas.lineWidth = 1;
  canvas.setLineDash([5, 2]);

  canvas.beginPath();
  canvas.moveTo(xx, trend.y1);
  canvas.lineTo(canvasWidth, trend.y2);
  canvas.stroke();
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
  cellValue.innerHTML = `$${source.history[source.history.length-1].toRepresent()}`;
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

  var minIndex = propLimit(source.history.length, limit);
  var diff = source.history[source.history.length-1] - source.history[minIndex];
  var rate = diff / source.history[minIndex];
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

function drawGradient (canvas, source, step, fy, scale, stride, color, padding, rear) {
  var gradient = canvas.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, `${source.color}AA`);
  gradient.addColorStop(1, `${source.color}01`);
  canvas.fillStyle = gradient;

  canvas.beginPath();
  canvas.moveTo(canvasWidth, canvasHeight);
  canvas.lineTo(canvasWidth, fy);

  for (var i = source.history.length-1; i >= propLimit(source.history.length, limit); i--) {
    var index = source.history.length-1 - i;

    var xx = canvasWidth - step*index - padding*index - rear;
    var yy = propVertical(canvasHeight, source.history[i], scale, stride);
    canvas.lineTo(xx, yy);
  }

  canvas.lineTo(xx, canvasHeight);
  canvas.closePath();
  canvas.fill();
}

var lastHighlight;
var currentHighlight;
function updateCanvas (canvas, highlight, force) {
  if (highlight !== currentHighlight || chart !== lastChart || force) {
    lastHighlight = currentHighlight;
    currentHighlight = highlight;

    removeClassElements('.guideline-label');
    removeClassElements('.stock-slot');
    removeClassElements('.stock-row');
    removeClassElements('.active-label');

    if (highlight) {
      extreme = extremities(shares, limit, highlight);
    } else {
      extreme = extremities(shares, limit);
      lastChart = chart;
      chart = 'line';
    }

    canvas.clearRect(0, 0, stockCanvas.width, stockCanvas.height);
    initCanvas(canvasContext);

    for (var active in shares) {
      drawCanvas(canvas, shares[active], chart, highlight);
    }
  }
}
stockCanvas.onclick = () => { updateCanvas(canvasContext) };

function switchChart (value) {
  switch (value) {
    case 'both':
      lastChart = chart;
      chart = 'both';
      updateCanvas(canvasContext, currentHighlight ? currentHighlight : lastHighlight);
      break;
    case 'candle':
      lastChart = chart;
      chart = 'candle';
      updateCanvas(canvasContext, currentHighlight ? currentHighlight : lastHighlight);
      break;
    case 'line':
    default:
      lastChart = chart;
      chart = 'line';
      updateCanvas(canvasContext, currentHighlight);
      break;
  }
}
function switchLimit (value) {
  if (limit != value) {
    limit = value;
    updateCanvas(canvasContext, currentHighlight, true);
  }
}

function removeClassElements (className) {
  var elements = document.querySelectorAll(className);
  for(var i = 0; i < elements.length; i++) {
    elements[i].parentNode.removeChild(elements[i]);
  }
}

var extreme = extremities(shares, limit);

initCanvas(canvasContext);
for (var active in shares) {
  drawCanvas(canvasContext, shares[active], chart);
}


function simulatePush () {
  for (var active in shares) {
    var rate = randomRange(0.9, 1.1);
    shares[active].history.push(shares[active].history[shares[active].history.length-1]*rate);
  }

  extreme = extremities(shares, limit);
  updateCanvas(canvasContext, currentHighlight, true);
  setTimeout(function(){simulatePush()}, 1000);
}
setTimeout(function(){simulatePush()}, 1000);
