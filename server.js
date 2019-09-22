const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const dbConfig = require('./config/secert');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

///cors middle ware

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  );
  next();
});
//

app.use(cookieParser());
app.use(logger('dev'));

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

require('./sockets/streams')(io);

const auth = require('./routes/authRouter');
const post = require('./routes/postRoutes');

app.use('/api/chatapp', auth);
app.use('/api/chatapp', post);

app.set('port', 3000);

server.listen(app.get('port'), () => {
  console.log(`Server started on ${app.get('port')}`);
});
