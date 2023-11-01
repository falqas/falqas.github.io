
Creative coding - what a cool concept! 
p5js -
creative coding - opposite tetris (sirtet)
render a bunch of squares and blanks
different colors
trace over shape with mouse
must be 4 contiguous
- click to submit? or just autosubmit?
- 4 points per shape 
- 30 seconds to make most points
- if no moves available, reset board for -10 points
code:
```
const board = []
const size = 50
let score = 0
let selected = []
let hist = {}
function setup() {
  createCanvas(500, 1000);
  // render board
  const cols = 10
  const rows = 20
  for (let y = 0; y < cols; y++) {
    const row = []
    for (let x = 0; x < rows; x++) {
      // 1 or 0
      const fill = Math.floor(Math.random() * 2)
      row.push(fill)
    }
    board.push(row)
  }
  
}

function isContiguous() {
  
}
function isDupe(dupeX,dupeY) {
      selected.forEach(selection => {
      const [x, y] = selection
    
      if (dupeX ===x && dupeY === y) return true
    })
  return false
}
function checkSelections() {
  if (selected.length >= 4) {
    score += 4
    
    // clear selections
    selected.forEach(selection => {
      const [x, y] = selection
      board[y][x] = 0
    })
    
    selected = []
    
  }
}
function isSelected(x, y) {
  for (let i = 0; i < selected.length; i++) {
    const [selectedX, selectedY] = selected[i]
    if (selectedX === x && selectedY === y) return true
  }
  return false
}
function draw() {
  // color board
  background(220);
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      
      if (board[y][x]) {      
        fill('orange')
        if (isSelected(x,y)) {
          fill('gray')
        }
                                 rect(x * 50, y * 50, 50)


                         }


    }
    
  }

  // mouse events
  if (mouseIsPressed) {
    const blockX = Math.floor(mouseX / 50)
    const blockY = Math.floor(mouseY/50)
    if (board[blockY][blockX] === 1 && !isDupe(blockX,blockY)) {
    checkSelections()
      
    selected.push([blockX, blockY])
    }
    console.log('SCORE', score)  
  }
  
}
```

Next goal for site: 
- Less generic design, something more fun
- Change path (/quartz -> base path)