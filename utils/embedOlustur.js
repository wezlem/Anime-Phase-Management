const { EmbedBuilder } = require('discord.js');
const { asamaEtiketGetir } = require('./asamaYapilandirmasi');

function bolumEmbediOlustur(anime, bolum) {
  const embed = new EmbedBuilder()
    .setColor(0x2b6cb0)
    .setTitle(`${anime.baslik} - ${bolum.bolumNumarasi}. Bölüm`);

  if (anime.banner) {
    embed.setImage(anime.banner);
  }

  if (bolum.tamamlandiMi) {
    embed.setDescription('Bölüm çevirisi tamamlandı.');
  } else if (bolum.asama === 'yok') {
    embed.setDescription('Bölüm yayınlandı, ekip çeviriye en kısa sürede başlayacak.');
  } else {
    let aciklama = `Mevcut aşama: **${asamaEtiketGetir(bolum.asama)}**`;
    if (bolum.guncelleyenKullaniciId) {
      aciklama += `\n-# Güncelleyen: <@${bolum.guncelleyenKullaniciId}>`;
    }
    embed.setDescription(aciklama);
  }

  return embed;
}

module.exports = { bolumEmbediOlustur };