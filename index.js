const fileInput$ = document.querySelector('.file-selector');
fileInput$.addEventListener('change', () => {
  const textFile = readFile(fileInput$);

  textFile.onload = function () {
    const symbol = document.querySelector('.symbol-selector').value;

    const text = textFile.result;

    if (symbol.length === 1) {
      const symbolProbability = getSymbolCount(symbol, text) / text.length;
      console.log(
        `probability of " ${symbol} " in text ${fileInput$.files[0].name} is`,
        symbolProbability,
      );
    }

    const textEntrophy = findEntropy('ua', text);
    console.log('text entrophy is', textEntrophy);

    const ammountOfInformationInText = textEntrophy * text.length;
    console.log('the ammount of the text information (bytes)', ammountOfInformationInText / 8);
    console.log('the ammount of the text information (bits)', ammountOfInformationInText);

    console.log(
      'file size / ammount of information:',
      `${fileInput$.files[0].size} / ${ammountOfInformationInText / 8} =`,
      fileInput$.files[0].size / (ammountOfInformationInText / 8),
    );

    ////////////////

    const aMyUTF8Input = strToUTF8Arr(text);
    const sMyBase64 = base64EncArr(aMyUTF8Input);
    const aMyUTF8Output = base64DecToArr(sMyBase64);
    const sMyOutput = UTF8ArrToStr(aMyUTF8Output);

    console.log('\n %c encoded to base64\n', 'background: #222; color: #ee1120');
    console.log(sMyBase64, '\n');
    console.log('\n %c decoded from base64\n', 'background: #222; color: #ee1120');
    console.log(sMyOutput, '\n');

    const base64TextEntrophy = findEntropy('en', sMyBase64);
    console.log('\nbase64 entrophy', base64TextEntrophy);
    const ammountOfInformationInBase64Text = base64TextEntrophy * sMyBase64.length;

    console.log(
      'the ammount of the base64 text information (bytes)',
      ammountOfInformationInBase64Text / 8,
    );
    console.log(
      'the ammount of the base64 text information (bits)',
      ammountOfInformationInBase64Text,
    );
  };
});

function readFile(element) {
  const fr = new FileReader();
  fr.readAsText(element.files[0]);
  return fr;
}

function getSymbolCount(symb, text) {
  return text.toLowerCase().split(symb.toLowerCase()).length - 1;
}

function findEntropy(lang = 'ua', text) {
  let alphabet;
  if (lang === 'ua') {
    alphabet = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя';
  } else if (lang === 'en') {
    alphabet = 'abcdefghijklmnopqrstuvwxyz';
  }

  let alphabetEntropy = 0;

  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];

    const letterCount = getSymbolCount(letter, text);
    const letterProbability = letterCount / text.length;
    if (letterProbability !== 0) {
      const letterEntropy = letterProbability * Math.log2(1 / letterProbability);
      alphabetEntropy += letterEntropy;
    }
  }
  return alphabetEntropy;
}

/////////

function b64ToUint6(nChr) {
  return nChr > 64 && nChr < 91
    ? nChr - 65
    : nChr > 96 && nChr < 123
    ? nChr - 71
    : nChr > 47 && nChr < 58
    ? nChr + 4
    : nChr === 43
    ? 62
    : nChr === 47
    ? 63
    : 0;
}

function base64DecToArr(sBase64, nBlocksSize) {
  const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ''); // Only necessary if the base64 includes whitespace such as line breaks.
  const nInLen = sB64Enc.length;
  const nOutLen = nBlocksSize
    ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
    : (nInLen * 3 + 1) >> 2;
  const taBytes = new Uint8Array(nOutLen);

  let nMod3;
  let nMod4;
  let nUint24 = 0;
  let nOutIdx = 0;
  for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      nMod3 = 0;
      while (nMod3 < 3 && nOutIdx < nOutLen) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
        nMod3++;
        nOutIdx++;
      }
      nUint24 = 0;
    }
  }

  return taBytes;
}

/* Base64 string to array encoding */
function uint6ToB64(nUint6) {
  return nUint6 < 26
    ? nUint6 + 65
    : nUint6 < 52
    ? nUint6 + 71
    : nUint6 < 62
    ? nUint6 - 4
    : nUint6 === 62
    ? 43
    : nUint6 === 63
    ? 47
    : 65;
}

function base64EncArr(aBytes) {
  let nMod3 = 2;
  let sB64Enc = '';

  const nLen = aBytes.length;
  let nUint24 = 0;
  for (let nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    // To break your base64 into several 80-character lines, add:
    //   if (nIdx > 0 && ((nIdx * 4) / 3) % 76 === 0) {
    //      sB64Enc += "\r\n";
    //    }

    nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCodePoint(
        uint6ToB64((nUint24 >>> 18) & 63),
        uint6ToB64((nUint24 >>> 12) & 63),
        uint6ToB64((nUint24 >>> 6) & 63),
        uint6ToB64(nUint24 & 63),
      );
      nUint24 = 0;
    }
  }
  return (
    sB64Enc.substring(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==')
  );
}

