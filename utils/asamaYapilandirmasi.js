const ASAMALAR = [
  { anahtar: 'ceviri', etiket: 'Çeviri' },
  { anahtar: 'redakte', etiket: 'Redakte' },
  { anahtar: 'encode', etiket: 'Encode' },
  { anahtar: 'upload', etiket: 'Upload' }
];

function asamaEtiketGetir(anahtar) {
  const asama = ASAMALAR.find(a => a.anahtar === anahtar);
  return asama ? asama.etiket : 'Bilinmiyor';
}

function sonAsamaMi(anahtar) {
  return anahtar === ASAMALAR[ASAMALAR.length - 1].anahtar;
}

module.exports = { ASAMALAR, asamaEtiketGetir, sonAsamaMi };