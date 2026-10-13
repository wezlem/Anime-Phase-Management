const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dosyaYolu = path.join(__dirname, '..', 'data', 'bolumler.json');

function bolumleriOku() {
  if (!fs.existsSync(dosyaYolu)) {
    fs.mkdirSync(path.dirname(dosyaYolu), { recursive: true });
    fs.writeFileSync(dosyaYolu, '[]');
  }
  return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
}

function bolumleriKaydet(bolumler) {
  fs.writeFileSync(dosyaYolu, JSON.stringify(bolumler, null, 2));
}

function bolumAc(animeId, bolumNumarasi) {
  const bolumler = bolumleriOku();
  const yeniBolum = {
    id: crypto.randomUUID(),
    animeId,
    bolumNumarasi,
    asama: 'yok',
    mesajId: null,
    kanalId: null,
    guncelleyenKullaniciId: null,
    guncellemeTarihi: null,
    tamamlandiMi: false,
    acilmaTarihi: new Date().toISOString()
  };
  bolumler.push(yeniBolum);
  bolumleriKaydet(bolumler);
  return yeniBolum;
}

function bolumBul(id) {
  return bolumleriOku().find(b => b.id === id);
}

function bekleyenBolumleriGetir(animeId) {
  return bolumleriOku().filter(b => b.animeId === animeId && !b.tamamlandiMi);
}

function bolumGuncelle(id, guncellemeler) {
  const bolumler = bolumleriOku();
  const index = bolumler.findIndex(b => b.id === id);
  if (index === -1) return null;
  bolumler[index] = { ...bolumler[index], ...guncellemeler };
  bolumleriKaydet(bolumler);
  return bolumler[index];
}

module.exports = { bolumAc, bolumBul, bekleyenBolumleriGetir, bolumGuncelle, bolumleriOku };