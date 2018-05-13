
let winston = require('winston')
let properties = require("./env.json")
winston.add(winston.transports.File, { filename: './log.txt' })
winston.remove(winston.transports.Console)
winston.level = properties.env==="prod"?"error":"debug"

module.exports = winston