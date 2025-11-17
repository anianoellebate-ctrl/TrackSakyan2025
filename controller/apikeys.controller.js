// controller/apikeys.controller.js
const db = require('../database');

const apiKeysController = {
  getApiKeys: async (req, res) => {
    const sql = `
      SELECT key_name, key_value FROM api_keys WHERE is_active = true
    `;

    try {
      const result = await db.query(sql);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No API keys found' 
        });
      }

      // Convert array to object for easier access
      const keys = {};
      result.rows.forEach(row => {
        keys[row.key_name] = row.key_value;
      });

      res.json({
        success: true,
        keys: keys,
      });
    } catch (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }
  },

  // Optional: Get specific API key
  getApiKeyByName: async (req, res) => {
    const { keyName } = req.params;

    if (!keyName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key name is required' 
      });
    }

    const sql = `
      SELECT key_name, key_value FROM api_keys 
      WHERE key_name = $1 AND is_active = true
    `;

    try {
      const result = await db.query(sql, [keyName]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'API key not found' 
        });
      }

      res.json({
        success: true,
        key: result.rows[0],
      });
    } catch (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }
  }
};

module.exports = apiKeysController;