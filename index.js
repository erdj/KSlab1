const fileInput$ = document.querySelector('.file-selector');
fileInput$.addEventListener('change', () => {
  const textFile = readFile(fileInput$);

  // коли файл завантажено
  textFile.onload = function () {
    // отримуємо символ із інпута
    const symbol = document.querySelector('.symbol-selector').value;

    // присвоюємо текст з файлу у змінну
    const text = textFile.result;

    // якщо довжина символа дорівнює 1, то рахуємо його вірогідність появи у тексті
    if (symbol.length === 1) {
      // ділемо кількість цього символу у тексті на кількість всіх символів у тексті
      const symbolProbability = getSymbolCount(symbol, text) / text.length;
      console.log(
        `probability of " ${symbol} " in text ${fileInput$.files[0].name} is`,
        symbolProbability,
      );
    }

    // щоб знайти ентропію, використаємо функцію
    const textEntrophy = findEntropy(text);
    console.log('text entrophy is', textEntrophy);

    // знайдемо кількість інформації тексту
    const ammountOfInformationInText = textEntrophy * text.length;
    console.log('the ammount of the text information (bytes)', ammountOfInformationInText / 8);
    console.log('the ammount of the text information (bits)', ammountOfInformationInText);

    console.log(
      'file size / ammount of information:',
      `${fileInput$.files[0].size} / ${ammountOfInformationInText / 8} =`,
      fileInput$.files[0].size / (ammountOfInformationInText / 8),
    );

    ////////////////

    // Для кодування тексту у base-64 формат, було використаное функції:

    // за допомогою цієї функції, отримуємо масив з закодованим у UTF-8 текст
    const aMyUTF8Input = strToUTF8Arr(text);
    // за допомогою цієї функції, отримаємо base-64 закодований текст
    const sMyBase64 = base64EncArr(aMyUTF8Input);

    const aMyUTF8Output = base64DecToArr(sMyBase64);
    const sMyOutput = UTF8ArrToStr(aMyUTF8Output);

    // виводжу закодований base-64 текст
    console.log('\n %c encoded to base64\n', 'background: #222; color: #ee1120');
    console.log(sMyBase64, '\n');
    console.log('\n %c decoded from base64\n', 'background: #222; color: #ee1120');
    console.log(sMyOutput, '\n');

    // розрахунок ентропії base-64 тексту
    const base64TextEntrophy = findEntropy(sMyBase64);
    console.log('\nbase64 entrophy', base64TextEntrophy);

    // розрахунок кількості інформації base-64 тексту
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
  // за допомогою спеціального методу строки split, розбиваємо цю строку на масив, підстрок, які відокремлені цим симвооло. Після цього просто вертаємо довжину цього масива, так як скільки елемментів в масиві, стільки там і цього символу
  return text.toLowerCase().split(symb.toLowerCase()).length - 1;
}

function findEntropy(text) {
  let frequency = {};
  let entropy = 0;
  let len = text.length;

  for (let i = 0; i < len; i++) {
    let character = text.charAt(i);
    if (!(character in frequency)) {
      frequency[character] = 0;
    }
    frequency[character]++;
  }

  for (let char in frequency) {
    let frequencyProb = frequency[char] / len;
    entropy -= frequencyProb * Math.log2(frequencyProb);
  }

  // console.log(frequency);
  return entropy;
}

///////// АЛГОРИТМ КОДУВАННЯ ТА ДЕОКОДУВАННЯ

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

// функція предствалення коду символів base-64 за таблицею utf-8
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

// aBytes = UTF-8 масив
function base64EncArr(aBytes) {
  // Логіка кодування base-64 полягає в тому, що використовується 6 біт для позначення символу

  // nMod3 це змінна, яка вкузує на остачу від третьої ітерації, вона потрібна, щою розуміти коли було пройдено 3 елементи масива (3 байти), бо щоб отримати base-64 код, треба взяти 3 байти (24 біт), та розбити їх по 6 (вийде 4 елементи)
  let nMod3 = 2;

  // sB64Enc - вихідний результат
  let sB64Enc = '';

  // nLen - довжина utf8 масива
  const nLen = aBytes.length;

  // nUint24 - змінна 24 біт
  let nUint24 = 0;
  for (let nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;

    // заповнюємо 24 біт
    nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
    // або 24 біти заповнені, або кінцева ітеранія
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCodePoint(
        // перші 6 біт
        // отримаємо номер символу base-64 у вигляды номера символа utf-8 за допомогою функції uint6ToB64, це потрібно для вбудованої функції String.fromCodePoint, яка приймає номер символу (який підтримую Unicode) та повертає самй цей символ.
        uint6ToB64((nUint24 >>> 18) & 63),
        // другі 6 біт
        uint6ToB64((nUint24 >>> 12) & 63),
        // треті 6 біт
        uint6ToB64((nUint24 >>> 6) & 63),
        // четверті 6 біт
        uint6ToB64(nUint24 & 63),
      );
      // очищаємо наші 24 біт
      nUint24 = 0;
    }
  }
  /*
  - якщо довжина вихідного блоку була кратна 3, то він закодується націло і знаків "=" не буде
  - якщо довжина вихідного блоку мала залишок 1 від розподілу на 3, то він закодується в 2 байти (6 біт + 2 біти), і щоб підсумковий код був довжиною кратен 4, буде в кінці дописано "=="
  - якщо довжина вихідного блоку мала залишок 2 від розподілу на 3, то він закодується в 3 байти (6 біт + 6 біт + 4 біта), і щоб підсумковий код був довжиною кратен 4, буде в кінці дописано "=".
  
  Відкидати хвости небажано, т.к. Ви не можете бути впевнені, що алгоритм декодування прийме останній не кратний 4 блок. */

  return (
    sB64Enc.substring(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==')
  );
}

/* UTF-8 array to JS string and JS string to UTF-8 array */

function UTF8ArrToStr(aBytes) {
  let sView = '';
  let nPart;
  const nLen = aBytes.length;
  for (let nIdx = 0; nIdx < nLen; nIdx++) {
    nPart = aBytes[nIdx];
    sView += String.fromCodePoint(
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen /* six bytes */
        ? (nPart - 252) * 1073741824 +
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
  // масив (8біт) UTF-8 тексту
  let aBytes;

  // символ
  let nChr;

  // довжина текста
  const nStrLen = sDOMStr.length;

  // довжина масива aBytes, яка буде рахуватись
  let nArrLen = 0;

  // Алгоритм кодування UTF-8 стандартизований в RFC 3629 і складається з 3 етапів, але буде використано тільки 2 (цього буде достатньо):

  for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
    // за допомогою методу строки codePointAt отримаємо Unicode код символу
    nChr = sDOMStr.codePointAt(nMapIdx);

    // ...
    if (nChr >= 0x10000) {
      nMapIdx++;
    }

    /* 
    1. Визначити кількість октетів (байтів), необхідних для кодування знака. Номер знака береться з зразка Юнікоду.
    */

    // Діапазон номерів символів ||| Необхідна кількість октетів
    //         00000000-0000007F ||| 1
    //         00000080-000007FF ||| 2
    //         00000800-0000FFFF ||| 3
    //         00010000-0010FFFF ||| 4

    nArrLen +=
      nChr < 0x80 // -128 -- 128 Повнісьтю співпадають коди
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

  // an array of 8-bit unsigned integers
  aBytes = new Uint8Array(nArrLen);

  // 2. Встановити старші біти першого октету відповідно до необхідної кількості октетів, визначеної на першому етапі:

  // 0xxxxxxx — якщо для кодування буде потрібно один октет;
  // 110xxxxx — якщо для кодування потрібно два октети;
  // 1110xxxx — якщо для кодування потрібно три октети;
  // 11110xxx — якщо для кодування потрібно чотири октети.

  // Количество октетов	  Значащих бит	  Шаблон
  // 1	                  7	              0xxxxxxx
  // 2	                  11	            110xxxxx 10xxxxxx
  // 3	                  16	            1110xxxx 10xxxxxx 10xxxxxx
  // 4	                  21	            11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

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
