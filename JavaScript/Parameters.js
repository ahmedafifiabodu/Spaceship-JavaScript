let userInput;
let player;
let background;

let hearts;
let maxHearts = 4;
let currentHearts = maxHearts;
let additionalPhotos
let activeHearts = [];

let gameOver = false;
let gameOverText;
let restartButton;
let overlay;

// Store enemy bodies
let enemyBodies = [];
let enemyGroup;
let speedEnemy = -2.0;

let score = 0;
let scoreText;

// Track whether the game is in the start state
let inStartState = true;

let shootCounter = 0; // Counter to keep track of the number of shots
const shootLimit = 5; // Set the maximum number of shots before cooldown
const cooldownTime = 2000; // Set the cooldown time in milliseconds (adjust as needed)
const maxFireRate = 100; // Maximum fire rate for the progress bar
let currentFireRate = maxFireRate; // Current fire rate for the progress bar
let lastShootTime = 0; // Track the time of the last shot
const fireRate = 200; // Set the fire rate in milliseconds (adjust as needed)
let fireRateBar;
//const fireRateAnimations = ['increaseFireRate4', 'increaseFireRate3', 'increaseFireRate2', 'increaseFireRate1', 'increaseFireRate0'];
const fireRateAnimations = ['increaseFireRate0', 'increaseFireRate1', 'increaseFireRate2', 'increaseFireRate3', 'increaseFireRate4'];

let autoUpdateTimer;
let manualUpdate = false;

let cooldownText;

// Variable to keep track of time elapsed
let elapsedTime = 0;

// Collision categories
const collisionCategories = {
    player: 0x0001,
    asteroid: 0x0002,
    weapon: 0x0003,
    bullet: 0x0004,
    heart: 0x0008
};

let equippedMissile = null; // Variable to track the equipped missile
let equippedBigSpace = null; // Variable to track the equipped Big Gun
let equippedWeapon = null;

let missle;
let BigSpace;

let missileGroup;
let BigSpaceGroup;

// Define a variable to store the timer ID
let shootingTimer = null;

//Speed
let speed1 = 0.5;
let speed2 = 1.0;
let speed3 = 1.5;

// Define a global array to store active missiles
let activeMissiles = [];

SHOOTING_DURATION = 30000;