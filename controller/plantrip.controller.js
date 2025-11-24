// const db = require('../database');
// const { haversineDistance, findNearestPointOnRoute } = require('../utils/geoUtils');

// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng, maxWalkingDistance = 2.0 } = req.body;

//     console.log('🔍 TRIP PLANNING:');
//     console.log('Start:', startLat, startLng);
//     console.log('End:', endLat, endLng);

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Start and end coordinates are required' 
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint = { lat: parseFloat(endLat), lng: parseFloat(endLng) };

//     // Get jeepney routes from database
//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`📊 Routes in DB: ${routesResult.rows.length}`);

//     const directRoutes = [];

//     // Find routes that connect start and end
//     for (const route of routesResult.rows) {
//       const routeCoords = route.coordinates;
      
//       if (!routeCoords || !Array.isArray(routeCoords) || routeCoords.length === 0) {
//         continue;
//       }

//       const startNearest = findNearestPointOnRoute(startPoint, routeCoords);
//       const endNearest = findNearestPointOnRoute(endPoint, routeCoords);

//       console.log(`📍 ${route.route_name}: start=${startNearest.distance.toFixed(3)}km, end=${endNearest.distance.toFixed(3)}km`);

//       // Check if both points are within walking distance
//       if (startNearest.distance <= maxWalkingDistance && endNearest.distance <= maxWalkingDistance) {
        
//         const routeSegment = extractRouteSegment(routeCoords, startNearest.index, endNearest.index);
//         const routeDistance = calculateRouteDistance(routeSegment);
        
//         const estimatedTime = (routeDistance / 20) * 60; // minutes
//         const walkingTime = ((startNearest.distance + endNearest.distance) / 5) * 60;

//         directRoutes.push({
//           type: 'direct',
//           route: route.route_name,
//           startWalkDistance: startNearest.distance,
//           endWalkDistance: endNearest.distance,
//           totalWalkDistance: startNearest.distance + endNearest.distance,
//           routeDistance: routeDistance,
//           estimatedTime: Math.round(estimatedTime + walkingTime),
//           estimatedFare: calculateFare(routeDistance),
//           routeSegment: routeSegment
//         });

//         console.log(`✅ FOUND: ${route.route_name}`);
//       }
//     }

//     console.log(`🎯 Found ${directRoutes.length} routes`);

//     res.json({
//       success: true,
//       routes: directRoutes,
//       hasDirectRoutes: directRoutes.length > 0,
//       hasTransferRoutes: false,
//       metadata: {
//         totalDirectRoutes: directRoutes.length,
//         totalTransferRoutes: 0,
//         searchArea: maxWalkingDistance
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Internal server error' 
//     });
//   }
// };

// // Helper function for accurate fare calculation (traditional jeepney rates as of Oct 2025)
// const calculateFare = (distance) => {
//   const baseFare = 13; // Minimum for first 4 km
//   const baseKm = 4;
//   const additionalRate = 1.8; // Per additional km or fraction

//   if (distance <= baseKm) {
//     return baseFare;
//   }

//   const additionalDistance = distance - baseKm;
//   const additionalUnits = Math.ceil(additionalDistance); // Charge for partial km
//   const additionalFare = additionalUnits * additionalRate;
//   return Math.round(baseFare + additionalFare); // Round to nearest whole peso
// };

// // Search locations using Mapbox API
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
    
//     console.log('🔍 Mapbox search query:', query);
//     console.log('📍 Coordinates:', lat, lng);
    
//     if (!query || query.length < 2) {
//       return res.json({ success: true, features: [] });
//     }

//     const MAPBOX_API_KEY = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
    
//     if (!MAPBOX_API_KEY) {
//       throw new Error('Mapbox API key not configured');
//     }

//     // Davao City bounding box [minLon, minLat, maxLon, maxLat]
//     const davaoBbox = '125.0,6.8,125.8,7.5';
    
//     const proximity = lng && lat ? `&proximity=${lng},${lat}` : '';
//     const mapboxUrl = 
//       `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
//       `${encodeURIComponent(query)}.json?` +
//       `access_token=${MAPBOX_API_KEY}` +
//       `&country=ph` + // Philippines only
//       `&bbox=${davaoBbox}` + // Davao City area only
//       `${proximity}` +
//       `&limit=10` +
//       `&autocomplete=true` +
//       `&types=place,neighborhood,address,poi,region`;

//     console.log('📡 Mapbox URL (Davao only):', mapboxUrl.replace(MAPBOX_API_KEY, '***'));

//     const response = await fetch(mapboxUrl);

//     console.log('🗺️ Mapbox response status:', response.status);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.log('❌ Mapbox error response:', errorText);
//       throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log(`📍 Mapbox found ${data.features ? data.features.length : 0} results in Davao`);
    
//     // Additional filtering to ensure only Davao results
//     const davaoResults = data.features ? data.features.filter(feature => {
//       // Check if the result is within Davao region
//       const featureText = feature.place_name?.toLowerCase() || '';
//       const featureContext = feature.context || [];
      
//       // Allow results that mention Davao or are within the bounding box
//       const isInDavao = featureText.includes('davao') || 
//                         featureContext.some(ctx => 
//                           ctx.text?.toLowerCase().includes('davao') ||
//                           ctx.text?.toLowerCase().includes('region xi')
//                         );
      
//       return isInDavao;
//     }) : [];

//     console.log(`🏙️  Filtered to ${davaoResults.length} Davao-specific results`);
    
//     if (davaoResults.length > 0) {
//       console.log('First Davao result:', davaoResults[0].place_name);
//     }
    
//     res.json({
//       success: true,
//       features: davaoResults
//     });

//   } catch (error) {
//     console.error('❌ Mapbox search error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: error.message,
//       features: []
//     });
//   }
// };

// // Helper functions
// const extractRouteSegment = (coordinates, startIndex, endIndex) => {
//   if (startIndex <= endIndex) {
//     return coordinates.slice(startIndex, endIndex + 1);
//   } else {
//     return coordinates.slice(endIndex, startIndex + 1).reverse();
//   }
// };

// const calculateRouteDistance = (routeSegment) => {
//   let totalDistance = 0;
//   for (let i = 1; i < routeSegment.length; i++) {
//     totalDistance += haversineDistance(
//       routeSegment[i-1][0], routeSegment[i-1][1],
//       routeSegment[i][0], routeSegment[i][1]
//     );
//   }
//   return totalDistance;
// };

// module.exports = {
//   planTrip,
//   searchPlaces
// };

// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – REALISTIC DAVAO JEEPNEY BEHAVIOR
// // ===================================================================
// const MAX_WALK_KM      = 0.5;   // Walk max 500 m to/from a stop
// const MAX_RIDE_KM      = 12;    // Max 12 km ride (≈25 min)
// const MIN_RIDE_KM      = 1.5;   // Min 1.5 km ride (worth taking jeepney)
// const AVG_SPEED_KMH    = 20;    // 20 km/h average speed
// const MAX_RESULTS      = 5;     // Return top 5 best routes

// // ===================================================================
// // MAIN: planTrip – Find realistic direct jeepney routes
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     // Fetch all jeepney routes
//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     const directRoutes = [];

//     // =================================================================
//     // LOOP THROUGH EACH ROUTE
//     // =================================================================
//     for (const route of routesResult.rows) {
//       const routeCoords = route.coordinates;
//       if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//       // 1. Find PRACTICAL boarding/alighting stops (within 500m)
//       const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM);
//       const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM);

//       if (startStops.length === 0 || endStops.length === 0) continue;

//       // 2. Try every valid (forward) boarding → alighting pair
//       let bestRide = null;
//       let bestScore = Infinity;

//       for (const startStop of startStops) {
//         for (const endStop of endStops) {
//           // Must be forward direction
//           if (startStop.segment >= endStop.segment) continue;

//           const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//           const rideKm = calculateRouteDistance(rideSegment);

//           // Reject too short or too long rides
//           if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//           // Score: shorter ride + less walking = better
//           const walkKm = startStop.distance + endStop.distance;
//           const score = rideKm + walkKm * 2;  // walking is "expensive"

//           if (score < bestScore) {
//             bestScore = score;
//             bestRide = { startStop, endStop, rideKm, rideSegment, score };
//           }
//         }
//       }

//       // 3. Add best ride for this route
//       if (bestRide) {
//         const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//         const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//         const totalMins = Math.round(rideMins + walkMins);

//         directRoutes.push({
//           type: 'direct',
//           route: route.route_name,
//           startWalkDistance: bestRide.startStop.distance,
//           endWalkDistance:   bestRide.endStop.distance,
//           totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//           routeDistance:     bestRide.rideKm,
//           estimatedTime:     totalMins,
//           estimatedFare:     calculateFare(bestRide.rideKm),
//           routeSegment:      bestRide.rideSegment,
//           score:             bestRide.score
//         });
//       }
//     }

//     // 4. SORT BY BEST SCORE & RETURN TOP 5
//     directRoutes.sort((a, b) => a.score - b.score);

//     console.log(`Returning ${Math.min(directRoutes.length, MAX_RESULTS)} best routes`);

//     res.json({
//       success: true,
//       routes: directRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: directRoutes.length > 0,
//       hasTransferRoutes: false,
//       metadata: {
//         totalDirectRoutes: directRoutes.length,
//         searchArea: MAX_WALK_KM
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // FIND PRACTICAL STOPS – only major junctions within 500m
// // ===================================================================
// const findPracticalStops = (userPoint, routeCoords, maxWalk) => {
//   const stops = [];

//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(
//       userPoint.lat, userPoint.lng,
//       routeCoords[i][0], routeCoords[i][1]
//     );

//     if (dist <= maxWalk) {
//       stops.push({
//         segment: i,
//         point: routeCoords[i],
//         distance: dist
//       });
//     }
//   }

//   return stops;
// };

// // ===================================================================
// // BUILD RIDE SEGMENT – from boarding stop to alighting stop
// // ===================================================================
// const buildRideSegment = (coords, startStop, endStop) => {
//   const segment = [];
//   for (let i = startStop.segment; i <= endStop.segment; i++) {
//     segment.push(coords[i]);
//   }
//   return segment;
// };

// // ===================================================================
// // CALCULATE DISTANCE OF A POLYLINE
// // ===================================================================
// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// // ===================================================================
// // FARE CALCULATION – Traditional Jeepney (Oct 2025)
// // ===================================================================
// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;

