module.exports = {
  async get(req, res) {
    try {
      return res.json({
        success: true,
        message: "Success!",
      });
    } catch (err) {
      throw err;
    }
  },
};