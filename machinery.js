
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
  addDot(stockCanvas, xx, yy, color, source.history[0]);

  var active = document.createElement('label');
  active.classList.add('active-label');
  active.innerHTML = source.ticker;
  active.style = `color: ${color}AA; top: ${initialHeight}; `;
  stockCanvas.parentElement.insertBefore(active, stockCanvas);

  for (var i = 1; i < source.history.length; i++) {
    var xx = stepHorizontal*i;
    var yy = canvasHeight - source.history[i] * figure.scale + stride;
    canvas.lineTo(xx, yy);

    addDot(stockCanvas, xx, yy, color, source.history[i]);

    // console.log(`${i}: ${xx}, ${yy}`);
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
  cellRate.innerHTML = `${ratePercent.toFixed(2)}% ($${(rate > 0 ? '+': '') + diff.toRepresent(2)})`;
  cellRate.style = `color: ${rate > 0 ? '#22FF99' : '#FF6666'}; `;
  row.appendChild(cellRate);

  table.appendChild(row);
}
function addDot (parent, xx, yy, color, value) {
    var spot = document.createElement('div');
    spot.classList.add('stock-slot');
    spot.style = `top: ${yy}px; left: ${xx}px; color: ${color}`;
    spot.setAttribute('value', `$${value.toRepresent(2)}`);
    parent.parentElement.insertBefore(spot, parent);
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
  var subratio = ratio(sub);
  var minratio = ratio(min);
  console.log(ceilBy(subratio));
  if (ratio > minratio*10) {
    subratio /= 10;
  }

  var ceiling = ceilBy((max+1*minratio)/subratio)*subratio;
  var floor = floorBy((min-1*minratio)/subratio)*subratio;
  var diff = ceiling - floor;

  return {
    diff: diff,
    ceiling: ceiling,
    floor: floor,
    scale: height / diff,
    stride: floor
  };
}
Number.prototype.toRepresent = function (force) {
  var value = this.valueOf();

  if (ratio(value) > 1) {
    if (value % 1 == 0.5 || value % 1 == 0.25) {
      return value;
    }
    if (force) {
      return parseFloat(value.toFixed(force));
    }
    if (value % 1 != 0) {
      return parseFloat(Math.floor(value));
    }
    return value;
  }

  switch (house(value)) {
    case 1: case 2: case 5: case 4:
      return parseFloat(floorBy(value));
  }
  return parseFloat(value.toFixed(5));
};

function ratio (n) {
  return Math.pow(10, floorBy(Math.log10(n)));
}
function remain (n) {
  return +(n.toString().slice(-1));
}

function house (n) {
  if (n >= 1) {
    return n.toString().length;
  }
  return -(n.toString().length-2);
}

function proportional (n, level) {
  return Math.pow(10, house(level))*n;
}


function floorBy (n) {
  if (n >= 1) {
    return Math.floor(n);
  }
  return +(n - proportional(remain(n), n));
}
function ceilBy (n) {
  if (n >= 1) {
    return Math.ceil(n);
  }
  return +(n + proportional(10-remain(n), n));
}

var extremities = extremities(actives);

initCanvas(canvasContext);
for (var active in actives) {
  drawCanvas(canvasContext, actives[active]);
}
