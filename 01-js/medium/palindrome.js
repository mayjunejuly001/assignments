/*
  Implement a function `isPalindrome` which takes a string as argument and returns true/false as its result.
  Note: the input string is case-insensitive which means 'Nan' is a palindrom as 'N' and 'n' are considered case-insensitive.
*/

function isPalindrome(str) {
  let newStr = str.toLowerCase().replaceAll(/[^a-z]/g, '')
  let newStr1 = newStr.split('').reverse().join('')

  if (newStr == newStr1) {
    return true
  } else return false
}

module.exports = isPalindrome
