```ts
const str = "A man, a plan, a canal: Panama"
var isPalindrome = function (str) {
  let s = str.replace(/[\W_]+/g, "").toLowerCase()
  console.log(s)
  for (let i = 0; i < s.length; i++) {
    const aChar = s[i]
    const bChar = s[s.length - 1 - i]
    if (aChar !== bChar) return false
  }
  return true
}

console.log(isPalindrome(str))
```