/* UTF-8 array to JS string and vice versa */

function UTF8ArrToStr(aBytes) {
  let sView = '';
  let nPart;
  const nLen = aBytes.length;
  for (let nIdx = 0; nIdx < nLen; nIdx++) {
    nPart = aBytes[nIdx];
    sView += String.fromCodePoint(
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen /* six bytes */
        ? /* (nPart - 252 << 30) may be not so safe in ECMAScript! So…: */
          (nPart - 252) * 1073741824 +
            ((aBytes[++nIdx] - 128) << 24) +
            ((aBytes[++nIdx] - 128) << 18) +
            ((aBytes[++nIdx] - 128) << 12) +
            ((aBytes[++nIdx] - 128) << 6) +
            aBytes[++nIdx] -
            128
        : nPart > 247 && nPart < 252 && nIdx + 4 < nLen /* five bytes */
        ? ((nPart - 248) << 24) +
          ((aBytes[++nIdx] - 128) << 18) +
          ((aBytes[++nIdx] - 128) << 12) +
          ((aBytes[++nIdx] - 128) << 6) +
          aBytes[++nIdx] -
          128
        : nPart > 239 && nPart < 248 && nIdx + 3 < nLen /* four bytes */
        ? ((nPart - 240) << 18) +
          ((aBytes[++nIdx] - 128) << 12) +
          ((aBytes[++nIdx] - 128) << 6) +
          aBytes[++nIdx] -
          128
        : nPart > 223 && nPart < 240 && nIdx + 2 < nLen /* three bytes */
        ? ((nPart - 224) << 12) + ((aBytes[++nIdx] - 128) << 6) + aBytes[++nIdx] - 128
        : nPart > 191 && nPart < 224 && nIdx + 1 < nLen /* two bytes */
        ? ((nPart - 192) << 6) + aBytes[++nIdx] - 128
        : /* nPart < 127 ? */ /* one byte */
          nPart,
    );
  }
  return sView;
}

function strToUTF8Arr(sDOMStr) {
  let aBytes;
  let nChr;
  const nStrLen = sDOMStr.length;
  let nArrLen = 0;

  /* mapping… */
  for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
    nChr = sDOMStr.codePointAt(nMapIdx);

    if (nChr >= 0x10000) {
      nMapIdx++;
    }

    nArrLen +=
      nChr < 0x80
        ? 1
        : nChr < 0x800
        ? 2
        : nChr < 0x10000
        ? 3
        : nChr < 0x200000
        ? 4
        : nChr < 0x4000000
        ? 5
        : 6;
  }

  aBytes = new Uint8Array(nArrLen);

  /* transcription… */
  let nIdx = 0;
  let nChrIdx = 0;
  while (nIdx < nArrLen) {
    nChr = sDOMStr.codePointAt(nChrIdx);
    if (nChr < 128) {
      /* one byte */
      aBytes[nIdx++] = nChr;
    } else if (nChr < 0x800) {
      /* two bytes */
      aBytes[nIdx++] = 192 + (nChr >>> 6);
      aBytes[nIdx++] = 128 + (nChr & 63);
    } else if (nChr < 0x10000) {
      /* three bytes */
      aBytes[nIdx++] = 224 + (nChr >>> 12);
      aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
      aBytes[nIdx++] = 128 + (nChr & 63);
    } else if (nChr < 0x200000) {
      /* four bytes */
      aBytes[nIdx++] = 240 + (nChr >>> 18);
      aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
      aBytes[nIdx++] = 128 + (nChr & 63);
      nChrIdx++;
    } else if (nChr < 0x4000000) {
      /* five bytes */
      aBytes[nIdx++] = 248 + (nChr >>> 24);
      aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
      aBytes[nIdx++] = 128 + (nChr & 63);
      nChrIdx++;
    } /* if (nChr <= 0x7fffffff) */ else {
      /* six bytes */
      aBytes[nIdx++] = 252 + (nChr >>> 30);
      aBytes[nIdx++] = 128 + ((nChr >>> 24) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
      aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
      aBytes[nIdx++] = 128 + (nChr & 63);
      nChrIdx++;
    }
    nChrIdx++;
  }

  return aBytes;
}

// TESTIN

// const sMyInput = 'Тестовая строка';

// const aMyUTF8Input = strToUTF8Arr(sMyInput);

// const sMyBase64 = base64EncArr(aMyUTF8Input);

// alert(sMyBase64);

// const aMyUTF8Output = base64DecToArr(sMyBase64);

// const sMyOutput = UTF8ArrToStr(aMyUTF8Output);

// alert(sMyOutput);
