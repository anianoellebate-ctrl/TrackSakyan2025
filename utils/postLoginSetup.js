// const { supabase } = require('../database');

// async function postLoginSetup(userId, profile) {
//   try {
//     if (!profile) return;

//     // Driver setup
//     if (profile.plateNumber) {
//       let plateUrl = null;

//       if (profile.plateImage) {
//         const base64 = profile.plateImage.replace(/^data:image\/\w+;base64,/, '');
//         const arrayBuffer = Buffer.from(base64, 'base64');
//         const fileName = `${userId}/plate.jpg`;

//         const { error: storageError } = await supabase.storage
//           .from("plates")
//           .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: true });
//         if (storageError) throw storageError;

//         const { data: publicUrlData } = supabase.storage.from("plates").getPublicUrl(fileName);
//         plateUrl = publicUrlData?.publicUrl ?? null;
//       }

//       // Ensure row exists (UPSERT)
//       const { error: insertError } = await supabase.from("drivers").upsert([{
//         driver_id: userId,
//         first_name: profile.firstName,
//         last_name: profile.lastName,
//         email: profile.email,
//         plate_no: profile.plateNumber,
//         plate_image_url: plateUrl,
//         capacity_max: profile.capacity_max,
//         created_at: new Date().toISOString(),
//       }], { onConflict: "driver_id" });

//       if (insertError) throw insertError;

//       console.log("Driver profile setup completed:", userId);
//     }

//     // Commuter setup
//     else {
//       let idUrl = null;

//       if (profile.idType && profile.idType !== "Regular" && profile.idImage) {
//         const base64 = profile.idImage.replace(/^data:image\/\w+;base64,/, '');
//         const arrayBuffer = Buffer.from(base64, 'base64');
//         const safeType = profile.idType.replace(/\s+/g, "_");
//         const fileName = `${userId}/${safeType}.jpg`;

//         const { error: storageError } = await supabase.storage
//           .from("ids")
//           .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: true });
//         if (storageError) throw storageError;

//         const { data: publicUrlData } = supabase.storage.from("ids").getPublicUrl(fileName);
//         idUrl = publicUrlData?.publicUrl ?? null;
//       }

//       const { error: insertError } = await supabase.from("commuters").upsert([{
//         commuter_id: userId,
//         first_name: profile.firstName,
//         last_name: profile.lastName,
//         email: profile.email,
//         id_type: profile.idType ?? "Regular",
//         id_image_url: idUrl,
//         created_at: new Date().toISOString(),
//       }], { onConflict: "commuter_id" });

//       if (insertError) throw insertError;

//       console.log("Commuter profile setup completed:", userId);
//     }
//   } catch (err) {
//     console.error("postLoginSetup error:", err);
//     throw err;
//   }
// }

// module.exports = postLoginSetup;

const { supabase } = require('../database');

async function postLoginSetup(userId, profile) {
  try {
    if (!profile) return;

    // Driver setup
    if (profile.plateNumber) {
      let licenseUrl = null;

      if (profile.licenseImage) {
        // Remove data URL prefix if present
        let base64Data = profile.licenseImage;
        if (base64Data.startsWith('data:image')) {
          base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
        }
        
        const arrayBuffer = Buffer.from(base64Data, 'base64');
        const fileName = `${userId}/license.jpg`;

        const { error: storageError } = await supabase.storage
          .from("plates")
          .upload(fileName, arrayBuffer, { 
            contentType: "image/jpeg", 
            upsert: true 
          });
          
        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage.from("plates").getPublicUrl(fileName);
        licenseUrl = publicUrlData?.publicUrl ?? null;
      }

      // Ensure row exists (UPSERT)
      const { error: insertError } = await supabase.from("drivers").upsert([{
        driver_id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        plate_no: profile.plateNumber,
        license_no: profile.licenseNumber,
        license_image_url: licenseUrl,
        capacity_max: profile.capacity_max,
        puv_type: profile.puv_type,
        jeepney_type: profile.jeepneyType,
        created_at: new Date().toISOString(),
      }], { onConflict: "driver_id" });

      if (insertError) throw insertError;

      console.log("Driver profile setup completed:", userId);
    }

    // Commuter setup (keep this for future use)
    else {
      let idUrl = null;

      if (profile.idType && profile.idType !== "Regular" && profile.idImage) {
        let base64Data = profile.idImage;
        if (base64Data.startsWith('data:image')) {
          base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
        }
        
        const arrayBuffer = Buffer.from(base64Data, 'base64');
        const safeType = profile.idType.replace(/\s+/g, "_");
        const fileName = `${userId}/${safeType}.jpg`;

        const { error: storageError } = await supabase.storage
          .from("ids")
          .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: true });
        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage.from("ids").getPublicUrl(fileName);
        idUrl = publicUrlData?.publicUrl ?? null;
      }

      const { error: insertError } = await supabase.from("commuters").upsert([{
        commuter_id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        id_type: profile.idType ?? "Regular",
        id_image_url: idUrl,
        created_at: new Date().toISOString(),
      }], { onConflict: "commuter_id" });

      if (insertError) throw insertError;

      console.log("Commuter profile setup completed:", userId);
    }
  } catch (err) {
    console.error("postLoginSetup error:", err);
    throw err;
  }
}

module.exports = postLoginSetup;
