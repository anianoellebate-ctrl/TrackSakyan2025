// let users = {}; // in-memory storage

// function socketController(io) {
//   io.on("connection", (socket) => {
//     console.log("✅ Socket connected:", socket.id);

//     socket.on("updateLocation", (data) => {
//       // Save latest location + role
//     //  users[socket.id] = { ...data, id: socket.id };
//      users[data.email] = { ...data, socketId: socket.id }; 

//       console.log("📍 Location update:", data);

//       // Build visible list for THIS socket
//       let visible;
//       if (data.role === "driver") {
//         visible = Object.values(users).filter(
//           // (u) => u.role === "passenger" || u.email === data.email
//             (u) => u.role === "passenger" && u.route === data.route
//         );
//       } else {
//         visible = Object.values(users).filter(
//           // (u) => u.role === "driver" || u.email === data.email
//             (u) => u.role === "driver" // Show all drivers to passengers
//         );
//       }

//       // Send only to THIS user
//       socket.emit("locations", visible);

//       // Also update everyone ELSE who cares about this user
//       Object.entries(users).forEach(([id, u]) => {
//         if (id === socket.id) return; // skip self
//         const client = io.sockets.sockets.get(id);
//         if (!client) return;

//         let othersVisible;
//         if (u.role === "driver") {
//           othersVisible = Object.values(users).filter(
//             (x) => x.role === "passenger" || x.email === u.email
//           );
//         } else {
//           othersVisible = Object.values(users).filter(
//             (x) => x.role === "driver" || x.email === u.email
//           );
//         }

//         client.emit("locations", othersVisible);
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Socket disconnected:", socket.id);
//       // delete users[socket.id];

//        // Find and remove the user with this socketId
//       for (const email in users) {
//         if (users[email].socketId === socket.id) {
//           delete users[email];
//           break;
//         }
//       }

//       // Update everyone else
//       Object.entries(users).forEach(([id, u]) => {
//         const client = io.sockets.sockets.get(id);
//         if (!client) return;

//         let visible;
//         if (u.role === "driver") {
//           visible = Object.values(users).filter(
//             (x) => x.role === "passenger" || x.email === u.email
//           );
//         } else {
//           visible = Object.values(users).filter(
//             (x) => x.role === "driver" || x.email === u.email
//           );
//         }

//         client.emit("locations", visible);
//       });
//     });
//   });
// }

// module.exports = socketController;


// let users = {}; // in-memory storage

// function socketController(io) {
//   io.on("connection", (socket) => {
//     console.log("✅ Socket connected:", socket.id);

//     socket.on("manualDisconnect", (data) => {
//   console.log("🔌 Manual disconnect requested for:", data.email);
  
//   if (users[data.email]) {
//     delete users[data.email];
//     console.log("✅ Removed user from storage:", data.email);
    
//     socket.broadcast.emit("userDisconnected", data.email);
//     notifyAllClients();
//   }
// });
//     // Handle location updates
//   socket.on("updateLocation", (data) => {
//     // Save latest location but preserve existing route if it exists
//     if (users[data.email]) {
//       // Keep the existing route if the new data doesn't have one
//       users[data.email] = { 
//         ...users[data.email], // preserve existing data (including route)
//         ...data, // update with new data
//         socketId: socket.id 
//       };
//     } else {
//       // New user - set default route if not provided
//       users[data.email] = { 
//         ...data, 
//         socketId: socket.id,
//         route: data.route || "No route" // default if missing
//       };
//     }

//       console.log("📍 Location update:", users[data.email]);

//       // Notify all relevant clients about the updated locations
//       notifyRelevantClients(data.email);
//     });

//     // Handle route updates
//     socket.on("updateRoute", (data) => {
//       console.log("🔄 Route update:", data);
      
//       // Update the user's route in storage
//       if (users[data.email]) {
//         users[data.email].route = data.route;
//         console.log(`✅ Updated route for ${data.email}: ${data.route}`);
        
//         // Notify all relevant clients about the route change
//         notifyRelevantClients(data.email);
//       } else {
//         console.log(`❌ User ${data.email} not found in storage`);
//         // Create user if they don't exist yet
//         users[data.email] = {
//           email: data.email,
//           route: data.route,
//           socketId: socket.id,
//           role: "passenger" // default role
//         };
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Socket disconnected:", socket.id);
      
//       // Find and remove the user with this socketId
//       let disconnectedEmail = null;
//       for (const email in users) {
//         if (users[email].socketId === socket.id) {
//           disconnectedEmail = email;
//           delete users[email];
//           break;
//         }
//       }
      
//       if (!disconnectedEmail) return;

//       // Notify all clients that this user disconnected
//       socket.broadcast.emit("userDisconnected", disconnectedEmail);

