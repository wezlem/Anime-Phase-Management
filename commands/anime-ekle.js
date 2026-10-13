const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const crypto = require('crypto');
const { anilistBilgisiGetir } = require('../utils/anilist');
const { animeEkle, animeMalIdIleBul } = require('../utils/animeStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anime-ekle')
    .setDescription('Takip edilecek yeni bir anime ekler')
    .addIntegerOption(opt =>
      opt.setName('mal-id')
        .setDescription('Animenin MyAnimeList ID\'si')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('son-bolum')
        .setDescription('Daha önce paylaşılmış son bölüm (varsa)')
        .setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('son-sezon')
        .setDescription('Daha önce paylaşılmış son sezon (varsa)')
        .setRequired(false)),

  async execute(interaction) {
    const yetkiliRolId = process.env.YETKILI_ROL_ID;
    if (yetkiliRolId && !interaction.member.roles.cache.has(yetkiliRolId)) {
      return interaction.reply({ content: 'Bu komutu kullanma yetkin yok.', ephemeral: true });
    }

    const malId = interaction.options.getInteger('mal-id');
    const sonBolum = interaction.options.getInteger('son-bolum');
    const sonSezon = interaction.options.getInteger('son-sezon');

    if (animeMalIdIleBul(malId)) {
      return interaction.reply({ content: 'Bu anime zaten ekli.', ephemeral: true });
    }

    await interaction.deferReply();

    const bilgi = await anilistBilgisiGetir(malId);
    if (!bilgi) {
      return interaction.editReply('Bu MAL ID\'ye karşılık AniList\'te bir kayıt bulunamadı.');
    }

    const yeniAnime = {
      id: crypto.randomUUID(),
      malId: String(malId),
      aniListId: bilgi.aniListId,
      baslik: bilgi.baslik,
      banner: bilgi.banner,
      sonBilinenBolum: sonBolum ?? null,
      sonBilinenSezon: sonSezon ?? null,
      eklenmeTarihi: new Date().toISOString()
    };

    animeEkle(yeniAnime);

    await interaction.editReply(`**${bilgi.baslik}** takibe eklendi.`);
  }
};