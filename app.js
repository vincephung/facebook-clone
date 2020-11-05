var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
const socket = require('socket.io');

//handle database
require('./mongoConfig');

//jwt handle authenticate user
require('./authenticateUser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var commentsRouter = require('./routes/comments');
var friendRequestRouter = require('./routes/friendrequest');

var app = express();

//handle socket chat
const io = socket();
app.io = io;

let users = [];

io.on('connection', (socket) => {
  //adds connected users to user array
  socket.on('connection', (currentUserID) => {
    users = users.filter((user) => user.currentUserID !== null);
    const isConnected = users.find(
      (user) => user.currentUserID === currentUserID
    );
    if (!isConnected) {
      users.push({ socket, currentUserID });
    }
  });

  socket.on('send_message', (data) => {
    const user = users.find((user) => user.currentUserID === data.to);
    const userfrom = users.find((user) => user.currentUserID === data.from);
    console.log(data);
    if (user) {
      socket.broadcast.to(user.socket.id).emit('new_message', {
        id: data.to,
        message: data.message,
        chatIdentifier: data.chatIdentifier,
      });
      socket.broadcast.to(userfrom.socket.id).emit('new_message', {
        id: data.to,
        message: data.message,
        chatIdentifier: data.chatIdentifier,
      });
    } else if (!user) {
      socket.broadcast.to(userfrom.socket.id).emit('new_message', {
        id: data.to,
        message: 'User is not connected at the moment.',
        chatIdentifier: data.chatIdentifier,
      });
    }
  });

  socket.on('new_post', (post) => {
    socket.broadcast.emit('new_post', post);
  });

  //remove user from user array and disconnect
  socket.on('disconnect', () => {
    const user = users.find((user) => user.socket.id === socket.id);
    if (user) {
      users.splice(users.indexOf(user), 1);
    }
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(bodyParser.json()); // Send JSON responses
app.use(bodyParser.urlencoded({ extended: true })); // Parses urlencoded bodies
app.use(multipart());

//NEED TO CHANGE THE ROUTE HERE!!!!
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/posts', commentsRouter);
app.use('/api/users/friendrequest', friendRequestRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