//       // Update everyone else with the current user list
//       notifyAllClients();
//     });

//     // Helper function to notify all relevant clients
//     function notifyRelevantClients(updatedUserEmail) {
//       const updatedUser = users[updatedUserEmail];
//       if (!updatedUser) return;

//       Object.values(users).forEach((user) => {
//         const client = io.sockets.sockets.get(user.socketId);
//         if (!client) return;

//         let visible;
//         if (user.role === "driver") {
//           // This driver should see: themselves + passengers on their route
//           visible = Object.values(users).filter(
//             (u) => u.email === user.email || (u.role === "passenger" && u.route === user.route)
//           );
//         } else {
//           // This passenger should see: themselves + all drivers
//           visible = Object.values(users).filter(
//             (u) => u.email === user.email || u.role === "driver"
//           );
//         }

//         client.emit("locations", visible);
//       });
//     }

//     // Helper function to notify all clients
//     function notifyAllClients() {
//       Object.values(users).forEach((user) => {
//         const client = io.sockets.sockets.get(user.socketId);
//         if (!client) return;

//         let visible;
//         if (user.role === "driver") {
//           visible = Object.values(users).filter(
//             (u) => u.email === user.email || (u.role === "passenger" && u.route === user.route)
//           );
//         } else {
//           visible = Object.values(users).filter(
//             (u) => u.email === user.email || u.role === "driver"
//           );
//         }

//         client.emit("locations", visible);
//       });
//     }
//   });
// }

// module.exports = socketController;

let users = {}; // in-memory storage

