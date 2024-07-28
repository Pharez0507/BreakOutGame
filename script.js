// Initialize EmailJS
(function() {
    emailjs.init("LGfsXEx6gfa_SuDQy");
})();

function sendGameSummary() {
    const email = emailInput.value;
    const gameDuration = Math.round((Date.now() - gameStartTime) / 60000);
    const emailParams = {
        to_email: email,
        score: score,
        bricks_broken: score,  // Assuming each score point equals one brick broken
        powerups_collected: 0,  // No power-ups in this version
        game_duration: gameDuration,
        level: level
    };

    emailjs.send('service_v86m3qj', 'template_7a5nn1d', emailParams)
        .then(response => {
            console.log('Email sent successfully!', response.status, response.text);
        }, error => {
            console.log('Failed to send email.', error);
        });
}

// The rest of your game code remains the same
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const messageDiv = document.getElementById("message");
const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const emailSubmitBtn = document.getElementById("emailSubmitBtn");
const fullScreenMessageDiv = document.createElement("div");

canvas.width = 800;
canvas.height = 400;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
let score = 0;
let lives = 3;
let level = 1;
let gameStartTime;

let rightPressed = false;
let leftPressed = false;
let gameRunning = false;
let gamePaused = false;

let particles = [];

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initBricks();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchmove", touchMoveHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

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

function touchStartHandler(e) {
    const touch = e.touches[0];
    paddleX = touch.clientX - canvas.offsetLeft - paddleWidth / 2;
}

function touchMoveHandler(e) {
    const touch = e.touches[0];
    paddleX = touch.clientX - canvas.offsetLeft - paddleWidth / 2;
}

function touchEndHandler(e) {
    if (!gameRunning) {
        resetBall();
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
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
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    createParticles(b.x + brickWidth / 2, b.y + brickHeight / 2);
                    if (score % 10 === 0) {
                        addNewRow();
                    }
                }
            }
        }
    }
}

function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    gameRunning = true;
    messageDiv.textContent = "";
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            velocity: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3
            }
        });
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.radius -= 0.05;
        if (p.radius <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });
}

function addNewRow() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c].unshift({ x: 0, y: 0, status: 1 });
        if (bricks[c].length > brickRowCount) {
            bricks[c].pop();
        }
    }
    level++;
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

function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Level: " + level, canvas.width / 2 - 30, 20);
}

function draw() {
    if (!gameRunning || gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawLevel();
    drawParticles();
    collisionDetection();
    updateParticles();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        createParticles(x, y);
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        createParticles(x, y);
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            createParticles(x, canvas.height - ballRadius);
        } else {
            lives--;
            if (lives === 0) {
                gameRunning = false;
                sendGameSummary();
                messageDiv.textContent = "Game Over. Restarting...";
                setTimeout(showRestartPrompt, 3000);  // Show the prompt after 3 seconds
            } else {
                resetBall();
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

function showRestartPrompt() {
    const userWantsFeedback = confirm("Would you like to receive a feedback message?");
    if (userWantsFeedback) {
        sendFeedbackAndShowRestart();
    } else {
        showRestartButton();
    }
}

function sendFeedbackAndShowRestart() {
    fullScreenMessageDiv.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.8); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <p>Your game summary email has been sent!</p>
            <button id="restartGameBtn" style="padding:10px 20px; font-size:16px; cursor:pointer;">Restart Game</button>
        </div>
    `;
    document.body.appendChild(fullScreenMessageDiv);

    document.getElementById("restartGameBtn").addEventListener("click", () => {
        fullScreenMessageDiv.innerHTML = `<p>Restarting in 5 seconds...</p>`;
        setTimeout(restartGame, 5000);
    });
}

function showRestartButton() {
    fullScreenMessageDiv.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.8); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <button id="restartGameBtn" style="padding:10px 20px; font-size:16px; cursor:pointer;">Restart Game</button>
        </div>
    `;
    document.body.appendChild(fullScreenMessageDiv);

    document.getElementById("restartGameBtn").addEventListener("click", () => {
        fullScreenMessageDiv.innerHTML = `<p>Restarting in 5 seconds...</p>`;
        setTimeout(restartGame, 5000);
    });
}

function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    initBricks();
    resetBall();
    gameStartTime = Date.now();
    gamePaused = false;
    messageDiv.textContent = "";
    document.body.removeChild(fullScreenMessageDiv);
    draw();
}

startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        score = 0;
        lives = 3;
        level = 1;
        initBricks();
        resetBall();
        gameStartTime = Date.now();
    }
    gamePaused = false;
    draw();
});

pauseBtn.addEventListener("click", () => {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        draw();
    }
});

emailSubmitBtn.addEventListener("click", () => {
    const email = emailInput.value;
    if (email) {
        emailForm.style.display = "none";
        canvas.style.display = "block";
        document.querySelector(".controls").style.display = "block";
        emailSubmitBtn.disabled = true;
    } else {
        alert("Please enter a valid email address.");
    }
});

// Initial draw
drawBricks();
drawBall();
drawPaddle();
drawScore();
drawLives();
drawLevel();
