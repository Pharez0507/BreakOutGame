const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let paddleWidth, paddleHeight, paddleSpeed, paddleX, ballRadius, x, y, dx, dy;
let brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
let rightPressed = false;
let leftPressed = false;
let bricks = [];
let score = 0;
let lives = 3;
let bricksHit = 0;
let ballSpeed = 2;
let powerUpDropped = false;
let powerUpX, powerUpY, powerUpType;

const levels = [
    { brickRowCount: 3, brickColumnCount: 8, brickSpeedMultiplier: 1 },
    { brickRowCount: 4, brickColumnCount: 10, brickSpeedMultiplier: 1.2 },
    { brickRowCount: 5, brickColumnCount: 12, brickSpeedMultiplier: 1.5 },
    { brickRowCount: 6, brickColumnCount: 14, brickSpeedMultiplier: 1.8 },
    { brickRowCount: 7, brickColumnCount: 16, brickSpeedMultiplier: 2 }
];

let currentLevel = 0;
let brickRowCount = levels[currentLevel].brickRowCount;
let brickColumnCount = levels[currentLevel].brickColumnCount;
let transitionTime = 3000;
let transitioning = false;
let totalBricksHit = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    updateGameElements();
    draw();
}

function updateGameElements() {
    paddleWidth = canvas.width * 0.1;
    paddleHeight = canvas.height * 0.02;
    paddleSpeed = canvas.width * 0.02;
    paddleX = (canvas.width - paddleWidth) / 2;
    ballRadius = canvas.width * 0.015;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = ballSpeed;
    dy = -ballSpeed;
    brickPadding = canvas.width * 0.01;
    brickOffsetTop = canvas.height * 0.05;
    brickOffsetLeft = canvas.width * 0.03;
    brickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
    brickHeight = canvas.height * 0.04;
    initializeBricks();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initializeBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
            bricks[c][r] = { x: 0, y: 0, status: 1, color: color, hit: false };
        }
    }
}

function addNewRow() {
    brickRowCount++;
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c].unshift({ x: 0, y: 0, status: 1, color: `hsl(${Math.random() * 360}, 70%, 50%)`, hit: false });
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
                gradient.addColorStop(0, bricks[c][r].color);
                gradient.addColorStop(1, "#000000");
                ctx.fillStyle = gradient;
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.closePath();
                ctx.shadowBlur = 0;
            } else if (bricks[c][r].hit) {
                animateBrickHit(bricks[c][r], c, r);
            }
        }
    }
}

function animateBrickHit(brick, c, r) {
    if (brick.scale > 0) {
        brick.scale -= 0.05;
        ctx.save();
        ctx.translate(brick.x + brickWidth / 2, brick.y + brickHeight / 2);
        ctx.scale(brick.scale, brick.scale);
        ctx.translate(-(brick.x + brickWidth / 2), -(brick.y + brickHeight / 2));
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
        ctx.fillStyle = brick.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    } else {
        bricks[c][r].hit = false;
    }
}

function drawPowerUp(type, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = type.color;
    ctx.fill();
    ctx.closePath();
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    b.hit = true;
                    b.scale = 1;
                    score++;
                    bricksHit++;
                    totalBricksHit++;
                    if (totalBricksHit >= 700) {
                        alert("Congratulations! You've hit 700 bricks!");
                        document.location.reload();
                    }
                    if (score % 5 === 0 && !powerUpDropped) {
                        dropPowerUp();
                    }
                    if (bricksHit % 10 === 0) {
                        ballSpeed += 0.5;
                        dx = dx > 0 ? ballSpeed : -ballSpeed;
                        dy = dy > 0 ? ballSpeed : -ballSpeed;
                    }
                    if (bricksHit % brickColumnCount === 0) {
                        addNewRow();
                    }
                }
            }
        }
    }
}

function dropPowerUp() {
    const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
    powerUpX = Math.random() * (canvas.width - 20) + 10;
    powerUpY = canvas.height / 2;
    powerUpType = randomPowerUp;
    powerUpDropped = true;
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    collisionDetection();

    if (powerUpDropped) {
        drawPowerUp(powerUpType, powerUpX, powerUpY);
        powerUpY += 1;

        if (powerUpY > canvas.height) {
            powerUpDropped = false;
        }

        if (
            powerUpY + 10 > canvas.height - paddleHeight &&
            powerUpX > paddleX &&
            powerUpX < paddleX + paddleWidth
        ) {
            activatePowerUp(powerUpType);
            powerUpDropped = false;
        }
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                alert("Game Over");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = ballSpeed;
                dy = -ballSpeed;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

function activatePowerUp(powerUp) {
    switch (powerUp.type) {
        case "extendPaddle":
            paddleWidth += 50;
            setTimeout(() => {
                paddleWidth -= 50;
            }, 10000);
            break;
        case "multiplyBall":
            dx *= 1.5;
            dy *= 1.5;
            setTimeout(() => {
                dx /= 1.5;
                dy /= 1.5;
            }, 10000);
            break;
        case "extraBalls":
            // Implement extra balls logic if needed
            break;
        case "extraLife":
            lives++;
            break;
        default:
            break;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

function handleTouchStart(e) {
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    if (touchX > paddleX && touchX < paddleX + paddleWidth) {
        paddleX = touchX - paddleWidth / 2;
    }
    e.preventDefault();
}

function handleTouchMove(e) {
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    paddleX = touchX - paddleWidth / 2;
    e.preventDefault();
}

function handleTouchEnd(e) {
    e.preventDefault();
}

function startNextLevel() {
    if (currentLevel < levels.length - 1) {
        currentLevel++;
        resetGame();
        transitioning = true;
        setTimeout(() => {
            transitioning = false;
        }, transitionTime);
    } else {
        alert("Congratulations! You completed all levels.");
        document.location.reload();
    }
}

function resetGame() {
    brickRowCount = levels[currentLevel].brickRowCount;
    brickColumnCount = levels[currentLevel].brickColumnCount;
    ballSpeed *= levels[currentLevel].brickSpeedMultiplier;
    initializeBricks();
    score = 0;
    bricksHit = 0;
    lives = 3;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = ballSpeed;
    dy = -ballSpeed;
    paddleX = (canvas.width - paddleWidth) / 2;
}

draw();
