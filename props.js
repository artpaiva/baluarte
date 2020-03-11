
function propVertical (height, value, scale, stride) {
  return height - value * scale + stride;
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
  // console.log(ceilBy(subratio));
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