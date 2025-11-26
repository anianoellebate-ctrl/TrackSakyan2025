const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));


const loginRouter = require('./routes/login.router');
const signupRouter = require('./routes/signup.router');
const driversignupRouter = require('./routes/driversignup.router');
const driverinfoRouter = require('./routes/driverinfo.router')
const passengerinfoRouter = require('./routes/passengerinfo.router')
const routeRouter = require('./routes/route.router');
const updatecapacityRouter = require('./routes/updatecapacity.router')
const trafficRouter = require('./routes/trafficreports.router');
const profileRouter = require('./routes/profile.route');
const updateprofileRouter = require('./routes/profileupdate.router');
const updatedriverprofileRouter = require('./routes/profiledriverupdate.router');
const tripsummaryRouter = require('./routes/tripsummary.router');
const heatmapRouter = require('./routes/heatmap.router');
const apiKeysRouter = require('./routes/apikeys.router');
const bayadboxloginRouter = require('./routes/bayadboxlog.router');
const bayadboxsignupRouter = require('./routes/bayadboxsignup.router');
const check = require('./routes/check.router');
const plantripRouter = require('./routes/plantrip.router');
const congestionRouter = require('./routes/congestion.router');
const jeepneydensityRouter = require('./routes/jeepneydensity.router');
const forgotpasswordRouter = require('./routes/forgotpassword.router');
const uploadRouter = require('./routes/upload.router');



const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const socketController = require('./controller/socket.controller');
socketController(io);


app.use('/api/v1/login', loginRouter);
app.use('/api/v1/signup', signupRouter);
app.use('/api/v1/driversignup', driversignupRouter);
app.use('/api/v1/driverinfo', driverinfoRouter);
app.use('/api/v1/passengerinfo', passengerinfoRouter);
app.use('/api/v1/routes', routeRouter);
app.use('/api/v1/updatecapacity', updatecapacityRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/updateprofile', updateprofileRouter);
app.use('/api/v1/updatedriverprofile', updatedriverprofileRouter);
app.use('/api/v1/traffic-reports', trafficRouter);
app.use('/api/v1/tripsummary', tripsummaryRouter);
app.use('/api/v1/heatmap', heatmapRouter);
app.use('/api/v1/apikeys', apiKeysRouter);
app.use('/api/v1/bayadboxlogin', bayadboxloginRouter);
app.use('/api/v1/bayadboxsignup', bayadboxsignupRouter);
app.use('/api/v1/check', check);
app.use('/api/v1/plantrip', plantripRouter);
app.use('/api/v1/passenger-ml', congestionRouter);
app.use('/api/v1/jeepney-ml', jeepneydensityRouter);
app.use('/api/v1/forgotpassword', forgotpasswordRouter);




// const PORT = process.env.PORT || 21108;
// app.listen(PORT, () => {
//   console.log("Server is running on port:", PORT);
// });

const PORT = process.env.PORT || 21108;

// server.listen(PORT, () => {
//   console.log("🚀 Server is running on port:", PORT);
// });

server.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 Server is running on port:", PORT);
  console.log("📱 Accessible from network devices");
});
