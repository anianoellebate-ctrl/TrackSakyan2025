// utils/geoUtils.js
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const closestPointOnSegment = (A, B, C) => {
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const AC = { x: C.x - A.x, y: C.y - A.y };
  const dotAB_AC = AB.x * AC.x + AB.y * AC.y;
  const dotAB_AB = AB.x * AB.x + AB.y * AB.y;
  let t = dotAB_AC / dotAB_AB;
  t = Math.max(0, Math.min(1, t));
  const D = { x: A.x + AB.x * t, y: A.y + AB.y * t };
  return { point: D, t };
};

const findNearestPointOnRoute = (point, routeCoords) => {
  if (routeCoords.length < 2) {
    const dist = haversineDistance(point.lat, point.lng, routeCoords[0][0], routeCoords[0][1]);
    return { point: routeCoords[0], distance: dist, segment: 0, t: 0 };
  }

  let minDistance = Infinity;
  let nearestPoint = null;
  let nearestSegment = -1;
  let nearestT = -1;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const A = { x: routeCoords[i][1],     y: routeCoords[i][0] };     // lng, lat
    const B = { x: routeCoords[i+1][1],   y: routeCoords[i+1][0] };
    const C = { x: point.lng,             y: point.lat };
    const { point: D, t } = closestPointOnSegment(A, B, C);
    const dist = haversineDistance(point.lat, point.lng, D.y, D.x);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = [D.y, D.x];
      nearestSegment = i;
      nearestT = t;
    }
  }

  return { point: nearestPoint, distance: minDistance, segment: nearestSegment, t: nearestT };
};

module.exports = { haversineDistance, findNearestPointOnRoute };