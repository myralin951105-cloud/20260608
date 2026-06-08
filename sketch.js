// --- 全域變數定義 ---
let score = 0;          // 遊戲得分
let objects = [];       // 儲存掉落物的陣列
const netSize = 50;     // 保護網（滑鼠控制範圍）的直徑

function setup() {
  // 建立 640x480 的畫布
  createCanvas(640, 480);
}

function draw() {
  background(220); // 設定背景顏色為淺灰色

  // 1. 產生掉落物邏輯
  // frameCount 是 p5.js 內建變數，記錄從開始到現在跑了多少幀
  // 每 60 幀（大約 1 秒）產生一個新物件
  if (frameCount % 60 === 0) {
    // 隨機決定類型：0 為候鳥，1 為海洋垃圾
    let type = random([0, 1]);
    objects.push(new FallingObject(type));
  }

  // 2. 更新與顯示掉落物（使用倒序迴圈以安全刪除陣列元素）
  for (let i = objects.length - 1; i >= 0; i--) {
    let obj = objects[i];
    obj.move();
    obj.display();

    // 3. 碰撞偵測
    // 使用 dist() 判斷滑鼠（保護網中心）與掉落物的距離
    if (obj.checkCollision(mouseX, mouseY, netSize)) {
      // 接到物件時根據類型增減分數
      if (obj.type === 0) {
        score += 10; // 接到候鳥加 10 分
      } else {
        score -= 5;  // 接到垃圾扣 5 分
      }
      // 移除該物件
      objects.splice(i, 1);
    } 
    // 4. 超出畫面處理
    else if (obj.y > height + obj.size) {
      // 如果物件掉出底部，直接移除
      objects.splice(i, 1);
    }
  }

  // 5. 繪製保護網（滑鼠位置）
  drawNet(mouseX, mouseY);

  // 6. 顯示得分訊息
  displayScore();
}

/**
 * 繪製保護網的視覺化函數
 */
function drawNet(x, y) {
  noFill();
  stroke(50);
  strokeWeight(2);
  // 繪製圓形保護網
  ellipse(x, y, netSize, netSize);
  // 繪製簡單的瞄準線
  line(x - 10, y, x + 10, y);
  line(x, y - 10, x, y + 10);
}

/**
 * 顯示得分顯示在畫面上
 */
function displayScore() {
  fill(0);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text(`目前得分: ${score}`, 20, 20);
}

// --- 物件導向設計：FallingObject 類別 ---
class FallingObject {
  constructor(type) {
    this.type = type; // 0: 候鳥, 1: 海洋垃圾
    this.size = 35;   // 物件大小
    this.x = random(this.size, width - this.size); // 隨機 X 座標
    this.y = -this.size; // 從畫面上方外部開始掉落
    this.speed = random(2, 6); // 隨機掉落速度
  }

  // 物件移動邏輯
  move() {
    this.y += this.speed;
  }

  // 物件顯示邏輯
  display() {
    noStroke();
    if (this.type === 0) {
      fill(46, 204, 113); // 綠色：候鳥
      ellipse(this.x, this.y, this.size);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("鳥", this.x, this.y);
    } else {
      fill(231, 76, 60);  // 紅色：海洋垃圾
      ellipse(this.x, this.y, this.size);
    }
  }

  // 碰撞偵測（判斷是否進入保護網）
  checkCollision(netX, netY, netD) {
    let d = dist(this.x, this.y, netX, netY);
    return d < (this.size / 2 + netD / 2);
  }
}
