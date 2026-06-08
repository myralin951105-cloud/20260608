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
    if (!this.isCut) {
      fill(this.color);
      noStroke();
      ellipse(this.x, this.y, this.size);
    }
  }
}

function preload() {
  // 載入手勢辨識模型
  handPose = ml5.handPose();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定攝影機擷取
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide(); // 隱藏預設的 HTML 影像元件
  
  // 開始偵測手勢
  handPose.detectStart(video, gotHands);
  
  startTime = millis();
}

function gotHands(results) {
  hands = results;
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
  if (frameCount % 30 === 0) {
    fruits.push(new Fruit());
  }

  // 3. 更新與偵測水果狀態
  for (let i = fruits.length - 1; i >= 0; i--) {
    fruits[i].update();
    fruits[i].display();

    // 偵測食指指尖 (index_finger_tip) 位置
    if (hands.length > 0) {
      for (let hand of hands) {
        let indexTip = hand.index_finger_tip;
        // 將偵測到的座標映射到畫布大小，並處理鏡像翻轉
        let fingerX = map(indexTip.x, 0, video.width, width, 0);
        let fingerY = map(indexTip.y, 0, video.height, 0, height);

        // 碰撞偵測：食指與水果的距離
        let d = dist(fingerX, fingerY, fruits[i].x, fruits[i].y);
        if (d < fruits[i].size / 2 && !fruits[i].isCut) {
          fruits[i].isCut = true;
          score++;
        }
      }
    }

    // 移除掉出畫面或被切碎的水果
    if (fruits[i].y > height + 100 || fruits[i].isCut) {
      fruits.splice(i, 1);
    }
  }

  // 4. 顯示 UI
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
  text("重新整理網頁以再次挑戰", width / 2, height / 2 + 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
}
