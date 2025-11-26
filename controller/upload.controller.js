const { supabase } = require('../database');

const uploadController = {
  uploadImage: async (req, res) => {
    try {
      const { image, userId, type = 'license' } = req.body;

      if (!image || !userId) {
        return res.status(400).json({
          success: false,
          error: "Image and user ID are required."
        });
      }

      // Remove data URL prefix
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const arrayBuffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${userId}/${type}.jpg`;
      const bucket = type === 'license' ? 'plates' : 'ids';

      // Upload directly to Supabase storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, { 
          contentType: "image/jpeg", 
          upsert: true 
        });

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const imageUrl = publicUrlData?.publicUrl;

      res.json({
        success: true,
        imageUrl: imageUrl,
        message: "Image uploaded successfully"
      });

    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};

module.exports = uploadController;
