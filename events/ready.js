const { bolumTakibiBaslat } = require('../services/bolumTakip');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
    bolumTakibiBaslat(client);
  }
};