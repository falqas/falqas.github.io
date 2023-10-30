// Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

// You must write an algorithm with O(log n) runtime complexity.

// Example 1:

// Input: nums = [-1,0,3,5,9,12], target = 9
// Output: 4
// Explanation: 9 exists in nums and its index is 4
// Example 2:

// Input: nums = [-1,0,3,5,9,12], target = 2
// Output: -1
// Explanation: 2 does not exist in nums so return -1

const nums = [-1, 0, 3, 5, 9, 12];
const target = 9;

// Note: a simple .indexOf works fine here, but let's implement our own for the sake of completeness...
var search = function (nums, target) {
    var mid = Math.floor(nums.length / 2);
    // assign l and r (for first iteration it will be entire array)
    // check midpoint of l and r
    // if midpoint = target, return midpoint index
    // if m < target, move l to m position
    // if m > target, move r to m position
    // if m === 0 && m !== target return -1
    var r = nums.length - 1;
    var l = 0;
    while (l <= r) {
        m = Math.floor((r - l) / 2) + l;
        if (nums[m] === target) return m;
        if (nums[m] < target) {
            l = m + 1;
        } else if (nums[m] > target) {
            r = m - 1;
        }
    }
    return -1;
};

console.log(search(nums, target));
