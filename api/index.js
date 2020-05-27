const getData = require('./getData')

module.exports = async (req, res) => {
  const data = await getData()
  res.json(data)
}