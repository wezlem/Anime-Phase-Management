const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { animeleriOku } = require('../utils/animeStorage');
const { bekleyenBolumleriGetir } = require('../utils/bolumStorage');
const { asamaEtiketGetir } = require('../utils/asamaYapilandirmasi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('asama-ekle')
    .setDescription('Bir bölümün çeviri aşamasını günceller'),

  async execute(interaction) {
    const yetkiliRolId = process.env.YETKILI_ROL_ID;
    if (yetkiliRolId && !interaction.member.roles.cache.has(yetkiliRolId)) {
      return interaction.reply({ content: 'Bu komutu kullanma yetkin yok.', ephemeral: true });
    }

    const animeler = animeleriOku();
    let secenekler = [];

    for (const anime of animeler) {
      const bekleyenler = bekleyenBolumleriGetir(anime.id);
      for (const bolum of bekleyenler) {
        secenekler.push({
          label: `${anime.baslik} - ${bolum.bolumNumarasi}. Bölüm`,
          description: bolum.asama === 'yok' ? 'Henüz aşama girilmedi' : `Mevcut aşama: ${asamaEtiketGetir(bolum.asama)}`,
          value: bolum.id
        });
      }
    }

    if (secenekler.length === 0) {
      return interaction.reply({ content: 'Şu an bekleyen bir bölüm yok.', ephemeral: true });
    }

    secenekler = secenekler.slice(0, 25); // Discord'un select menü sınırı

    const menu = new StringSelectMenuBuilder()
      .setCustomId('bolumSec')
      .setPlaceholder('Bir bölüm seç')
      .addOptions(secenekler);

    const satir = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: 'Hangi bölümün aşamasını güncelleyeceksin?', components: [satir], ephemeral: true });
  }
};