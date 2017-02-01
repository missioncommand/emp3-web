
var eiffelTower = new emp3.api.LookAt({
  name: 'Eiffel Tower',
  latitude: 48.8580,
  longitude: 2.2946,
  altitude: 300, // Tip of the tower
  range: 500,
  heading: 0,
  tilt: 45
});

var leaningTower = new emp3.api.LookAt({
  name: 'Leaning Tower',
  latitude: 43.7230,
  longitude: 10.3966,
  altitude: 56.7,
  range: 500,
  heading: 90, // The tower is leaning to the south
  tilt: 45
});

var tokyoTower = new emp3.api.LookAt({
  name: 'Tokyo Tower',
  latitude: 35.6586,
  longitude: 139.7454,
  altitude: 332.9,
  range: 1000,
  heading: 0,
  tilt: 45
});

var willisTower = new emp3.api.LookAt({
  name: 'Willis Tower',
  latitude: 41.8789,
  longitude: -87.6359,
  altitude: 442.1,
  range: 100000,
  heading: 0,
  tilt: 45
});

var towers = [
  eiffelTower,
  leaningTower,
  tokyoTower,
  willisTower
];

function visitTower(towerIdx) {
  showToaster('Visiting ' + towers[towerIdx].name);
  map1.setLookAt({
    lookAt: towers[towerIdx],
    onSuccess: function() {
      if (towerIdx < towers.length) {
        setTimeout(visitTower, 10000, towerIdx + 1);
      }
    }
  });
}

// Go for a tower tour
visitTower(0);