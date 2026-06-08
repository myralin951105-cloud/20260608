// === 遊戲狀態變數 ===
let gameState = "START"; // START, PLAY, GAME_OVER
let score = 0;
let gameTimer = 30; // 遊戲時間 30 秒
let lastTimeCheck = 0;

// === 玩家與物件變數 ===
let playerX, playerY;
let playerRadius = 40; // 保護網的半徑
let objects = []; // 存放掉落物的陣列

function setup() {
  createCanvas(640, 480);
}

function draw() {
  background(220);

  // 根據不同的遊戲狀態，執行不同的畫面繪製
  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAY") {
    drawPlayScreen();
  } else if (gameState === "GAME_OVER") {
    drawGameOverScreen();
  }
}

// ==========================================
// 1. 遊戲畫面流程控制 (Screens)
// ==========================================

// 【開始畫面】
function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(40);
  textSize(32);
  text("淡水河口：關渡候鳥守護戰", width / 2, height / 2 - 40);
  
  textSize(16);
  text("拯救候鳥加分，接到海洋垃圾會扣分！", width / 2, height / 2 + 10);
  text("點擊滑鼠開始遊戲", width / 2, height / 2 + 50);
}

// 【進行中畫面】
function drawPlayScreen() {
  // 目前使用滑鼠代替，未來升級體感時，只需把這兩個變數換成 ml5 的食指座標
  playerX = mouseX;
  playerY = mouseY;

  // 1. 倒數計時邏輯 (每1000毫秒減1秒)
  if (millis() - lastTimeCheck >= 1000) {
    gameTimer--;
    lastTimeCheck = millis();
  }
  if (gameTimer <= 0) {
    gameState = "GAME_OVER";
  }

  // 2. 隨機產生掉落物 (每 45 幀產生一個，約 0.75 秒)
  if (frameCount % 45 === 0) {
    objects.push(new FallingObject());
  }

  // 3. 倒序更新與繪製所有掉落物（倒序可避免陣列刪除時的閃爍 Bug）
  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].fall();
    objects[i].display();

    // 碰撞偵測：計算保護網中心與掉落物中心的距離
    let d = dist(playerX, playerY, objects[i].x, objects[i].y);
    if (d < playerRadius + objects[i].radius) {
      // 依據物件種類觸發不同事件
      if (objects[i].type === "bird") {
        score += 10; // 拯救候鳥加分
      } else {
        score -= 5;  // 接到垃圾扣分
      }
      objects.splice(i, 1); // 將被接到的物件從陣列移除
    } 
    // 超出畫布邊界就自動移除，釋放記憶體
    else if (objects[i].y > height + 20) {
      objects.splice(i, 1);
    }
  }

  // 4. 繪製玩家的「保護網」
  noStroke();
  fill(0, 150, 255, 150); // 半透明藍色
  ellipse(playerX, playerY, playerRadius * 2);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("保護網", playerX, playerY);

  // 5. 顯示遊戲 UI 資訊
  drawUI();
}

// 【結束畫面】
function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  fill(200, 50, 50);
  textSize(40);
  text("遊戲結束", width / 2, height / 2 - 40);
  
  fill(40);
  textSize(24);
  text("總得分: " + score + " 分", width / 2, height / 2 + 10);
  
  textSize(16);
  text("點擊滑鼠重新挑戰", width / 2, height / 2 + 60);
}

// 【顯示 UI 資訊】
function drawUI() {
  fill(50);
  rect(0, 0, width, 50); // 上方資訊列背景
  
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("得分: " + score, 20, 25);
  
  textAlign(RIGHT, CENTER);
  text("剩餘時間: " + gameTimer + " 秒", width - 20, 25);
}

// ==========================================
// 2. 遊戲互動事件 (Events)
// ==========================================
function mousePressed() {
  if (gameState === "START") {
    // 初始化遊戲數值並開始
    score = 0;
    gameTimer = 30;
    objects = [];
    lastTimeCheck = millis();
    gameState = "PLAY";
  } else if (gameState === "GAME_OVER") {
    // 返回開始畫面
    gameState = "START";
  }
}

// ==========================================
// 3. 物件導向設計 (Class - 掉落物)
// ==========================================
class FallingObject {
  constructor() {
    this.x = random(30, width - 30); // 隨機 X 軸起點
    this.y = -20;                    // 從畫布上方外面出發
    this.radius = 15;                // 物件大小半徑
    this.speed = random(2, 5);       // 隨機掉落速度
    
    // 隨機決定是候鳥還是垃圾 (70% 候鳥, 30% 垃圾)
    if (random(1) < 0.7) {
      this.type = "bird";
    } else {
      this.type = "trash";
    }
  }

  // 物理移動
  fall() {
    this.y += this.speed;
  }

  // 繪製外觀（目前用顏色暫代，未來可更換成 image()）
  display() {
    noStroke();
    if (this.type === "bird") {
      fill(50, 200, 100); // 綠色圓形代表候鳥
      ellipse(this.x, this.y, this.radius * 2);
    } else {
      fill(220, 50, 50);  // 紅色圓形代表垃圾
      rectMode(CENTER);
      rect(this.x, this.y, this.radius * 2, this.radius * 2); // 正方形代表垃圾
    }
  }
}
