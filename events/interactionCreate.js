const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { bolumBul, bolumGuncelle } = require('../utils/bolumStorage');
const { animeBul } = require('../utils/animeStorage');
const { ASAMALAR, sonAsamaMi, asamaEtiketGetir } = require('../utils/asamaYapilandirmasi');
const { bolumEmbediOlustur } = require('../utils/embedOlustur');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Slash komutları
    if (interaction.isChatInputCommand()) {
      const komut = interaction.client.commands.get(interaction.commandName);
      if (!komut) return;
      try {
        await komut.execute(interaction);
      } catch (hata) {
        console.error(hata);
        const mesaj = { content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(mesaj);
        } else {
          await interaction.reply(mesaj);
        }
      }
      return;
    }

    // 1. select menü: bölüm seçildi → aşama seçtir
    if (interaction.isStringSelectMenu() && interaction.customId === 'bolumSec') {
      const bolum = bolumBul(interaction.values[0]);

      if (!bolum) {
        return interaction.update({ content: 'Bu bölüm artık bulunamadı, iptal edildi.', components: [] });
      }

      const secenekler = ASAMALAR.map(asama => {
        const secenek = { label: asama.etiket, value: asama.anahtar };
        if (bolum.asama === asama.anahtar) {
          secenek.description = 'Mevcut aşama';
        }
        return secenek;
      });

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`asamaSec_${bolum.id}`)
        .setPlaceholder('Yeni aşamayı seç')
        .addOptions(secenekler);

      const satir = new ActionRowBuilder().addComponents(menu);

      return interaction.update({ content: 'Bu bölümü hangi aşamaya alalım?', components: [satir] });
    }

    // 2. select menü: aşama seçildi → kaydı güncelle, duyuru embed'ini düzenle
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('asamaSec_')) {
      const bolumId = interaction.customId.replace('asamaSec_', '');
      const yeniAsama = interaction.values[0];
      const bolum = bolumBul(bolumId);

      if (!bolum) {
        return interaction.update({ content: 'Bu bölüm artık bulunamadı, iptal edildi.', components: [] });
      }

      const guncelBolum = bolumGuncelle(bolumId, {
        asama: yeniAsama,
        guncelleyenKullaniciId: interaction.user.id,
        guncellemeTarihi: new Date().toISOString(),
        tamamlandiMi: sonAsamaMi(yeniAsama)
      });

      const anime = animeBul(guncelBolum.animeId);

      if (guncelBolum.mesajId && guncelBolum.kanalId) {
        try {
          const kanal = await interaction.client.channels.fetch(guncelBolum.kanalId);
          const mesaj = await kanal.messages.fetch(guncelBolum.mesajId);
          const yeniEmbed = bolumEmbediOlustur(anime, guncelBolum);
          await mesaj.edit({ embeds: [yeniEmbed] });
        } catch (hata) {
          console.error('Duyuru mesajı güncellenemedi:', hata.message);
        }
      }

      return interaction.update({
        content: `${anime.baslik} - ${guncelBolum.bolumNumarasi}. Bölüm artık **${asamaEtiketGetir(yeniAsama)}** aşamasında.`,
        components: []
      });
    }
  }
};