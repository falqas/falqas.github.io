```ts
// Example 1:

// Input: prices = [7,1,5,3,6,4]
// Output: 5
// Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
// Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
// Example 2:

// Input: prices = [7,6,4,3,1]
// Output: 0
// Explanation: In this case, no transactions are done and the max profit = 0.

const input = [7, 1, 5, 3, 6, 4]

var maxProfit = function (prices) {
  // set left pointer, right pointer
  // get diff
  // if diff > maxDiff, diff = maxDiff
  // if right < left, left = right, right++
  var l = 0
  var r = 1
  var max = null
  while (r < prices.length) {
    var diff = prices[r] - prices[l]
    if (diff > max) max = diff
    if (prices[r] < prices[l]) l = r
    r++
  }
  return max
}
console.log(maxProfit(input))
```
