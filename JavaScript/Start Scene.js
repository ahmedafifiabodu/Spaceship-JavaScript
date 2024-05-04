////////////////////////////////////// START SCREEN //////////////////////////////////////
let startScene = new Phaser.Scene("Start");

startScene.preload = function () {

    // Load Earth
    this.load.spritesheet('Earth', 'Assets/Pixel Space/Environment Pack/Planets/PNGs/Earth-Like planet.png', {
        frameWidth: 96, frameHeight: 96,
        startFrame: 0, endFrame: 76
    });

    this.load.audio('start', 'Assets/Music/Start.mp3');
};

startScene.create = function () {

    // Create the Earth sprite
    additionalBackground = this.add.sprite(config.width / 2 - 145, config.height / 2 - 200, 'Earth').setOrigin(0, 0).setScale(3);
    additionalBackground.anims.create({
        key: "Earth_Animatoin",
        frames: additionalBackground.anims.generateFrameNumbers(
            "Earth",
            {
                start: 0, end: 76
            }),
        frameRate: 15,
        repeat: -1
    })

    // Play the bullet animation
    additionalBackground.anims.play('Earth_Animatoin', true);

    // Add Welcome Text text
    welcomeText = this.add.text(config.width / 2, config.height / 2 - 250, 'Welcome to Spaceship!\n\nClick "Start Game" to begin.', { fontSize: '24px', fill: '#fff', align: 'center' });
    welcomeText.setOrigin(0.5);

    // Add tutorial text
    welcomeText = this.add.text(config.width / 2, config.height / 2 + 250,
        'Tutorials\n\n1)Left Click to shoot.\n2)Move the cursor to move the player.', { fontSize: '18px', fill: '#fff', align: 'center' });
    welcomeText.setOrigin(0.5);

    // Add any other elements to the start screen (e.g., buttons, title text, etc.)
    const startButton = this.add.text(400, 500, 'Start Game', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    startButton.setInteractive();

    // Set up the pointer over and pointer out events for the hover effect
    startButton.on('pointerover', function () {
        startButton.setStyle({ fill: '#ff0' }); // Change fill color on hover
    });

    startButton.on('pointerout', function () {
        startButton.setStyle({ fill: '#fff' }); // Reset fill color on pointer out
    });

    startButton.on('pointerdown', function () {
        // Start the main game scene when the button is clicked
        this.scene.start("Game");
    }, this);

    startSound = this.sound.add('start', { loop: false });
    startSound.play();

    startSound.on('complete', function () {
        // Set up a delayed callback to start the sound again after 2 seconds
        this.time.delayedCall(400, function () {
            startSound.play();
        }, [], this);
    }, this);
};
////////////////////////////////////// START SCREEN //////////////////////////////////////
