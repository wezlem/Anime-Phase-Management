const fs = require('fs');
const path = require('path');

const dosyaYolu = path.join(__dirname, '..', 'data', 'animeler.json');

function animeleriOku() {
  if (!fs.existsSync(dosyaYolu)) {
    fs.mkdirSync(path.dirname(dosyaYolu), { recursive: true });
    fs.writeFileSync(dosyaYolu, '[]');
  }
  return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
}

function animeleriKaydet(animeler) {
  fs.writeFileSync(dosyaYolu, JSON.stringify(animeler, null, 2));
}

function animeEkle(anime) {
  const animeler = animeleriOku();
  animeler.push(anime);
  animeleriKaydet(animeler);
}

function animeBul(id) {
  return animeleriOku().find(a => a.id === id);
}

function animeMalIdIleBul(malId) {
  return animeleriOku().find(a => a.malId === String(malId));
}

module.exports = { animeleriOku, animeEkle, animeBul, animeMalIdIleBul };