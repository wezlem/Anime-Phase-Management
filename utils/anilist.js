async function anilistBilgisiGetir(malId) {
  const sorgu = `
    query ($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        id
        title {
          romaji
          english
        }
        bannerImage
        coverImage {
          extraLarge
        }
      }
    }
  `;

  const cevap = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sorgu, variables: { malId: Number(malId) } })
  });

  const veri = await cevap.json();
  const media = veri?.data?.Media;

  if (!media) {
    return null;
  }

  return {
    aniListId: media.id,
    baslik: media.title.romaji || media.title.english,
    banner: media.bannerImage || media.coverImage?.extraLarge || null
  };
}

module.exports = { anilistBilgisiGetir };