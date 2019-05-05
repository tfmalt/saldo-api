const Sbanken = require('node-sbanken');

const sbanken = new Sbanken(
  {
    clientId: '',
    secret: '',
    userId: '',
  },
  { verbose: true }
);

// console.log(sbanken);
sbanken.accounts().then(data => {
  console.log('trial');
});