function socketController(io) {
  // Add authentication middleware
  io.use((socket, next) => {
    const { email, role, foundIn } = socket.handshake.auth;
    
    console.log('🔐 Socket authentication attempt:', email, role, foundIn);
    
    if (!email) {
      console.log('❌ Socket connection rejected: No email provided');
      return next(new Error('Authentication error: No email provided'));
    }
    
    // You could add additional validation here if needed
    // For example: check if user exists in database, is verified, etc.
    
    console.log('✅ Socket authentication successful for:', email);
    next();
  });

  io.on("connection", (socket) => {
    const { email, role, foundIn } = socket.handshake.auth;
    
    console.log("✅ Socket connected:", socket.id, "for user:", email, "role:", role);
    
    const wasPreviouslyConnected = users[email] && users[email].socketId !== socket.id;
   
    const existingRoute = users[email]?.route;
    // Store user immediately upon connection with their role from auth
    users[email] = {
      email: email,
      socketId: socket.id,
      role: role || 'passenger', // Use role from auth, default to passenger
      route: existingRoute || 'No route', // Default route
      latitude:  users[email]?.latitude || null,
      longitude:  users[email]?.longitude || null,
      timestamp: new Date(),
      reconnected: wasPreviouslyConnected
    };

    console.log("👤 User added to storage:", users[email]);

    if (wasPreviouslyConnected) {
      console.log("🔁 User reconnected:", email);
      socket.broadcast.emit("userReconnected", users[email]);
    }

    // Notify all clients about the new connection
    notifyAllClients();

    socket.on("manualDisconnect", (data) => {
      console.log("🔌 Manual disconnect requested for:", data.email);
      
      if (users[data.email]) {
        delete users[data.email];
        console.log("✅ Removed user from storage:", data.email);
        
        socket.broadcast.emit("userDisconnected", data.email);
        notifyAllClients();
      }
    });

  
    socket.on("updateLocation", (data) => {
      // Verify the email in the data matches the authenticated user
      if (data.email !== email) {
        console.log('❌ Unauthorized location update attempt:', data.email, 'vs authenticated:', email);
        return;
      }

      // ========== FIX 4: IMPROVED LOCATION UPDATE HANDLING ==========
      // Always update the user's data, preserving existing route if not provided
      const existingUser = users[data.email];
      
      users[data.email] = { 
        ...(existingUser || {}), // Preserve all existing data
        ...data, // Update with new data
        socketId: socket.id,
        role: existingUser?.role || role || 'passenger', // Preserve role
        route: data.route || existingUser?.route || 'No route', // Preserve route
        timestamp: new Date()
      };

      console.log("📍 Location update for:", data.email, "Route:", users[data.email].route);
      // ========== END FIX 4 ==========

      // Notify all relevant clients about the updated locations
      notifyRelevantClients(data.email);
    });

    // Handle route updates
    socket.on("updateRoute", (data) => {
      // Verify the email in the data matches the authenticated user
      if (data.email !== email) {
        console.log('❌ Unauthorized route update attempt:', data.email, 'vs authenticated:', email);
        return;
      }

      console.log("🔄 Route update:", data);
      
      // Update the user's route in storage
      if (users[data.email]) {
        users[data.email].route = data.route;
        users[data.email].timestamp = new Date();
        console.log(`✅ Updated route for ${data.email}: ${data.route}`);
        
        // Notify all relevant clients about the route change
        notifyRelevantClients(data.email);
      } else {
        console.log(`❌ User ${data.email} not found in storage, creating new entry`);
        users[data.email] = {
          email: data.email,
          route: data.route,
          socketId: socket.id,
          role: role || 'passenger',
          timestamp: new Date()
        };
      }
    });

    socket.on("getLocations", () => {
      console.log("📡 Manual locations request from:", email);
      
      let visible;
      if (users[email]?.role === "driver") {
        visible = Object.values(users).filter((u) => {
          if (u.email === email) return true;
          if (u.role === "passenger" && u.route === users[email].route) {
            return u.latitude !== null && u.longitude !== null;
          }
          return false;
        });
      } else {
        visible = Object.values(users).filter(
          (u) => u.email === email || u.role === "driver"
        );
      }
      
      if (users[email]?.role === "driver") {
        const passengerCount = visible.filter(u => u.role === "passenger").length;
        console.log(`🚗 Driver ${email} request: ${passengerCount} passengers, ${visible.length} total users`);
      } else {
        const driverCount = visible.filter(u => u.role === "driver").length;
        console.log(`👤 Passenger ${email} request: ${driverCount} drivers, ${visible.length} total users`);
      }

      socket.emit("locations", visible);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, "Reason:", reason);
      
      // Find and remove the user with this socketId
      let disconnectedEmail = null;
        for (const email in users) {
          if (users[email].socketId === socket.id) {
            disconnectedEmail = email;
            
           
            delete users[email];
            console.log("🔌 Marked user as disconnected:", email);
            break;
          }
        }
      
      if (disconnectedEmail) {
        console.log("🗑️ Removed user from storage:", disconnectedEmail);
        
        // Notify all clients that this user disconnected
        socket.broadcast.emit("userDisconnected", disconnectedEmail);

        // Update everyone else with the current user list
        notifyAllClients();
      }
    });

    // Helper function to notify all relevant clients
   function notifyRelevantClients(updatedUserEmail) {
  const updatedUser = users[updatedUserEmail];
  if (!updatedUser) return;

  Object.values(users).forEach((user) => {
    const client = io.sockets.sockets.get(user.socketId);
    if (!client) return;

    let visible;
    if (user.role === "driver") {
      // This driver should see: themselves + ALL passengers on their route (including reconnected ones)
      visible = Object.values(users).filter((u) => {
        // Always show the driver themselves
        if (u.email === user.email) return true;
        
        // Show passengers that match the driver's route AND have valid coordinates
        if (u.role === "passenger" && u.route === user.route) {
          // Only show if they have recent coordinates (not null/undefined)
          return u.latitude !== null && u.longitude !== null;
        }
        
        return false;
      });
    } else {
      // This passenger should see: themselves + all drivers
      visible = Object.values(users).filter(
        (u) => u.email === user.email || u.role === "driver"
      );
    }

    if (user.role === "driver") {
      const passengerCount = visible.filter(u => u.role === "passenger" && u.route === user.route).length;
      console.log(`🚗 Driver ${user.email}: ${passengerCount} matching passengers, ${visible.length} total users`);
    } else {
      const driverCount = visible.filter(u => u.role === "driver" && u.route === user.route).length;
      console.log(`👤 Passenger ${user.email}: ${driverCount} matching drivers, ${visible.length} total users`);
    }

    client.emit("locations", visible);
  });
}

// Helper function to notify all clients
function notifyAllClients() {
  Object.values(users).forEach((user) => {
    const client = io.sockets.sockets.get(user.socketId);
    if (!client) return;

    let visible;
    if (user.role === "driver") {
      visible = Object.values(users).filter((u) => {
        if (u.email === user.email) return true;
        if (u.role === "passenger" && u.route === user.route) {
          return u.latitude !== null && u.longitude !== null;
        }
        return false;
      });
    } else {
      visible = Object.values(users).filter(
        (u) => u.email === user.email || u.role === "driver"
      );
    }

    if (user.role === "driver") {
      const passengerCount = visible.filter(u => u.role === "passenger" && u.route === user.route).length;
      console.log(`🚗 Driver ${user.email}: ${passengerCount} matching passengers, ${visible.length} total users`);
    } else {
      const driverCount = visible.filter(u => u.role === "driver" && u.route === user.route).length;
      console.log(`👤 Passenger ${user.email}: ${driverCount} matching drivers, ${visible.length} total users`);
    }
    
    client.emit("locations", visible);
  });
}

  });
}

module.exports = socketController;