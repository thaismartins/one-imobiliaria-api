var DATABASE, IP, PORT;

IP = process.env.IP || '127.0.0.1';

PORT = process.env.PORT || 3000;

DATABASE = process.env.MONGODB_URI || 'mongodb://localhost/one';

module.exports = {
  'jwt': {
    'expires': '24h',
    'expiresRemember': '30m',
    'secret': 'devone'
  },
  'database': DATABASE,
  'port': PORT,
  'host': IP,
  'uri': 'http://' + IP + ':' + PORT,
  'googleapi': 'AIzaSyAJDB01qnVKG9xSOEWheD4HLnxI0uU7-44'
};
