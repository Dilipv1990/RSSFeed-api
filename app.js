let express = require('express')
let path = require('path')
let favicon = require('serve-favicon')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let api = require('./routes/api')
let index = require('./routes/index')
let process = require('process')
let logger = require('./logger')
let properties = require('./env.json')
let app = express()



// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api)
app.use('/', index)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
});

// development error handler
// will print stacktrace
if (properties.env === 'dev') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})


module.exports = app
