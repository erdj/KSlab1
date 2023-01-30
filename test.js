let nUint24 = 0;

console.log('////////// 1');
// nIdx = 0
// nMod3 = 0
// nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
const nulls = '00000000000000000000000000000000';

const op1 = (16 >>> 0).toString(2);
console.log('16 >>> 0 = ' + getBin(op1));

console.log('24 = ' + getBin((24).toString(2)));

const op2 = ((16 >>> 0) & 24).toString(2);
console.log('(16 >>> 0) & 24 = ' + getBin(op2));

// hello /////////// 01101000 01100101 01101100 01101100 01101111

const op3 = (parseInt(1101000, 2) << ((16 >>> 0) & 24)).toString(2);

console.log('h', getBin('1101000'));
console.log('h << ((16 >>> 0) & 24) = ' + getBin(op3));

nUint24 |= parseInt(1101000, 2) << ((16 >>> 0) & 24);

console.log('nUint24', nUint24.toString(2));

console.log('////////// 2');
// nIdx = 1
// nMod3 = 1

// nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
const op1_1 = (16 >>> 1).toString(2);
console.log('16 >>> 1 = ' + getBin(op1_1));

console.log('24 = ' + getBin((24).toString(2)));

const op2_1 = ((16 >>> 1) & 24).toString(2);
console.log('(16 >>> 1) & 24 = ' + getBin(op2_1));

// hello /////////// 01101000 01100101 01101100 01101100 01101111

const op3_1 = (parseInt(1100101, 2) << ((16 >>> 1) & 24)).toString(2);

console.log('e', getBin('1100101'));
console.log('e << ((16 >>> 1) & 24) = ' + getBin(op3_1));

nUint24 |= parseInt(1100101, 2) << ((16 >>> 1) & 24);

console.log('nUint24', nUint24.toString(2));

console.log('////////// 3');
// nIdx = 2
// nMod3 = 2

// nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
const op1_2 = (16 >>> 2).toString(2);
console.log('16 >>> 2 = ' + getBin(op1_2));

console.log('24 = ' + getBin((24).toString(2)));

const op2_2 = ((16 >>> 2) & 24).toString(2);
console.log('(16 >>> 2) & 24 = ' + getBin(op2_2));

// hello /////////// 01101000 01100101 01101100 01101100 01101111

const op3_2 = (parseInt(1101100, 2) << ((16 >>> 2) & 24)).toString(2);

console.log('l', getBin('1101100'));
console.log('l << ((16 >>> 2) & 24) = ' + getBin(op3_2));

nUint24 |= parseInt(1101100, 2) << ((16 >>> 2) & 24);

console.log('nUint24', nUint24.toString(2));

//////////////// i = 3
console.log('\n third iteration (full 24 bits) \n');

function getBin(op) {
  return nulls.substring(0, nulls.length - op.length) + op;
}
