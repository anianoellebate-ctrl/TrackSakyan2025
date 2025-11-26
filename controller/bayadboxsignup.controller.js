// const { supabase } = require('../database');
// const postLoginSetup = require('../utils/postLoginSetup');

// const driverSignupController = {
//   signup: async (req, res) => {
//     const {
//       firstName,
//       lastName,
//       email,
//       plateNumber,
//       plateImage,
//       password,
//       confirmPassword
//     } = req.body;

//     try {
//       if (!firstName.trim() || !lastName.trim() || !email.trim()) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "All fields are required." 
//         });
//       }
//       if (password.length < 8) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Password must be at least 8 characters long." 
//         });
//       }
//       if (password !== confirmPassword) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Passwords do not match." 
//         });
//       }

//       const plateRegex = /^([A-Z]{3}\s\d{3,4}|[A-Z]{3}\s\d{2}[A-Z]|[0-9]{3}\s[A-Z]{3})$/;
//       if (!plateRegex.test(plateNumber.toUpperCase())) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Invalid Plate Number, Accepted formats: ABC 123, ABC 1234, ABC 12D, or 123 ABC." 
//         });
//       }
//       if (!plateImage) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Please upload an image of your plate number." 
//         });
//       }

//       // 1. Create auth user
//       const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//       });
//       if (signUpError) throw signUpError;
//       if (!signUpData.user) throw new Error("Signup failed. Try again.");

//       // 2. Immediately sign in
//       const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (loginError) throw loginError;

//       // 3. Run postLoginSetup with driver profile
//       if (loginData.user) {
//         const profile = { firstName, lastName, email, plateNumber, plateImage };
//         await postLoginSetup(loginData.user.id, profile);
//       }

//       res.json({
//         success: true,
//         message: "Welcome! Driver account created and logged in automatically.",
//         user: loginData.user,
//         session: loginData.session
//       });

//     } catch (error) {
//       console.error("Driver signup error:", error);
//       res.status(500).json({ 
//         success: false, 
//         error: error instanceof Error ? error.message : String(error) 
//       });
//     }
//   }
// };

// module.exports = driverSignupController;

// const { supabase } = require('../database');
// const postLoginSetup = require('../utils/postLoginSetup');

// const driverSignupController = {
//   signup: async (req, res) => {
//     const {
//       firstName,
//       lastName,
//       email,
//       plateNumber,
//       plateImage,
//       password,
//       confirmPassword,
//       jeepneyType
//     } = req.body;

//     try {
//       if (!firstName.trim() || !lastName.trim() || !email.trim()) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "All fields are required." 
//         });
//       }
//       if (password.length < 8) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Password must be at least 8 characters long." 
//         });
//       }
//       if (password !== confirmPassword) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Passwords do not match." 
//         });
//       }

//       const plateRegex = /^([A-Z]{3}\s\d{3,4}|[A-Z]{3}\s\d{2}[A-Z]|[0-9]{3}\s[A-Z]{3})$/;
//       if (!plateRegex.test(plateNumber.toUpperCase())) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Invalid Plate Number, Accepted formats: ABC 123, ABC 1234, ABC 12D, or 123 ABC." 
//         });
//       }
//       if (!plateImage) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Please upload an image of your plate number." 
//         });
//       }
      
//       if (!jeepneyType) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Please select your jeepney type." 
//         });
//       }
//       if (!['Traditional', 'Multicab'].includes(jeepneyType)) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Invalid jeepney type selected." 
//         });
//       }

//       // CALCULATE CAPACITY
//       const capacity_max = jeepneyType === 'Traditional' ? 22 : 16;

//       // 1. Create auth user
//       const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//       });
//       if (signUpError) throw signUpError;
//       if (!signUpData.user) throw new Error("Signup failed. Try again.");

//       // 2. Immediately sign in
//       const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (loginError) throw loginError;

//       // 3. Run postLoginSetup with driver profile
//       if (loginData.user) {
//         const profile = { firstName, lastName, email, plateNumber, plateImage, capacity_max  };
//         await postLoginSetup(loginData.user.id, profile);
//       }

//       res.json({
//         success: true,
//         message: "Welcome! Driver account created and logged in automatically.",
//         user: loginData.user,
//         session: loginData.session
//       });

//     } catch (error) {
//       console.error("Driver signup error:", error);
//       res.status(500).json({ 
//         success: false, 
//         error: error instanceof Error ? error.message : String(error) 
//       });
//     }
//   }
// };

// module.exports = driverSignupController;


const { supabase } = require('../database');
const postLoginSetup = require('../utils/postLoginSetup');

const driverSignupController = {
  signup: async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      plateNumber,
      licenseNumber,
      licenseImage,
      password,
      confirmPassword,
      puv_type,
      capacity
    } = req.body;

    try {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        return res.status(400).json({ 
          success: false, 
          error: "All fields are required." 
        });
      }

      if (!licenseNumber.trim()) {
        return res.status(400).json({ 
          success: false, 
          error: "License Number is required." 
        });
      }

      if (!capacity || !capacity.trim()) {
        return res.status(400).json({ 
          success: false, 
          error: "Capacity is required." 
        });
      }

      if (!puv_type) {
        return res.status(400).json({ 
          success: false, 
          error: "Please select a PUV category." 
        });
      }

      if (!['jeepney', 'taxi'].includes(puv_type)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid PUV category selected." 
        });
      }

      if (password.length < 8) {
        return res.status(400).json({ 
          success: false, 
          error: "Password must be at least 8 characters long." 
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ 
          success: false, 
          error: "Passwords do not match." 
        });
      }

      const plateRegex = /^([A-Z]{3}\s\d{3,4}|[A-Z]{3}\s\d{2}[A-Z]|[0-9]{3}\s[A-Z]{3})$/;
      if (!plateRegex.test(plateNumber.toUpperCase())) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid Plate Number, Accepted formats: ABC 123, ABC 1234, ABC 12D, or 123 ABC." 
        });
      }

      if (!licenseImage) {
        return res.status(400).json({ 
          success: false, 
          error: "Please upload an image of your LTO license." 
        });
      }

      // CAPACITY VALIDATION
      const capacityNum = Number(capacity);
      if (isNaN(capacityNum) || capacityNum > 18 || capacityNum < 1) {
        return res.status(400).json({ 
          success: false, 
          error: "Capacity must be a valid number between 1 and 18." 
        });
      }

      // 1. Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Signup failed. Try again.");

      // 2. Immediately sign in
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      // 3. Run postLoginSetup with driver profile
      if (loginData.user) {
        const profile = { 
          firstName, 
          lastName, 
          email, 
          plateNumber, 
          licenseNumber, 
          licenseImage, 
          capacity_max: capacityNum,
          puv_type
        };
        await postLoginSetup(loginData.user.id, profile);
      }

      res.json({
        success: true,
        message: "Sign up successful! Driver account created, wait for the admin to verify.",
        user: loginData.user,
        session: loginData.session
      });

    } catch (error) {
      console.error("Driver signup error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
};

module.exports = driverSignupController;
