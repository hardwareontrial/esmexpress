import db from '@services/orm/index.mjs'

export function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var randomString = ''
  for (var i=0; i<len; i++ ){
    var randomPos = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPos, randomPos +1);
  }
  return randomString;
}

export function slug(text) {
  const lowerCaseText = text.toLowerCase();
  const slug = lowerCaseText.replace(/[^\w\s-]/g, '')
                            .trim()
                            .replace(/\s+/g, '-')
  return slug;
}

export function UCWord(word) {
  const arr = word.split(" ");
  for(var i=0;i<arr.length;i++){
    arr[i] = arr[i].charAt(0).toUpperCase()+arr[i].slice(1);
  }
  const resultWord = arr.join(" ");
  return resultWord;
}

export function combinedDiffArray(array1, array2) {
  const combinedSet = new Set([...array1, ...array2]);
  return Array.from(combinedSet)
}

export async function getNextAutoIncrementValue(tableName) {
  const [result] = await db.DatabaseA.query(`SHOW TABLE STATUS LIKE '${tableName}'`);
  return result[0].Auto_increment;
}

export function acceptingMime() {
  return ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/jpg'];
}

export function acceptingSize(mimetype) {
  if(mimetype === 'application/pdf') {}
  else if(mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 6 *1024*1024
  }
  else if(mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    return 1 *1024*1024
  }
  else {
    return 0 *1024*1024
  }
}

export function normalizedArray(data) {
  if(Array.isArray(data) && data.length === 1 && data[0] === '') { return [] }
  return data;
}