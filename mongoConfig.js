//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB =
  'mongodb+srv://admin:taco123@cluster0.i85ft.mongodb.net/facebook-clone?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
