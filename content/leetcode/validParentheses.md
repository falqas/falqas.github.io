const validStr = "{()([]){}}";
const invalidStr = "(]";

function isValid(s) {
    let stack = [];
    // push each open paren to stack
    // if closed paren:
    //   pop last paren. if popped matches current, keep going. if doesn't match, return false
    // [{]}
    // if arr is empty at end, return true
    let parens = {
        "(": ")",
        "{": "}",
        "[": "]",
    };
    let open = Object.keys(parens);
    // let closed = Object.values(parens);
    for (let i = 0; i < s.length; i++) {
        let curr = s[i];
        if (open.includes(curr)) {
            stack.push(curr);
        } else {
            const lastOpen = stack.pop();
            if (parens[lastOpen] !== curr) return false;
        }
    }
    if (stack.length === 0) return true;
    return false;
}
console.log(isValid(validStr));
console.log(isValid(invalidStr));
