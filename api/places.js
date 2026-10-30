const places = require('./places.json');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.status(200).json({ count: places.length, places });
};
