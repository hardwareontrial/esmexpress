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
  // const diffArray1 = array1.filter(element1 => !array2.includes(element1))
  // const diffArray2 = array2.filter(element2 => !array1.includes(element2))
  // return [...diffArray1, ...diffArray2]
}