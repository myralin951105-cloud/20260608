let capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  imageMode(CENTER);
}

function draw() {
  background('#e7c6ff');

  push();
  // 將原點移動到畫布中心
  translate(width / 2, height / 2);
  // 左右顛倒 (鏡像效果)
  scale(-1, 1);
  // 繪製影像，尺寸為全螢幕寬高各 50%
  image(capture, 0, 0, width * 0.5, height * 0.5);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
