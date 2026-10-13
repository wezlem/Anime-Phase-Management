require('dotenv').config();
const { animeleriOku } = require('../utils/animeStorage');
const { bolumleriOku, bolumAc, bolumGuncelle } = require('../utils/bolumStorage');
const { bolumEmbediOlustur } = require('../utils/embedOlustur');

const KONTROL_ARALIGI_MS = 15 * 60 * 1000; // 15 dakika

async function bugunkuSubListesiniGetir() {
  const cevap = await fetch('https://animeschedule.net/api/v3/timetables/today?tz=Europe/Istanbul', {
    headers: { Authorization: `Bearer ${process.env.ANIMESCHEDULE_TOKEN}` }
  });
  const veri = await cevap.json();
  return veri.filter(kayit => kayit.airType === 'sub');
}

function animeninSonrakiBeklenenBolumu(anime) {
  const kayitliBolumler = bolumleriOku().filter(b => b.animeId === anime.id);
  if (kayitliBolumler.length > 0) {
    const sonBolum = Math.max(...kayitliBolumler.map(b => b.bolumNumarasi));
    return sonBolum + 1;
  }
  if (anime.sonBilinenBolum) {
    return anime.sonBilinenBolum + 1;
  }
  return 1;
}

async function kontrolEt(client) {
  const animeler = animeleriOku();
  if (animeler.length === 0) return;

  let subListesi;
  try {
    subListesi = await bugunkuSubListesiniGetir();
  } catch (hata) {
    console.error('AnimeSchedule kontrolü başarısız:', hata.message);
    return;
  }

  for (const anime of animeler) {
    const beklenenBolum = animeninSonrakiBeklenenBolumu(anime);

    const eslesme = subListesi.find(kayit =>
      kayit.episodeNumber === beklenenBolum &&
      kayit.title?.toLowerCase().trim() === anime.baslik?.toLowerCase().trim()
    );

    if (!eslesme) continue;

    const yeniBolum = bolumAc(anime.id, beklenenBolum);

    const kanal = await client.channels.fetch(process.env.BOLUM_DUYURU_KANAL_ID);
    const embed = bolumEmbediOlustur(anime, yeniBolum);
    const mesaj = await kanal.send({ embeds: [embed] });

    bolumGuncelle(yeniBolum.id, { mesajId: mesaj.id, kanalId: kanal.id });
  }
}

function bolumTakibiBaslat(client) {
  kontrolEt(client); // bot açılır açılmaz bir kere hemen kontrol et
  setInterval(() => kontrolEt(client), KONTROL_ARALIGI_MS);
}

module.exports = { bolumTakibiBaslat };