let handPose;
let video;
let hands = [];
let fruits = [];
let score = 0;
let startTime;
let gameDuration = 30; // 遊戲時間 30 秒
let gameOver = false;

/**
 * 水果類別
 */
class Fruit {
  constructor() {
    this.x = random(50, width - 50);
    this.y = height;
    this.speedY = random(-15, -22); // 向上噴發的速度
    this.speedX = random(-3, 3);
    this.size = 60;
    this.isCut = false;
    this.color = color(random(255), random(255), random(255));
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.speedY += 0.4; // 重力效果
  }

  display() {
    fill(this.color);
    noStroke();
    // 如果被切開，畫兩個半圓（視覺效果）
    if (this.isCut) {
      arc(this.x - 10, this.y, this.size, this.size, PI, TWO_PI);
      arc(this.x + 10, this.y + 10, this.size, this.size, 0, PI);
    } else {
      ellipse(this.x, this.y, this.size);
    }
  }
}

function preload() {
  // 載入手勢辨識模型
  handPose = ml5.handpose();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定攝影機擷取
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide(); // 隱藏預設的 HTML 影像元件
  
  // 監聽手勢偵測結果
  handPose.on("predict", results => {
    hands = results;
  });
  
  startTime = millis();
}

function draw() {
  background(0); // 黑色背景

  if (gameOver) {
    displayGameOver();
    return;
  }

  // 計算剩餘時間
  let elapsed = (millis() - startTime) / 1000;
  if (elapsed >= gameDuration) {
    gameOver = true;
  }

  // 1. 繪製攝影機影像 (水平翻轉且填滿全螢幕)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // 2. 產生水果
  if (frameCount % 40 === 0) {
    fruits.push(new Fruit());
  }

  // 3. 更新與偵測水果狀態
  for (let i = fruits.length - 1; i >= 0; i--) {
    fruits[i].update();
    fruits[i].display();

    // 偵測食指位置
    if (hands.length > 0) {
      for (let hand of hands) {
        // indexFinger[3] 通常是食指指尖
        let indexTip = hand.landmarks[8]; 
        
        // 將偵測到的座標映射到畫布大小，並處理鏡像翻轉
        let fingerX = map(indexTip[0], 0, video.width, width, 0);
        let fingerY = map(indexTip[1], 0, video.height, 0, height);

        // 畫出準星
        fill(255, 0, 0);
        noStroke();
        ellipse(fingerX, fingerY, 20);

        // 碰撞偵測：食指與水果的距離
        let d = dist(fingerX, fingerY, fruits[i].x, fruits[i].y);
        if (d < fruits[i].size / 2 && !fruits[i].isCut) {
          fruits[i].isCut = true;
          score++;
        }
      }
    }

    // 移除掉出畫面或已經切開一段時間的水果
    if (fruits[i].y > height + 100) {
      fruits.splice(i, 1);
    }
  }

  // 4. 顯示 UI
  drawUI(elapsed);
}

function drawUI(elapsed) {
  fill(0, 150);
  noStroke();
  rect(20, 20, 200, 100, 10);
  
  fill(255); 
  textSize(32);
  textAlign(LEFT, TOP);
  text(`得分: ${score}`, 30, 30);
  text(`時間: ${max(0, floor(gameDuration - elapsed))}s`, 30, 75);
}

function displayGameOver() {
  textAlign(CENTER, CENTER);
  fill(255); 
  textSize(64);
  text("遊戲結束", width / 2, height / 2 - 20);
  textSize(32);
  text(`您的最終得分: ${score}`, width / 2, height / 2 + 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