//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH – unchanged (keep your existing code)
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) {
//       return res.json({ success: true, features: [] });
//     }

//     const MAPBOX_API_KEY = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
//     const davaoBbox = '125.0,6.8,125.8,7.5';
//     const proximity = lat && lng ? `&proximity=${lng},${lat}` : '';

//     const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
//                 `access_token=${MAPBOX_API_KEY}&country=ph&bbox=${davaoBbox}${proximity}&limit=10&autocomplete=true&types=place,neighborhood,address,poi,region`;

//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`Mapbox error: ${response.status}`);

//     const data = await response.json();
//     const davaoResults = data.features?.filter(f => {
//       const text = f.place_name?.toLowerCase() || '';
//       const ctx = f.context || [];
//       return text.includes('davao') || ctx.some(c => c.text?.toLowerCase().includes('davao') || c.text?.toLowerCase().includes('region xi'));
//     }) || [];

//     res.json({ success: true, features: davaoResults });
//   } catch (error) {
//     console.error('Mapbox error:', error);
//     res.status(500).json({ success: false, error: error.message, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = {
//   planTrip,
//   searchPlaces
// };


// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – REALISTIC DAVAO JEEPNEY BEHAVIOR
// // ===================================================================
// const MAX_WALK_KM      = 0.2;   // Walk max 500 m to/from a stop
// const MAX_RIDE_KM      = 180;    // Max 12 km ride (≈25 min)
// const MIN_RIDE_KM      = 1.5;   // Min 1.5 km ride (worth taking jeepney)
// const AVG_SPEED_KMH    = 20;    // 20 km/h average speed
// const MAX_RESULTS      = 5;     // Return top 5 best routes
// const TRANSFER_WALK_KM = 0.7;   // Max walk between two jeepneys

// // ===================================================================
// // MAIN: planTrip – Find direct + 1-transfer routes
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     // Fetch all jeepney routes
//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     const directRoutes = [];
//     const transferRoutes = [];

//     // =================================================================
//     // 1. DIRECT ROUTES (existing logic)
//     // =================================================================
//     for (const route of routesResult.rows) {
//       const routeCoords = route.coordinates;
//       if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//       const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM);
//       const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM);

//       if (startStops.length === 0 || endStops.length === 0) continue;

//       let bestRide = null;
//       let bestScore = Infinity;

//       for (const startStop of startStops) {
//         for (const endStop of endStops) {
//           if (startStop.segment >= endStop.segment) continue;

//           const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//           const rideKm = calculateRouteDistance(rideSegment);

//           if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//           const walkKm = startStop.distance + endStop.distance;
//           const score = rideKm + walkKm * 2;

//           if (score < bestScore) {
//             bestScore = score;
//             bestRide = { startStop, endStop, rideKm, rideSegment, score };
//           }
//         }
//       }

//       if (bestRide) {
//         const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//         const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//         const totalMins = Math.round(rideMins + walkMins);

//         directRoutes.push({
//           type: 'direct',
//           route: route.route_name,
//           startWalkDistance: bestRide.startStop.distance,
//           endWalkDistance:   bestRide.endStop.distance,
//           totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//           routeDistance:     bestRide.rideKm,
//           estimatedTime:     totalMins,
//           estimatedFare:     calculateFare(bestRide.rideKm),
//           routeSegment:      bestRide.rideSegment,
//           score:             bestRide.score
//         });
//       }
//     }

//     // =================================================================
//     // 2. TRANSFER (DOUBLE RIDE) – only if no direct
//     // =================================================================
//     if (directRoutes.length === 0) {
//       console.log('No direct route – searching for 1-transfer trips');
//       const allRoutes = routesResult.rows;

//       // Build stop index for fast lookup
//       const routeStops = new Map();
//       for (const r of allRoutes) {
//         if (!Array.isArray(r.coordinates) || r.coordinates.length < 2) continue;
//         routeStops.set(r.id, r.coordinates.map((c, i) => ({ idx: i, point: c })));
//       }

//       outer: for (let i = 0; i < allRoutes.length; i++) {
//         const routeA = allRoutes[i];
//         const stopsA = routeStops.get(routeA.id);
//         if (!stopsA) continue;

//         const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM);
//         if (startStopsA.length === 0) continue;

//         for (let j = 0; j < allRoutes.length; j++) {
//           if (i === j) continue;
//           const routeB = allRoutes[j];
//           const stopsB = routeStops.get(routeB.id);
//           if (!stopsB) continue;

//           const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM);
//           if (endStopsB.length === 0) continue;

//           let bestTransfer = null;
//           let bestScore = Infinity;

//           for (const sA of stopsA) {
//             for (const sB of stopsB) {
//               const walkBetween = haversineDistance(
//                 sA.point[0], sA.point[1],
//                 sB.point[0], sB.point[1]
//               );
//               if (walkBetween > TRANSFER_WALK_KM) continue;

//               // Ride A: start → transfer
//               const segA = buildRideSegment(routeA.coordinates, startStopsA[0], sA);
//               const rideA = calculateRouteDistance(segA);
//               if (rideA < MIN_RIDE_KM || rideA > MAX_RIDE_KM) continue;

//               // Ride B: transfer → end
//               const segB = buildRideSegment(routeB.coordinates, sB, endStopsB[0]);
//               const rideB = calculateRouteDistance(segB);
//               if (rideB < MIN_RIDE_KM || rideB > MAX_RIDE_KM) continue;

//               const totalRide = rideA + rideB;
//               const totalWalk = startStopsA[0].distance + walkBetween + endStopsB[0].distance;
//               const score = totalRide + totalWalk * 2;

//               if (score < bestScore) {
//                 bestScore = score;
//                 bestTransfer = {
//                   routeA: routeA.route_name,
//                   routeB: routeB.route_name,
//                   startStop: startStopsA[0],
//                   transferStopA: sA,
//                   transferStopB: sB,
//                   endStop: endStopsB[0],
//                   rideA, rideB,
//                   walkBetween,
//                   totalRide,
//                   totalWalk,
//                   segA, segB,
//                   score
//                 };
//               }
//             }
//           }

//           if (bestTransfer) {
//             const rideMins = (bestTransfer.totalRide / AVG_SPEED_KMH) * 60;
//             const walkMins = (bestTransfer.totalWalk / 5) * 60;
//             const totalMins = Math.round(rideMins + walkMins);

//             transferRoutes.push({
//               type: 'transfer',
//               legs: [
//                 {
//                   route: bestTransfer.routeA,
//                   startWalkDistance: bestTransfer.startStop.distance,
//                   endWalkDistance:   bestTransfer.walkBetween,
//                   routeDistance:     bestTransfer.rideA,
//                   routeSegment:      bestTransfer.segA
//                 },
//                 {
//                   route: bestTransfer.routeB,
//                   startWalkDistance: bestTransfer.walkBetween,
//                   endWalkDistance:   bestTransfer.endStop.distance,
//                   routeDistance:     bestTransfer.rideB,
//                   routeSegment:      bestTransfer.segB
//                 }
//               ],
//               totalWalkDistance: bestTransfer.totalWalk,
//               routeDistance:     bestTransfer.totalRide,
//               estimatedTime:     totalMins,
//               estimatedFare:     calculateFare(bestTransfer.totalRide),
//               score:             bestTransfer.score
//             });

//             break outer; // one transfer is enough
//           }
//         }
//       }
//     }

//     // =================================================================
//     // 3. FINAL RESPONSE
//     // =================================================================
//     const allRoutes = directRoutes.concat(transferRoutes);
//     allRoutes.sort((a, b) => a.score - b.score);

//     console.log(`Returning ${Math.min(allRoutes.length, MAX_RESULTS)} best routes`);

//     res.json({
//       success: true,
//       routes: allRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: directRoutes.length > 0,
//       hasTransferRoutes: transferRoutes.length > 0,
//       metadata: {
//         totalDirectRoutes: directRoutes.length,
//         totalTransferRoutes: transferRoutes.length,
//         searchArea: MAX_WALK_KM
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // FIND PRACTICAL STOPS – only major junctions within 500m
// // ===================================================================
// const findPracticalStops = (userPoint, routeCoords, maxWalk) => {
//   const stops = [];
//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(
//       userPoint.lat, userPoint.lng,
//       routeCoords[i][0], routeCoords[i][1]
//     );
//     if (dist <= maxWalk) {
//       stops.push({
//         segment: i,
//         point: routeCoords[i],
//         distance: dist
//       });
//     }
//   }
//   return stops;
// };

// // ===================================================================
// // BUILD RIDE SEGMENT – from boarding stop to alighting stop
// // ===================================================================
// const buildRideSegment = (coords, startStop, endStop) => {
//   const segment = [];
//   for (let i = startStop.segment; i <= endStop.segment; i++) {
//     segment.push(coords[i]);
//   }
//   return segment;
// };

// // ===================================================================
// // CALCULATE DISTANCE OF A POLYLINE
// // ===================================================================
// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// // ===================================================================
// // FARE CALCULATION – Traditional Jeepney (Oct 2025)
// // ===================================================================
// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;
//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH – unchanged
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) {
//       return res.json({ success: true, features: [] });
//     }

//     const MAPBOX_API_KEY = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
//     const davaoBbox = '125.0,6.8,125.8,7.5';
//     const proximity = lat && lng ? `&proximity=${lng},${lat}` : '';

//     const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
//                 `access_token=${MAPBOX_API_KEY}&country=ph&bbox=${davaoBbox}${proximity}&limit=10&autocomplete=true&types=place,neighborhood,address,poi,region`;

//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`Mapbox error: ${response.status}`);

//     const data = await response.json();
//     const davaoResults = data.features?.filter(f => {
//       const text = f.place_name?.toLowerCase() || '';
//       const ctx = f.context || [];
//       return text.includes('davao') || ctx.some(c => c.text?.toLowerCase().includes('davao') || c.text?.toLowerCase().includes('region xi'));
//     }) || [];

//     res.json({ success: true, features: davaoResults });
//   } catch (error) {
//     console.error('Mapbox error:', error);
//     res.status(500).json({ success: false, error: error.message, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = {
//   planTrip,
//   searchPlaces
// };

// plantrip.controller.js
// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – DAVAO REALITY (LONG JEEPNEY ROUTES)
// // ===================================================================
// const MAX_WALK_KM_DIRECT   = 0.2;   // 200 m to board/alight
// const MAX_WALK_KM_TRANSFER = 0.7;   // 700 m between jeepneys
// const MAX_RIDE_KM          = 180;   // Bunawan → Roxas = 150+ km → VALID
// const MIN_RIDE_KM          = 1.5;   // Worth taking jeepney
// const AVG_SPEED_KMH        = 20;    // Realistic traffic
// const MAX_RESULTS          = 30;
// const MAX_TRANSFER_SEARCH  = 10;    // Check top 10 closest routes

// // ===================================================================
// // MAIN: planTrip – Fast, long-ride support, transfer logic
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     const directRoutes = [];
//     const transferRoutes = [];

//     // =================================================================
//     // 1. DIRECT ROUTES – Long rides allowed
//     // =================================================================
//     for (const route of routesResult.rows) {
//       const routeCoords = route.coordinates;
//       if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//       const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM_DIRECT);
//       const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM_DIRECT);

//       if (startStops.length === 0 || endStops.length === 0) continue;

//       let bestRide = null;
//       let bestScore = Infinity;

//       for (const startStop of startStops) {
//         for (const endStop of endStops) {
//           if (startStop.segment >= endStop.segment) continue;

//           const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//           const rideKm = calculateRouteDistance(rideSegment);

//           if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//           const walkKm = startStop.distance + endStop.distance;
//           const score = rideKm + walkKm * 2;

//           if (score < bestScore) {
//             bestScore = score;
//             bestRide = { startStop, endStop, rideKm, rideSegment, score };
//           }
//         }
//       }

//       if (bestRide) {
//         const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//         const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//         const totalMins = Math.round(rideMins + walkMins);

//         directRoutes.push({
//           type: 'direct',
//           route: route.route_name,
//           startWalkDistance: bestRide.startStop.distance,
//           endWalkDistance:   bestRide.endStop.distance,
//           totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//           routeDistance:     bestRide.rideKm,
//           estimatedTime:     totalMins,
//           estimatedFare:     calculateFare(bestRide.rideKm),
//           routeSegment:      bestRide.rideSegment,
//           score:             bestRide.score
//         });
//       }
//     }

//     // =================================================================
//     // 2. TRANSFER ROUTES – Only if no direct (fast pre-filter)
//     // =================================================================
//     if (directRoutes.length === 0) {
//       console.log('No direct route – searching for 1-transfer (optimized)');

//       const startCandidates = routesResult.rows
//         .map(r => ({ route: r, dist: minDistanceToRoute(startPoint, r.coordinates) }))
//         .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//         .sort((a, b) => a.dist - b.dist)
//         .slice(0, MAX_TRANSFER_SEARCH);

//       const endCandidates = routesResult.rows
//         .map(r => ({ route: r, dist: minDistanceToRoute(endPoint, r.coordinates) }))
//         .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//         .sort((a, b) => a.dist - b.dist)
//         .slice(0, MAX_TRANSFER_SEARCH);

//       console.log(`Start candidates: ${startCandidates.length}, End: ${endCandidates.length}`);

//       const timeoutPromise = new Promise((_, reject) =>
//         setTimeout(() => reject(new Error('Transfer search timeout')), 1500)
//       );

//       const searchPromise = (async () => {
//         const results = [];

//         for (const sCand of startCandidates) {
//           const routeA = sCand.route;
//           const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM_DIRECT);
//           if (startStopsA.length === 0) continue;

//           for (const eCand of endCandidates) {
//             if (routeA.id === eCand.route.id) continue;
//             const routeB = eCand.route;
//             const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM_DIRECT);
//             if (endStopsB.length === 0) continue;

//             // Find closest transfer point
//             let bestWalk = Infinity;
//             let bestPair = null;
//             for (const pA of routeA.coordinates) {
//               for (const pB of routeB.coordinates) {
//                 const walk = haversineDistance(pA[0], pA[1], pB[0], pB[1]);
//                 if (walk < bestWalk && walk <= MAX_WALK_KM_TRANSFER) {
//                   bestWalk = walk;
//                   bestPair = { pA, pB, walk };
//                 }
//               }
//             }
//             if (!bestPair) continue;

//             const bestA = findBestLeg(startStopsA, routeA.coordinates, bestPair.pA);
//             const bestB = findBestLeg(endStopsB, routeB.coordinates, bestPair.pB, true);
//             if (!bestA || !bestB) continue;

//             const totalWalk = bestA.boarding.distance + bestPair.walk + bestB.alight.distance;
//             const totalRide = bestA.rideKm + bestB.rideKm;
//             const score = totalRide + totalWalk * 2;

//             const rideMins = (totalRide / AVG_SPEED_KMH) * 60;
//             const walkMins = (totalWalk / 5) * 60;
//             const totalMins = Math.round(rideMins + walkMins);

//             results.push({
//               type: 'transfer',
//               legs: [
//                 {
//                   route: routeA.route_name,
//                   startWalkDistance: bestA.boarding.distance,
//                   endWalkDistance: bestPair.walk,
//                   routeDistance: bestA.rideKm,
//                   routeSegment: bestA.segment
//                 },
//                 {
//                   route: routeB.route_name,
//                   startWalkDistance: bestPair.walk,
//                   endWalkDistance: bestB.alight.distance,
//                   routeDistance: bestB.rideKm,
//                   routeSegment: bestB.segment
//                 }
//               ],
//               totalWalkDistance: totalWalk,
//               routeDistance: totalRide,
//               estimatedTime: totalMins,
//               estimatedFare: calculateFare(totalRide),
//               score
//             });

//             if (results.length >= MAX_RESULTS) return results;
//           }
//         }
//         return results;
//       })();

//       try {
//         transferRoutes.push(...await Promise.race([searchPromise, timeoutPromise]));
//       } catch (err) {
//         console.log('Transfer search skipped (timeout or error)');
//       }
//     }

//     // =================================================================
//     // 3. FINAL RESPONSE
//     // =================================================================
//     const allRoutes = directRoutes.concat(transferRoutes);
//     allRoutes.sort((a, b) => a.score - b.score);

//     res.json({
//       success: true,
//       routes: allRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: directRoutes.length > 0,
//       hasTransferRoutes: transferRoutes.length > 0,
//       metadata: {
//         totalDirectRoutes: directRoutes.length,
//         totalTransferRoutes: transferRoutes.length,
//         maxRideKm: MAX_RIDE_KM,
//         searchArea: { direct: MAX_WALK_KM_DIRECT, transfer: MAX_WALK_KM_TRANSFER }
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // HELPER: Min distance to route
// // ===================================================================
// const minDistanceToRoute = (point, coords) => {
//   let min = Infinity;
//   for (const [lat, lng] of coords) {
//     const d = haversineDistance(point.lat, point.lng, lat, lng);
//     if (d < min) min = d;
//   }
//   return min;
// };

// // ===================================================================
// // HELPER: Best leg from user to transfer point
// // ===================================================================
// const findBestLeg = (userStops, routeCoords, transferPoint, reverse = false) => {
//   let best = null;
//   let bestScore = Infinity;

//   const transferIdx = routeCoords.findIndex(p =>
//     Math.abs(p[0] - transferPoint[0]) < 1e-6 && Math.abs(p[1] - transferPoint[1]) < 1e-6
//   );
//   if (transferIdx === -1) return null;

//   for (const stop of userStops) {
//     const startIdx = reverse ? transferIdx : stop.segment;
//     const endIdx = reverse ? stop.segment : transferIdx;
//     if (startIdx >= endIdx) continue;

//     const segment = routeCoords.slice(startIdx, endIdx + 1);
//     const rideKm = calculateRouteDistance(segment);
//     if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//     const score = rideKm + stop.distance * 2;
//     if (score < bestScore) {
//       bestScore = score;
//       best = {
//         boarding: reverse ? { distance: 0 } : stop,
//         alight: reverse ? stop : { distance: 0 },
//         rideKm,
//         segment
//       };
//     }
//   }
//   return best;
// };

// // ===================================================================
// // HELPER: Find stops within walk distance
// // ===================================================================
// const findPracticalStops = (userPoint, routeCoords, maxWalkKm) => {
//   const stops = [];
//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(userPoint.lat, userPoint.lng, routeCoords[i][0], routeCoords[i][1]);
//     if (dist <= maxWalkKm) {
//       stops.push({ segment: i, point: routeCoords[i], distance: dist });
//     }
//   }
//   return stops;
// };

// // ===================================================================
// // HELPER: Build segment
// // ===================================================================
// const buildRideSegment = (coords, startStop, endStop) => {
//   return coords.slice(startStop.segment, endStop.segment + 1);
// };

// // ===================================================================
// // HELPER: Calculate distance
// // ===================================================================
// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// // ===================================================================
// // FARE: Oct 2025
// // ===================================================================
// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;
//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) return res.json({ success: true, features: [] });

//     const MAPBOX_API_KEY = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
//     const davaoBbox = '125.0,6.8,125.8,7.5';
//     const proximity = lat && lng ? `&proximity=${lng},${lat}` : '';

//     const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
//                 `access_token=${MAPBOX_API_KEY}&country=ph&bbox=${davaoBbox}${proximity}&limit=10&autocomplete=true`;

//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`Mapbox error: ${response.status}`);
//     const data = await response.json();

//     const davaoResults = data.features?.filter(f => {
//       const text = (f.place_name || '').toLowerCase();
//       const ctx = f.context || [];
//       return text.includes('davao') || ctx.some(c => (c.text || '').toLowerCase().includes('davao'));
//     }) || [];

//     res.json({ success: true, features: davaoResults });
//   } catch (error) {
//     console.error('Mapbox error:', error);
//     res.status(500).json({ success: false, error: error.message, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = { planTrip, searchPlaces };



// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – DAVAO REALITY
// // ===================================================================
// const MAX_WALK_KM_DIRECT   = 0.2;   // 200 m to board/alight
// const MAX_WALK_KM_TRANSFER = 0.7;   // 700 m between jeepneys
// const MAX_RIDE_KM          = 25;   
// const MIN_RIDE_KM          = 1.5;   
// const AVG_SPEED_KMH        = 20;    
// const MAX_RESULTS          = 30;
// const MAX_TRANSFER_SEARCH  = 10;    

// // ===================================================================
// // MAIN: planTrip – Proper transfer handling
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     const directRoutes = [];
//     const transferRoutes = [];

//     // =================================================================
//     // 1. DIRECT ROUTES
//     // =================================================================
//     for (const route of routesResult.rows) {
//       const routeCoords = route.coordinates;
//       if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//       const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM_DIRECT);
//       const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM_DIRECT);

//       if (startStops.length === 0 || endStops.length === 0) continue;

//       let bestRide = null;
//       let bestScore = Infinity;

//       for (const startStop of startStops) {
//         for (const endStop of endStops) {
//           if (startStop.segment >= endStop.segment) continue;

//           const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//           const rideKm = calculateRouteDistance(rideSegment);

//           if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//           const walkKm = startStop.distance + endStop.distance;
//           const score = rideKm + walkKm * 2;

//           if (score < bestScore) {
//             bestScore = score;
//             bestRide = { startStop, endStop, rideKm, rideSegment, score };
//           }
//         }
//       }

//       if (bestRide) {
//         const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//         const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//         const totalMins = Math.round(rideMins + walkMins);

//         directRoutes.push({
//           type: 'direct',
//           route: route.route_name,
//           startWalkDistance: bestRide.startStop.distance,
//           endWalkDistance:   bestRide.endStop.distance,
//           totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//           routeDistance:     bestRide.rideKm,
//           estimatedTime:     totalMins,
//           estimatedFare:     calculateFare(bestRide.rideKm),
//           routeSegment:      bestRide.rideSegment,
//           score:             bestRide.score
//         });
//       }
//     }

//     // =================================================================
//     // 2. TRANSFER ROUTES – With proper fare calculation
//     // =================================================================
//     if (directRoutes.length === 0) {
//       console.log('No direct route – searching for 1-transfer (optimized)');

//       const startCandidates = routesResult.rows
//         .map(r => ({ route: r, dist: minDistanceToRoute(startPoint, r.coordinates) }))
//         .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//         .sort((a, b) => a.dist - b.dist)
//         .slice(0, MAX_TRANSFER_SEARCH);

//       const endCandidates = routesResult.rows
//         .map(r => ({ route: r, dist: minDistanceToRoute(endPoint, r.coordinates) }))
//         .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//         .sort((a, b) => a.dist - b.dist)
//         .slice(0, MAX_TRANSFER_SEARCH);

//       console.log(`Start candidates: ${startCandidates.length}, End: ${endCandidates.length}`);

//       const timeoutPromise = new Promise((_, reject) =>
//         setTimeout(() => reject(new Error('Transfer search timeout')), 1500)
//       );

//       const searchPromise = (async () => {
//         const results = [];

//         for (const sCand of startCandidates) {
//           const routeA = sCand.route;
//           const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM_DIRECT);
//           if (startStopsA.length === 0) continue;

//           for (const eCand of endCandidates) {
//             if (routeA.id === eCand.route.id) continue;
//             const routeB = eCand.route;
//             const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM_DIRECT);
//             if (endStopsB.length === 0) continue;

//             // Find closest transfer point
//             let bestWalk = Infinity;
//             let bestPair = null;
//             for (const pA of routeA.coordinates) {
//               for (const pB of routeB.coordinates) {
//                 const walk = haversineDistance(pA[0], pA[1], pB[0], pB[1]);
//                 if (walk < bestWalk && walk <= MAX_WALK_KM_TRANSFER) {
//                   bestWalk = walk;
//                   bestPair = { pA, pB, walk };
//                 }
//               }
//             }
//             if (!bestPair) continue;

//             const bestA = findBestLeg(startStopsA, routeA.coordinates, bestPair.pA);
//             const bestB = findBestLeg(endStopsB, routeB.coordinates, bestPair.pB, true);
//             if (!bestA || !bestB) continue;

//             const totalWalk = bestA.boarding.distance + bestPair.walk + bestB.alight.distance;
//             const totalRide = bestA.rideKm + bestB.rideKm;
            
//             // Calculate fare separately for each jeepney
//             const fareA = calculateFare(bestA.rideKm);
//             const fareB = calculateFare(bestB.rideKm);
//             const totalFare = fareA + fareB;
            
//             const score = totalRide + totalWalk * 2;

//             const rideMins = (totalRide / AVG_SPEED_KMH) * 60;
//             const walkMins = (totalWalk / 5) * 60;
//             const totalMins = Math.round(rideMins + walkMins);

//             results.push({
//               type: 'transfer',
//               legs: [
//                 {
//                   route: routeA.route_name,
//                   startWalkDistance: bestA.boarding.distance,
//                   endWalkDistance: bestPair.walk,
//                   routeDistance: bestA.rideKm,
//                   routeSegment: bestA.segment,
//                   estimatedFare: fareA,
//                   boardingPoint: bestA.boarding.point,
//                   alightingPoint: bestPair.pA, // Transfer point from first jeepney
//                   estimatedTime: Math.round((bestA.rideKm / AVG_SPEED_KMH) * 60)
//                 },
//                 {
//                   route: routeB.route_name,
//                   startWalkDistance: bestPair.walk,
//                   endWalkDistance: bestB.alight.distance,
//                   routeDistance: bestB.rideKm,
//                   routeSegment: bestB.segment,
//                   estimatedFare: fareB,
//                   boardingPoint: bestPair.pB, // Transfer point to second jeepney
//                   alightingPoint: bestB.alight.point,
//                   estimatedTime: Math.round((bestB.rideKm / AVG_SPEED_KMH) * 60)
//                 }
//               ],
//               totalWalkDistance: totalWalk,
//               routeDistance: totalRide,
//               estimatedTime: totalMins,
//               estimatedFare: totalFare,
//               transferWalkDistance: bestPair.walk,
//               transferPoint: {
//                 from: bestPair.pA, // Where you get off first jeepney
//                 to: bestPair.pB,   // Where you board second jeepney
//                 walkDistance: bestPair.walk
//               },
//               score
//             });

//             if (results.length >= MAX_RESULTS) return results;
//           }
//         }
//         return results;
//       })();

//       try {
//         transferRoutes.push(...await Promise.race([searchPromise, timeoutPromise]));
//       } catch (err) {
//         console.log('Transfer search skipped (timeout or error)');
//       }
//     }

//     // =================================================================
//     // 3. FINAL RESPONSE
//     // =================================================================
//     const allRoutes = directRoutes.concat(transferRoutes);
//     allRoutes.sort((a, b) => a.score - b.score);

//     res.json({
//       success: true,
//       routes: allRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: directRoutes.length > 0,
//       hasTransferRoutes: transferRoutes.length > 0,
//       metadata: {
//         totalDirectRoutes: directRoutes.length,
//         totalTransferRoutes: transferRoutes.length,
//         maxRideKm: MAX_RIDE_KM,
//         searchArea: { direct: MAX_WALK_KM_DIRECT, transfer: MAX_WALK_KM_TRANSFER }
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // HELPER FUNCTIONS
// // ===================================================================
// const minDistanceToRoute = (point, coords) => {
//   let min = Infinity;
//   for (const [lat, lng] of coords) {
//     const d = haversineDistance(point.lat, point.lng, lat, lng);
//     if (d < min) min = d;
//   }
//   return min;
// };

// const findBestLeg = (userStops, routeCoords, transferPoint, reverse = false) => {
//   let best = null;
//   let bestScore = Infinity;

//   const transferIdx = routeCoords.findIndex(p =>
//     Math.abs(p[0] - transferPoint[0]) < 1e-6 && Math.abs(p[1] - transferPoint[1]) < 1e-6
//   );
//   if (transferIdx === -1) return null;

//   for (const stop of userStops) {
//     const startIdx = reverse ? transferIdx : stop.segment;
//     const endIdx = reverse ? stop.segment : transferIdx;
//     if (startIdx >= endIdx) continue;

//     const segment = routeCoords.slice(startIdx, endIdx + 1);
//     const rideKm = calculateRouteDistance(segment);
//     if (rideKm < MIN_RIDE_KM || rideKm > MAX_RIDE_KM) continue;

//     const score = rideKm + stop.distance * 2;
//     if (score < bestScore) {
//       bestScore = score;
//       best = {
//         boarding: reverse ? { distance: 0, point: transferPoint } : stop,
//         alight: reverse ? stop : { distance: 0, point: transferPoint },
//         rideKm,
//         segment
//       };
//     }
//   }
//   return best;
// };

// const findPracticalStops = (userPoint, routeCoords, maxWalkKm) => {
//   const stops = [];
//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(userPoint.lat, userPoint.lng, routeCoords[i][0], routeCoords[i][1]);
//     if (dist <= maxWalkKm) {
//       stops.push({ segment: i, point: routeCoords[i], distance: dist });
//     }
//   }
//   return stops;
// };

// const buildRideSegment = (coords, startStop, endStop) => {
//   return coords.slice(startStop.segment, endStop.segment + 1);
// };

// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;
//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) return res.json({ success: true, features: [] });

//     const TOMTOM_API_KEY = 'Ev7u9w9pfeL7JJ0wBHbwNIIzXGNnlK4K';
//     const latLng = lat && lng ? `&lat=${lat}&lon=${lng}` : '&lat=7.1907&lon=125.4553';
    
//     const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}${latLng}&limit=10&countrySet=PH&idxSet=POI`;
    
//     const response = await fetch(url);
//     const data = await response.json();
    
//     const features = data.results?.map(place => ({
//       id: place.id,
//       place_name: place.poi?.name + ', ' + place.address?.freeformAddress,
//       text: place.poi?.name,
//       center: [place.position.lon, place.position.lat],
//       address: place.address?.freeformAddress,
//       category: place.poi?.classifications?.[0]?.code
//     })) || [];

//     res.json({ success: true, features });
//   } catch (error) {
//     console.error('TomTom error:', error);
//     res.json({ success: true, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = { planTrip, searchPlaces };


// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – DAVAO REALITY
// // ===================================================================
// const MAX_WALK_KM_DIRECT   = 0.2;   // 200 m to board/alight
// const MAX_WALK_KM_TRANSFER = 0.7;   // 700 m between jeepneys
// const MAX_RIDE_KM          = 10;   
// const MIN_RIDE_KM          = 1.5;   
// const AVG_SPEED_KMH        = 20;    
// const MAX_RESULTS          = 30;
// const MAX_TRANSFER_SEARCH  = 10;    

// // ===================================================================
// // MAIN: planTrip – Proper transfer handling
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     // =================================================================
//     // PROGRESSIVE SEARCH FUNCTION
//     // =================================================================
//     const searchWithMaxRide = async (currentMaxRideKm) => {
//       const directRoutes = [];
//       const transferRoutes = [];

//       // =================================================================
//       // 1. DIRECT ROUTES
//       // =================================================================
//       for (const route of routesResult.rows) {
//         const routeCoords = route.coordinates;
//         if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//         const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM_DIRECT);
//         const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM_DIRECT);

//         if (startStops.length === 0 || endStops.length === 0) continue;

//         let bestRide = null;
//         let bestScore = Infinity;

//         for (const startStop of startStops) {
//           for (const endStop of endStops) {
//             if (startStop.segment >= endStop.segment) continue;

//             const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//             const rideKm = calculateRouteDistance(rideSegment);

//             if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

//             const walkKm = startStop.distance + endStop.distance;
//             const score = rideKm + walkKm * 2;

//             if (score < bestScore) {
//               bestScore = score;
//               bestRide = { startStop, endStop, rideKm, rideSegment, score };
//             }
//           }
//         }

//         if (bestRide) {
//           const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//           const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//           const totalMins = Math.round(rideMins + walkMins);

//           directRoutes.push({
//             type: 'direct',
//             route: route.route_name,
//             startWalkDistance: bestRide.startStop.distance,
//             endWalkDistance:   bestRide.endStop.distance,
//             totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//             routeDistance:     bestRide.rideKm,
//             estimatedTime:     totalMins,
//             estimatedFare:     calculateFare(bestRide.rideKm),
//             routeSegment:      bestRide.rideSegment,
//             score:             bestRide.score
//           });
//         }
//       }

//       // =================================================================
//       // 2. TRANSFER ROUTES – With proper fare calculation
//       // =================================================================
//       if (directRoutes.length === 0) {
//         console.log('No direct route – searching for 1-transfer (optimized)');

//         const startCandidates = routesResult.rows
//           .map(r => ({ route: r, dist: minDistanceToRoute(startPoint, r.coordinates) }))
//           .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//           .sort((a, b) => a.dist - b.dist)
//           .slice(0, MAX_TRANSFER_SEARCH);

//         const endCandidates = routesResult.rows
//           .map(r => ({ route: r, dist: minDistanceToRoute(endPoint, r.coordinates) }))
//           .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//           .sort((a, b) => a.dist - b.dist)
//           .slice(0, MAX_TRANSFER_SEARCH);

//         console.log(`Start candidates: ${startCandidates.length}, End: ${endCandidates.length}`);

//         const timeoutPromise = new Promise((_, reject) =>
//           setTimeout(() => reject(new Error('Transfer search timeout')), 1500)
//         );

//         const searchPromise = (async () => {
//           const results = [];

//           for (const sCand of startCandidates) {
//             const routeA = sCand.route;
//             const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM_DIRECT);
//             if (startStopsA.length === 0) continue;

//             for (const eCand of endCandidates) {
//               if (routeA.id === eCand.route.id) continue;
//               const routeB = eCand.route;
//               const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM_DIRECT);
//               if (endStopsB.length === 0) continue;

//               // Find closest transfer point
//               let bestWalk = Infinity;
//               let bestPair = null;
//               for (const pA of routeA.coordinates) {
//                 for (const pB of routeB.coordinates) {
//                   const walk = haversineDistance(pA[0], pA[1], pB[0], pB[1]);
//                   if (walk < bestWalk && walk <= MAX_WALK_KM_TRANSFER) {
//                     bestWalk = walk;
//                     bestPair = { pA, pB, walk };
//                   }
//                 }
//               }
//               if (!bestPair) continue;

//               const bestA = findBestLeg(startStopsA, routeA.coordinates, bestPair.pA, currentMaxRideKm);
//               const bestB = findBestLeg(endStopsB, routeB.coordinates, bestPair.pB, currentMaxRideKm, true);
//               if (!bestA || !bestB) continue;

//               const totalWalk = bestA.boarding.distance + bestPair.walk + bestB.alight.distance;
//               const totalRide = bestA.rideKm + bestB.rideKm;
              
//               // Calculate fare separately for each jeepney
//               const fareA = calculateFare(bestA.rideKm);
//               const fareB = calculateFare(bestB.rideKm);
//               const totalFare = fareA + fareB;
              
//               const score = totalRide + totalWalk * 2;

//               const rideMins = (totalRide / AVG_SPEED_KMH) * 60;
//               const walkMins = (totalWalk / 5) * 60;
//               const totalMins = Math.round(rideMins + walkMins);

//               results.push({
//                 type: 'transfer',
//                 legs: [
//                   {
//                     route: routeA.route_name,
//                     startWalkDistance: bestA.boarding.distance,
//                     endWalkDistance: bestPair.walk,
//                     routeDistance: bestA.rideKm,
//                     routeSegment: bestA.segment,
//                     estimatedFare: fareA,
//                     boardingPoint: bestA.boarding.point,
//                     alightingPoint: bestPair.pA, // Transfer point from first jeepney
//                     estimatedTime: Math.round((bestA.rideKm / AVG_SPEED_KMH) * 60)
//                   },
//                   {
//                     route: routeB.route_name,
//                     startWalkDistance: bestPair.walk,
//                     endWalkDistance: bestB.alight.distance,
//                     routeDistance: bestB.rideKm,
//                     routeSegment: bestB.segment,
//                     estimatedFare: fareB,
//                     boardingPoint: bestPair.pB, // Transfer point to second jeepney
//                     alightingPoint: bestB.alight.point,
//                     estimatedTime: Math.round((bestB.rideKm / AVG_SPEED_KMH) * 60)
//                   }
//                 ],
//                 totalWalkDistance: totalWalk,
//                 routeDistance: totalRide,
//                 estimatedTime: totalMins,
//                 estimatedFare: totalFare,
//                 transferWalkDistance: bestPair.walk,
//                 transferPoint: {
//                   from: bestPair.pA, // Where you get off first jeepney
//                   to: bestPair.pB,   // Where you board second jeepney
//                   walkDistance: bestPair.walk
//                 },
//                 score
//               });

//               if (results.length >= MAX_RESULTS) return results;
//             }
//           }
//           return results;
//         })();

//         try {
//           transferRoutes.push(...await Promise.race([searchPromise, timeoutPromise]));
//         } catch (err) {
//           console.log('Transfer search skipped (timeout or error)');
//         }
//       }

//       return { directRoutes, transferRoutes };
//     };

//     // =================================================================
//     // PROGRESSIVE SEARCH EXECUTION
//     // =================================================================
//     let currentMaxRide = MAX_RIDE_KM;
//     let allDirectRoutes = [];
//     let allTransferRoutes = [];
//     let searchIterations = 0;
//     const MAX_ITERATIONS = 30; // Prevent infinite loop

//     while (searchIterations < MAX_ITERATIONS) {
//       console.log(`Searching with MAX_RIDE_KM = ${currentMaxRide}km`);
      
//       const { directRoutes, transferRoutes } = await searchWithMaxRide(currentMaxRide);
      
//       // If we found any routes (direct or transfer), use them and stop searching
//       if (directRoutes.length > 0 || transferRoutes.length > 0) {
//         allDirectRoutes = directRoutes;
//         allTransferRoutes = transferRoutes;
//         console.log(`Found routes with MAX_RIDE_KM = ${currentMaxRide}km: ${directRoutes.length} direct, ${transferRoutes.length} transfer`);
//         break;
//       }
      
//       // If no routes found, increase MAX_RIDE_KM and try again
//       currentMaxRide += 1;
//       searchIterations++;
      
//       // Safety check: don't go beyond 50km (too far for jeepney)
//       if (currentMaxRide > 50) {
//         console.log('Reached maximum search distance (50km) without finding routes');
//         break;
//       }
//     }

//     // =================================================================
//     // 3. FINAL RESPONSE
//     // =================================================================
//     const allRoutes = allDirectRoutes.concat(allTransferRoutes);
//     allRoutes.sort((a, b) => a.score - b.score);

//     res.json({
//       success: true,
//       routes: allRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: allDirectRoutes.length > 0,
//       hasTransferRoutes: allTransferRoutes.length > 0,
//       metadata: {
//         totalDirectRoutes: allDirectRoutes.length,
//         totalTransferRoutes: allTransferRoutes.length,
//         maxRideKmUsed: currentMaxRide,
//         searchArea: { direct: MAX_WALK_KM_DIRECT, transfer: MAX_WALK_KM_TRANSFER }
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // HELPER FUNCTIONS
// // ===================================================================
// const minDistanceToRoute = (point, coords) => {
//   let min = Infinity;
//   for (const [lat, lng] of coords) {
//     const d = haversineDistance(point.lat, point.lng, lat, lng);
//     if (d < min) min = d;
//   }
//   return min;
// };

// const findBestLeg = (userStops, routeCoords, transferPoint, currentMaxRideKm, reverse = false) => {
//   let best = null;
//   let bestScore = Infinity;

//   const transferIdx = routeCoords.findIndex(p =>
//     Math.abs(p[0] - transferPoint[0]) < 1e-6 && Math.abs(p[1] - transferPoint[1]) < 1e-6
//   );
//   if (transferIdx === -1) return null;

//   for (const stop of userStops) {
//     const startIdx = reverse ? transferIdx : stop.segment;
//     const endIdx = reverse ? stop.segment : transferIdx;
//     if (startIdx >= endIdx) continue;

//     const segment = routeCoords.slice(startIdx, endIdx + 1);
//     const rideKm = calculateRouteDistance(segment);
//     if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

//     const score = rideKm + stop.distance * 2;
//     if (score < bestScore) {
//       bestScore = score;
//       best = {
//         boarding: reverse ? { distance: 0, point: transferPoint } : stop,
//         alight: reverse ? stop : { distance: 0, point: transferPoint },
//         rideKm,
//         segment
//       };
//     }
//   }
//   return best;
// };

// const findPracticalStops = (userPoint, routeCoords, maxWalkKm) => {
//   const stops = [];
//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(userPoint.lat, userPoint.lng, routeCoords[i][0], routeCoords[i][1]);
//     if (dist <= maxWalkKm) {
//       stops.push({ segment: i, point: routeCoords[i], distance: dist });
//     }
//   }
//   return stops;
// };

// const buildRideSegment = (coords, startStop, endStop) => {
//   return coords.slice(startStop.segment, endStop.segment + 1);
// };

// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;
//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) return res.json({ success: true, features: [] });

//     const TOMTOM_API_KEY = 'Ev7u9w9pfeL7JJ0wBHbwNIIzXGNnlK4K';
//     const latLng = lat && lng ? `&lat=${lat}&lon=${lng}` : '&lat=7.1907&lon=125.4553';
    
//     const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}${latLng}&limit=10&countrySet=PH&idxSet=POI`;
    
//     const response = await fetch(url);
//     const data = await response.json();
    
//     const features = data.results?.map(place => ({
//       id: place.id,
//       place_name: place.poi?.name + ', ' + place.address?.freeformAddress,
//       text: place.poi?.name,
//       center: [place.position.lon, place.position.lat],
//       address: place.address?.freeformAddress,
//       category: place.poi?.classifications?.[0]?.code
//     })) || [];

//     res.json({ success: true, features });
//   } catch (error) {
//     console.error('TomTom error:', error);
//     res.json({ success: true, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = { planTrip, searchPlaces };



// const db = require('../database');
// const { haversineDistance } = require('../utils/geoUtils');

// // ===================================================================
// // CONFIGURATION – DAVAO REALITY
// // ===================================================================
// const MAX_WALK_KM_DIRECT   = 0.7;   // 200 m to board/alight
// const MAX_WALK_KM_TRANSFER = 0.7;   // 700 m between jeepneys
// const MAX_RIDE_KM          = 15;   
// const MIN_RIDE_KM          = 1.5;   
// const AVG_SPEED_KMH        = 20;    
// const MAX_RESULTS          = 30;
// const MAX_TRANSFER_SEARCH  = 10;    

// // ===================================================================
// // MAIN: planTrip – Fixed duplicates in both direct and transfer routes
// // ===================================================================
// const planTrip = async (req, res) => {
//   try {
//     const { startLat, startLng, endLat, endLng } = req.body;

//     if (!startLat || !startLng || !endLat || !endLng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Start and end coordinates are required'
//       });
//     }

//     const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
//     const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

//     const routesResult = await db.query(`
//       SELECT id, route_name, coordinates 
//       FROM routes 
//       WHERE coordinates IS NOT NULL
//     `);

//     console.log(`Found ${routesResult.rows.length} routes in DB`);

//     // =================================================================
//     // PROGRESSIVE SEARCH FUNCTION
//     // =================================================================
//     const searchWithMaxRide = async (currentMaxRideKm) => {
//       const directRoutes = [];
//       const transferRoutes = [];

//       // =================================================================
//       // 1. DIRECT ROUTES - FIXED DUPLICATES
//       // =================================================================
//       const usedDirectRoutes = new Set(); // Track used route names to avoid duplicates
      
//       for (const route of routesResult.rows) {
//         // Skip if we already have this route name
//         if (usedDirectRoutes.has(route.route_name)) continue;
        
//         const routeCoords = route.coordinates;
//         if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

//         const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM_DIRECT);
//         const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM_DIRECT);

//         if (startStops.length === 0 || endStops.length === 0) continue;

//         let bestRide = null;
//         let bestScore = Infinity;

//         for (const startStop of startStops) {
//           for (const endStop of endStops) {
//             if (startStop.segment >= endStop.segment) continue;

//             const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
//             const rideKm = calculateRouteDistance(rideSegment);

//             if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

//             const walkKm = startStop.distance + endStop.distance;
//             const score = rideKm + walkKm * 2;

//             if (score < bestScore) {
//               bestScore = score;
//               bestRide = { startStop, endStop, rideKm, rideSegment, score };
//             }
//           }
//         }

//         if (bestRide) {
//           const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
//           const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
//           const totalMins = Math.round(rideMins + walkMins);

//           directRoutes.push({
//             type: 'direct',
//             route: route.route_name,
//             startWalkDistance: bestRide.startStop.distance,
//             endWalkDistance:   bestRide.endStop.distance,
//             totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
//             routeDistance:     bestRide.rideKm,
//             estimatedTime:     totalMins,
//             estimatedFare:     calculateFare(bestRide.rideKm),
//             routeSegment:      bestRide.rideSegment,
//             score:             bestRide.score
//           });
          
//           // Mark this route name as used
//           usedDirectRoutes.add(route.route_name);
//         }
//       }

//       // =================================================================
//       // 2. TRANSFER ROUTES – FIXED DUPLICATES
//       // =================================================================
//       if (directRoutes.length === 0) {
//         console.log('No direct route – searching for 1-transfer (optimized)');

//         const startCandidates = routesResult.rows
//           .map(r => ({ route: r, dist: minDistanceToRoute(startPoint, r.coordinates) }))
//           .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//           .sort((a, b) => a.dist - b.dist)
//           .slice(0, MAX_TRANSFER_SEARCH);

//         const endCandidates = routesResult.rows
//           .map(r => ({ route: r, dist: minDistanceToRoute(endPoint, r.coordinates) }))
//           .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
//           .sort((a, b) => a.dist - b.dist)
//           .slice(0, MAX_TRANSFER_SEARCH);

//         console.log(`Start candidates: ${startCandidates.length}, End: ${endCandidates.length}`);

//         const timeoutPromise = new Promise((_, reject) =>
//           setTimeout(() => reject(new Error('Transfer search timeout')), 1500)
//         );

//         const searchPromise = (async () => {
//           const results = [];
//           const usedTransferCombinations = new Set(); // Track used transfer combinations

//           for (const sCand of startCandidates) {
//             const routeA = sCand.route;
//             const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM_DIRECT);
//             if (startStopsA.length === 0) continue;

//             for (const eCand of endCandidates) {
//               if (routeA.id === eCand.route.id) continue;
//               const routeB = eCand.route;
//               const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM_DIRECT);
//               if (endStopsB.length === 0) continue;

//               // Find closest transfer point
//               let bestWalk = Infinity;
//               let bestPair = null;
//               for (const pA of routeA.coordinates) {
//                 for (const pB of routeB.coordinates) {
//                   const walk = haversineDistance(pA[0], pA[1], pB[0], pB[1]);
//                   if (walk < bestWalk && walk <= MAX_WALK_KM_TRANSFER) {
//                     bestWalk = walk;
//                     bestPair = { pA, pB, walk };
//                   }
//                 }
//               }
//               if (!bestPair) continue;

//               const bestA = findBestLeg(startStopsA, routeA.coordinates, bestPair.pA, currentMaxRideKm);
//               const bestB = findBestLeg(endStopsB, routeB.coordinates, bestPair.pB, currentMaxRideKm, true);
//               if (!bestA || !bestB) continue;

//               const totalWalk = bestA.boarding.distance + bestPair.walk + bestB.alight.distance;
//               const totalRide = bestA.rideKm + bestB.rideKm;
              
//               // Calculate fare separately for each jeepney
//               const fareA = calculateFare(bestA.rideKm);
//               const fareB = calculateFare(bestB.rideKm);
//               const totalFare = fareA + fareB;
              
//               const score = totalRide + totalWalk * 2;

//               const rideMins = (totalRide / AVG_SPEED_KMH) * 60;
//               const walkMins = (totalWalk / 5) * 60;
//               const totalMins = Math.round(rideMins + walkMins);

//               // Create unique combination key to avoid duplicates - include route names only
//               const comboKey = `${routeA.route_name}-${routeB.route_name}`;
              
//               if (!usedTransferCombinations.has(comboKey)) {
//                 usedTransferCombinations.add(comboKey);
                
//                 results.push({
//                   type: 'transfer',
//                   legs: [
//                     {
//                       route: routeA.route_name,
//                       startWalkDistance: bestA.boarding.distance,
//                       endWalkDistance: bestPair.walk,
//                       routeDistance: bestA.rideKm,
//                       routeSegment: bestA.segment,
//                       estimatedFare: fareA,
//                       boardingPoint: bestA.boarding.point,
//                       alightingPoint: bestPair.pA,
//                       estimatedTime: Math.round((bestA.rideKm / AVG_SPEED_KMH) * 60)
//                     },
//                     {
//                       route: routeB.route_name,
//                       startWalkDistance: bestPair.walk,
//                       endWalkDistance: bestB.alight.distance,
//                       routeDistance: bestB.rideKm,
//                       routeSegment: bestB.segment,
//                       estimatedFare: fareB,
//                       boardingPoint: bestPair.pB,
//                       alightingPoint: bestB.alight.point,
//                       estimatedTime: Math.round((bestB.rideKm / AVG_SPEED_KMH) * 60)
//                     }
//                   ],
//                   totalWalkDistance: totalWalk,
//                   routeDistance: totalRide,
//                   estimatedTime: totalMins,
//                   estimatedFare: totalFare,
//                   transferWalkDistance: bestPair.walk,
//                   transferPoint: {
//                     from: bestPair.pA,
//                     to: bestPair.pB,
//                     walkDistance: bestPair.walk
//                   },
//                   score,
//                   combination: comboKey
//                 });

//                 if (results.length >= MAX_RESULTS) return results;
//               }
//             }
//           }
//           return results;
//         })();

//         try {
//           transferRoutes.push(...await Promise.race([searchPromise, timeoutPromise]));
//         } catch (err) {
//           console.log('Transfer search skipped (timeout or error)');
//         }
//       }

//       return { directRoutes, transferRoutes };
//     };

//     // =================================================================
//     // PROGRESSIVE SEARCH EXECUTION
//     // =================================================================
//     let currentMaxRide = MAX_RIDE_KM;
//     let allDirectRoutes = [];
//     let allTransferRoutes = [];
//     let searchIterations = 0;
//     const MAX_ITERATIONS = 30;

//     while (searchIterations < MAX_ITERATIONS) {
//       console.log(`Searching with MAX_RIDE_KM = ${currentMaxRide}km`);
      
//       const { directRoutes, transferRoutes } = await searchWithMaxRide(currentMaxRide);
      
//       if (directRoutes.length > 0 || transferRoutes.length > 0) {
//         allDirectRoutes = directRoutes;
//         allTransferRoutes = transferRoutes;
//         console.log(`Found routes with MAX_RIDE_KM = ${currentMaxRide}km: ${directRoutes.length} direct, ${transferRoutes.length} transfer`);
//         break;
//       }
      
//       currentMaxRide += 1;
//       searchIterations++;
      
//       if (currentMaxRide > 50) {
//         console.log('Reached maximum search distance (50km) without finding routes');
//         break;
//       }
//     }

//     // =================================================================
//     // 3. FINAL RESPONSE - ADDITIONAL DUPLICATE REMOVAL FOR SAFETY
//     // =================================================================
//     // Remove any remaining duplicates in direct routes
//     const uniqueDirectRoutes = [];
//     const seenDirectRoutes = new Set();
//     for (const route of allDirectRoutes) {
//       if (!seenDirectRoutes.has(route.route)) {
//         seenDirectRoutes.add(route.route);
//         uniqueDirectRoutes.push(route);
//       }
//     }

//     // Remove any remaining duplicates in transfer routes
//     const uniqueTransferRoutes = [];
//     const seenTransferRoutes = new Set();
//     for (const route of allTransferRoutes) {
//       if (!seenTransferRoutes.has(route.combination)) {
//         seenTransferRoutes.add(route.combination);
//         uniqueTransferRoutes.push(route);
//       }
//     }

//     const allRoutes = uniqueDirectRoutes.concat(uniqueTransferRoutes);
//     allRoutes.sort((a, b) => a.score - b.score);

//     res.json({
//       success: true,
//       routes: allRoutes.slice(0, MAX_RESULTS),
//       hasDirectRoutes: uniqueDirectRoutes.length > 0,
//       hasTransferRoutes: uniqueTransferRoutes.length > 0,
//       metadata: {
//         totalDirectRoutes: uniqueDirectRoutes.length,
//         totalTransferRoutes: uniqueTransferRoutes.length,
//         maxRideKmUsed: currentMaxRide,
//         searchArea: { direct: MAX_WALK_KM_DIRECT, transfer: MAX_WALK_KM_TRANSFER }
//       }
//     });

//   } catch (error) {
//     console.error('Trip planning error:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// // ===================================================================
// // HELPER FUNCTIONS
// // ===================================================================
// const minDistanceToRoute = (point, coords) => {
//   let min = Infinity;
//   for (const [lat, lng] of coords) {
//     const d = haversineDistance(point.lat, point.lng, lat, lng);
//     if (d < min) min = d;
//   }
//   return min;
// };

// const findBestLeg = (userStops, routeCoords, transferPoint, currentMaxRideKm, reverse = false) => {
//   let best = null;
//   let bestScore = Infinity;

//   const transferIdx = routeCoords.findIndex(p =>
//     Math.abs(p[0] - transferPoint[0]) < 1e-6 && Math.abs(p[1] - transferPoint[1]) < 1e-6
//   );
//   if (transferIdx === -1) return null;

//   for (const stop of userStops) {
//     const startIdx = reverse ? transferIdx : stop.segment;
//     const endIdx = reverse ? stop.segment : transferIdx;
//     if (startIdx >= endIdx) continue;

//     const segment = routeCoords.slice(startIdx, endIdx + 1);
//     const rideKm = calculateRouteDistance(segment);
//     if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

//     const score = rideKm + stop.distance * 2;
//     if (score < bestScore) {
//       bestScore = score;
//       best = {
//         boarding: reverse ? { distance: 0, point: transferPoint } : stop,
//         alight: reverse ? stop : { distance: 0, point: transferPoint },
//         rideKm,
//         segment
//       };
//     }
//   }
//   return best;
// };

// const findPracticalStops = (userPoint, routeCoords, maxWalkKm) => {
//   const stops = [];
//   for (let i = 0; i < routeCoords.length; i++) {
//     const dist = haversineDistance(userPoint.lat, userPoint.lng, routeCoords[i][0], routeCoords[i][1]);
//     if (dist <= maxWalkKm) {
//       stops.push({ segment: i, point: routeCoords[i], distance: dist });
//     }
//   }
//   return stops;
// };

// const buildRideSegment = (coords, startStop, endStop) => {
//   return coords.slice(startStop.segment, endStop.segment + 1);
// };

// const calculateRouteDistance = (segment) => {
//   let total = 0;
//   for (let i = 1; i < segment.length; i++) {
//     total += haversineDistance(
//       segment[i-1][0], segment[i-1][1],
//       segment[i][0],   segment[i][1]
//     );
//   }
//   return total;
// };

// const calculateFare = (distance) => {
//   const baseFare = 13;
//   const baseKm   = 4;
//   const rate     = 1.8;
//   if (distance <= baseKm) return baseFare;
//   const extraKm = Math.ceil(distance - baseKm);
//   return Math.round(baseFare + extraKm * rate);
// };

// // ===================================================================
// // MAPBOX SEARCH
// // ===================================================================
// const searchPlaces = async (req, res) => {
//   try {
//     const { query, lat, lng } = req.query;
//     if (!query || query.length < 2) return res.json({ success: true, features: [] });

//     const TOMTOM_API_KEY = 'Ev7u9w9pfeL7JJ0wBHbwNIIzXGNnlK4K';
//     const latLng = lat && lng ? `&lat=${lat}&lon=${lng}` : '&lat=7.1907&lon=125.4553';
    
//     const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}${latLng}&limit=10&countrySet=PH&idxSet=POI`;
    
//     const response = await fetch(url);
//     const data = await response.json();
    
//     const features = data.results?.map(place => ({
//       id: place.id,
//       place_name: place.poi?.name + ', ' + place.address?.freeformAddress,
//       text: place.poi?.name,
//       center: [place.position.lon, place.position.lat],
//       address: place.address?.freeformAddress,
//       category: place.poi?.classifications?.[0]?.code
//     })) || [];

//     res.json({ success: true, features });
//   } catch (error) {
//     console.error('TomTom error:', error);
//     res.json({ success: true, features: [] });
//   }
// };

// // ===================================================================
// // EXPORT
// // ===================================================================
// module.exports = { planTrip, searchPlaces };



const db = require('../database');
const { haversineDistance } = require('../utils/geoUtils');

// ===================================================================
// CONFIGURATION – DAVAO REALITY
// ===================================================================
const MAX_WALK_KM_DIRECT   = 0.2;   // 200 m to board/alight
const MAX_WALK_KM_TRANSFER = 0.7;   // 700 m between jeepneys
const MAX_RIDE_KM          = 25;   
const MIN_RIDE_KM          = 1.5;   
const AVG_SPEED_KMH        = 20;    
const MAX_RESULTS          = 30;
const MAX_TRANSFER_SEARCH  = 15;    

// ===================================================================
// MAIN: planTrip – Search direct first, then transfer if needed
// ===================================================================
const planTrip = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        error: 'Start and end coordinates are required'
      });
    }

    const startPoint = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
    const endPoint   = { lat: parseFloat(endLat),   lng: parseFloat(endLng) };

    const routesResult = await db.query(`
      SELECT id, route_name, coordinates 
      FROM routes 
      WHERE coordinates IS NOT NULL
    `);

    console.log(`Found ${routesResult.rows.length} routes in DB`);

    // =================================================================
    // PROGRESSIVE SEARCH FUNCTION
    // =================================================================
    const searchWithMaxRide = async (currentMaxRideKm) => {
      const directRoutes = [];
      const transferRoutes = [];

      // =================================================================
      // 1. DIRECT ROUTES - FIXED DUPLICATES AND SCORING
      // =================================================================
      const usedDirectRoutes = new Set();
      
      for (const route of routesResult.rows) {
        if (usedDirectRoutes.has(route.route_name)) continue;
        
        const routeCoords = route.coordinates;
        if (!Array.isArray(routeCoords) || routeCoords.length < 10) continue;

        const startStops = findPracticalStops(startPoint, routeCoords, MAX_WALK_KM_DIRECT);
        const endStops   = findPracticalStops(endPoint,   routeCoords, MAX_WALK_KM_DIRECT);

        if (startStops.length === 0 || endStops.length === 0) continue;

        // Sort stops by distance - closest first
        startStops.sort((a, b) => a.distance - b.distance);
        endStops.sort((a, b) => a.distance - b.distance);

        let bestRide = null;
        let bestScore = Infinity;

        for (const startStop of startStops) {
          for (const endStop of endStops) {
            if (startStop.segment >= endStop.segment) continue;

            const rideSegment = buildRideSegment(routeCoords, startStop, endStop);
            const rideKm = calculateRouteDistance(rideSegment);

            if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

            const walkKm = startStop.distance + endStop.distance;
            
            // CRITICAL FIX: Choose the boarding point closest to user,
            // and the alighting point closest to destination
            // This prevents early alighting when jeepney continues to destination
            const boardingPenalty = startStop.distance * 1000;  // Minimize walk to board
            const alightingPenalty = endStop.distance * 1000;    // Minimize walk from alight
            const ridePenalty = rideKm * 0.1;                    // Small penalty for longer rides
            
            const score = boardingPenalty + alightingPenalty + ridePenalty;

            if (score < bestScore) {
              bestScore = score;
              bestRide = { startStop, endStop, rideKm, rideSegment, score };
            }
          }
        }

        if (bestRide) {
          const rideMins = (bestRide.rideKm / AVG_SPEED_KMH) * 60;
          const walkMins = (bestRide.startStop.distance + bestRide.endStop.distance) / 5 * 60;
          const totalMins = Math.round(rideMins + walkMins);

          directRoutes.push({
            type: 'direct',
            route: route.route_name,
            startWalkDistance: bestRide.startStop.distance,
            endWalkDistance:   bestRide.endStop.distance,
            totalWalkDistance: bestRide.startStop.distance + bestRide.endStop.distance,
            routeDistance:     bestRide.rideKm,
            estimatedTime:     totalMins,
            estimatedFare:     calculateFare(bestRide.rideKm),
            routeSegment:      bestRide.rideSegment,
            score:             bestRide.score
          });
          
          usedDirectRoutes.add(route.route_name);
        }
      }

      // =================================================================
      // 2. TRANSFER ROUTES – ONLY IF NO DIRECT ROUTES
      // =================================================================
      if (directRoutes.length > 0) {
        console.log(`Found ${directRoutes.length} direct routes, skipping transfer search`);
        return { directRoutes, transferRoutes: [] };
      }
      
      console.log('No direct routes found, searching for transfer routes...');

      const startCandidates = routesResult.rows
        .map(r => ({ route: r, dist: minDistanceToRoute(startPoint, r.coordinates) }))
        .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, MAX_TRANSFER_SEARCH);

      const endCandidates = routesResult.rows
        .map(r => ({ route: r, dist: minDistanceToRoute(endPoint, r.coordinates) }))
        .filter(x => x.dist <= MAX_WALK_KM_DIRECT + 0.3)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, MAX_TRANSFER_SEARCH);

      console.log(`Start candidates: ${startCandidates.length}, End: ${endCandidates.length}`);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transfer search timeout')), 3000)
      );

      const searchPromise = (async () => {
        const results = [];
        const usedTransferCombinations = new Set();

        for (const sCand of startCandidates) {
          const routeA = sCand.route;
          const startStopsA = findPracticalStops(startPoint, routeA.coordinates, MAX_WALK_KM_DIRECT);
          if (startStopsA.length === 0) continue;

          for (const eCand of endCandidates) {
            if (routeA.id === eCand.route.id) continue;
            const routeB = eCand.route;
            const endStopsB = findPracticalStops(endPoint, routeB.coordinates, MAX_WALK_KM_DIRECT);
            if (endStopsB.length === 0) continue;

            // Find ALL good transfer points, not just the closest
            const transferPoints = [];
            for (const pA of routeA.coordinates) {
              for (const pB of routeB.coordinates) {
                const walk = haversineDistance(pA[0], pA[1], pB[0], pB[1]);
                if (walk <= MAX_WALK_KM_TRANSFER) {
                  transferPoints.push({ pA, pB, walk });
                }
              }
            }

            // Try multiple transfer points to get different route options
            for (const transferPair of transferPoints.slice(0, 3)) {
              const bestA = findBestLeg(startStopsA, routeA.coordinates, transferPair.pA, currentMaxRideKm);
              const bestB = findBestLeg(endStopsB, routeB.coordinates, transferPair.pB, currentMaxRideKm, true);
              if (!bestA || !bestB) continue;

              const totalWalk = bestA.boarding.distance + transferPair.walk + bestB.alight.distance;
              const totalRide = bestA.rideKm + bestB.rideKm;
              
              const fareA = calculateFare(bestA.rideKm);
              const fareB = calculateFare(bestB.rideKm);
              const totalFare = fareA + fareB;
              
              const score = totalRide + totalWalk * 2;

              const rideMins = (totalRide / AVG_SPEED_KMH) * 60;
              const walkMins = (totalWalk / 5) * 60;
              const totalMins = Math.round(rideMins + walkMins);

              // Create unique key including transfer point to allow multiple routes with same jeepney combo
              const comboKey = `${routeA.route_name}-${routeB.route_name}-${transferPair.pA[0].toFixed(4)}-${transferPair.pA[1].toFixed(4)}`;
              
              if (!usedTransferCombinations.has(comboKey)) {
                usedTransferCombinations.add(comboKey);
                
                results.push({
                  type: 'transfer',
                  legs: [
                    {
                      route: routeA.route_name,
                      startWalkDistance: bestA.boarding.distance,
                      endWalkDistance: transferPair.walk,
                      routeDistance: bestA.rideKm,
                      routeSegment: bestA.segment,
                      estimatedFare: fareA,
                      boardingPoint: bestA.boarding.point,
                      alightingPoint: transferPair.pA,
                      estimatedTime: Math.round((bestA.rideKm / AVG_SPEED_KMH) * 60)
                    },
                    {
                      route: routeB.route_name,
                      startWalkDistance: transferPair.walk,
                      endWalkDistance: bestB.alight.distance,
                      routeDistance: bestB.rideKm,
                      routeSegment: bestB.segment,
                      estimatedFare: fareB,
                      boardingPoint: transferPair.pB,
                      alightingPoint: bestB.alight.point,
                      estimatedTime: Math.round((bestB.rideKm / AVG_SPEED_KMH) * 60)
                    }
                  ],
                  totalWalkDistance: totalWalk,
                  routeDistance: totalRide,
                  estimatedTime: totalMins,
                  estimatedFare: totalFare,
                  transferWalkDistance: transferPair.walk,
                  transferPoint: {
                    from: transferPair.pA,
                    to: transferPair.pB,
                    walkDistance: transferPair.walk
                  },
                  score,
                  combination: comboKey
                });

                if (results.length >= MAX_RESULTS * 2) return results;
              }
            }
          }
        }
        return results;
      })();

      try {
        transferRoutes.push(...await Promise.race([searchPromise, timeoutPromise]));
      } catch (err) {
        console.log('Transfer search timeout - returning partial results');
      }

      return { directRoutes, transferRoutes };
    };

    // =================================================================
    // PROGRESSIVE SEARCH EXECUTION
    // =================================================================
    let currentMaxRide = MAX_RIDE_KM;
    let allDirectRoutes = [];
    let allTransferRoutes = [];
    let searchIterations = 0;
    const MAX_ITERATIONS = 30;

    while (searchIterations < MAX_ITERATIONS) {
      console.log(`Searching with MAX_RIDE_KM = ${currentMaxRide}km`);
      
      const { directRoutes, transferRoutes } = await searchWithMaxRide(currentMaxRide);
      
      allDirectRoutes = directRoutes;
      allTransferRoutes = transferRoutes;
      
      // Stop if we found enough routes (either direct or transfer)
      if (allDirectRoutes.length > 0 || allTransferRoutes.length >= 3) {
        console.log(`Found routes with MAX_RIDE_KM = ${currentMaxRide}km: ${directRoutes.length} direct, ${transferRoutes.length} transfer`);
        break;
      }
      
      currentMaxRide += 1;
      searchIterations++;
      
      if (currentMaxRide > 50) {
        console.log('Reached maximum search distance (50km) without finding routes');
        break;
      }
    }

    // =================================================================
    // 3. FINAL RESPONSE - REMOVE DUPLICATES
    // =================================================================
    const uniqueDirectRoutes = [];
    const seenDirectRoutes = new Set();
    for (const route of allDirectRoutes) {
      if (!seenDirectRoutes.has(route.route)) {
        seenDirectRoutes.add(route.route);
        uniqueDirectRoutes.push(route);
      }
    }

    const uniqueTransferRoutes = [];
    const seenTransferRoutes = new Set();
    for (const route of allTransferRoutes) {
      if (!seenTransferRoutes.has(route.combination)) {
        seenTransferRoutes.add(route.combination);
        uniqueTransferRoutes.push(route);
      }
    }

    // Combine and sort all routes
    const allRoutes = uniqueDirectRoutes.concat(uniqueTransferRoutes);
    allRoutes.sort((a, b) => a.score - b.score);

    res.json({
      success: true,
      routes: allRoutes.slice(0, MAX_RESULTS),
      hasDirectRoutes: uniqueDirectRoutes.length > 0,
      hasTransferRoutes: uniqueTransferRoutes.length > 0,
      metadata: {
        totalDirectRoutes: uniqueDirectRoutes.length,
        totalTransferRoutes: uniqueTransferRoutes.length,
        maxRideKmUsed: currentMaxRide,
        searchArea: { direct: MAX_WALK_KM_DIRECT, transfer: MAX_WALK_KM_TRANSFER }
      }
    });

  } catch (error) {
    console.error('Trip planning error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================
const minDistanceToRoute = (point, coords) => {
  let min = Infinity;
  for (const [lat, lng] of coords) {
    const d = haversineDistance(point.lat, point.lng, lat, lng);
    if (d < min) min = d;
  }
  return min;
};

const findBestLeg = (userStops, routeCoords, transferPoint, currentMaxRideKm, reverse = false) => {
  let best = null;
  let bestScore = Infinity;

  const transferIdx = routeCoords.findIndex(p =>
    Math.abs(p[0] - transferPoint[0]) < 1e-6 && Math.abs(p[1] - transferPoint[1]) < 1e-6
  );
  if (transferIdx === -1) return null;

  for (const stop of userStops) {
    const startIdx = reverse ? transferIdx : stop.segment;
    const endIdx = reverse ? stop.segment : transferIdx;
    if (startIdx >= endIdx) continue;

    const segment = routeCoords.slice(startIdx, endIdx + 1);
    const rideKm = calculateRouteDistance(segment);
    if (rideKm < MIN_RIDE_KM || rideKm > currentMaxRideKm) continue;

    const score = rideKm + stop.distance * 2;
    if (score < bestScore) {
      bestScore = score;
      best = {
        boarding: reverse ? { distance: 0, point: transferPoint } : stop,
        alight: reverse ? stop : { distance: 0, point: transferPoint },
        rideKm,
        segment
      };
    }
  }
  return best;
};

const findPracticalStops = (userPoint, routeCoords, maxWalkKm) => {
  const stops = [];
  for (let i = 0; i < routeCoords.length; i++) {
    const dist = haversineDistance(userPoint.lat, userPoint.lng, routeCoords[i][0], routeCoords[i][1]);
    if (dist <= maxWalkKm) {
      stops.push({ segment: i, point: routeCoords[i], distance: dist });
    }
  }
  return stops;
};

const buildRideSegment = (coords, startStop, endStop) => {
  return coords.slice(startStop.segment, endStop.segment + 1);
};

const calculateRouteDistance = (segment) => {
  let total = 0;
  for (let i = 1; i < segment.length; i++) {
    total += haversineDistance(
      segment[i-1][0], segment[i-1][1],
      segment[i][0],   segment[i][1]
    );
  }
  return total;
};

const calculateFare = (distance) => {
  const baseFare = 13;
  const baseKm   = 4;
  const rate     = 1.8;
  if (distance <= baseKm) return baseFare;
  const extraKm = Math.ceil(distance - baseKm);
  return Math.round(baseFare + extraKm * rate);
};

// ===================================================================
// MAPBOX SEARCH
// ===================================================================
const searchPlaces = async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    if (!query || query.length < 2) return res.json({ success: true, features: [] });

    const TOMTOM_API_KEY = 'Ev7u9w9pfeL7JJ0wBHbwNIIzXGNnlK4K';
    const latLng = lat && lng ? `&lat=${lat}&lon=${lng}` : '&lat=7.1907&lon=125.4553';
    
    const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}${latLng}&limit=10&countrySet=PH&idxSet=POI`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const features = data.results?.map(place => ({
      id: place.id,
      place_name: place.poi?.name + ', ' + place.address?.freeformAddress,
      text: place.poi?.name,
      center: [place.position.lon, place.position.lat],
      address: place.address?.freeformAddress,
      category: place.poi?.classifications?.[0]?.code
    })) || [];

    res.json({ success: true, features });
  } catch (error) {
    console.error('TomTom error:', error);
    res.json({ success: true, features: [] });
  }
};

// ===================================================================
// EXPORT
// ===================================================================
module.exports = { planTrip, searchPlaces };
