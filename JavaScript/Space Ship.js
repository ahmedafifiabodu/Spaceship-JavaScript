//Creating a Phaser Game Scene
let gameScene = new Phaser.Scene("Game")

gameScene.preload = function () {

    const loadAsset = (key, path) => this.load.image(key, path);

    const loadAssets = (assetList, folder) => {
        assetList.forEach((key, index) => {
            loadAsset(key, `Assets/${folder}/${key}.png`);
        });
    };

    const loadAudio = (audioList) => {
        audioList.forEach(key => {
            this.load.audio(key, `Assets/Music/${key}.mp3`);
        });
    };

    // Background Parallax
    ['parallax1', 'parallax2', 'parallax3'].forEach((key, index) => {
        loadAsset(key, `Assets/Pixel Space/Environment Pack/Backgrounds/PNGs/Condesed/${index + 1}.png`);
    });

    //health hearts
    this.load.image("backgroundHeart", "Assets/Hearts/background.png");
    this.load.image("heart", "Assets/Hearts/heart.png");

    // Health hearts
    loadAsset("backgroundHeart", "Assets/Hearts/background.png");
    loadAsset("heart", "Assets/Hearts/heart.png");

    //Main Player
    this.load.spritesheet("player", "Assets/Pixel Space/Main Ship/Main Ship/Main Ship/Main Ship - Bases/PNGs/allforms.png", {
        frameWidth: 48, frameHeight: 48,
        startFrame: 0, endFrame: 3
    });


    //weapons{missle battery}
    this.load.spritesheet("missiles", "Assets/Pixel Space/Main Ship/Main Ship/Main Ship/Main Ship - Weapons/PNGs/Main Ship - Weapons - Auto Cannon.png",
        {
            frameWidth: 48, frameHeight: 48,
            startFrame: 0, endFrame: 6

        });

    //weapons{Big Space Gun}
    this.load.spritesheet("BigSpaceGun", "Assets/Pixel Space/Main Ship/Main Ship/Main Ship/Main Ship - Weapons/PNGs/Main Ship - Weapons - Big Space Gun.png",
        {
            frameWidth: 48, frameHeight: 48,
            startFrame: 0, endFrame: 11

        });


    //Rocket Shooting
    this.load.spritesheet("playerRocketShooting", "Assets/Pixel Space/Main Ship/Main Ship/Main ship weapons/PNGs/Main ship weapon - Projectile - Auto cannon bullet.png",
        {
            frameWidth: 32, frameHeight: 32,
            startFrame: 0, endFrame: 3
        });

    //Big Space Shooting
    this.load.spritesheet("playerBigSpaceShooting", "Assets/Pixel Space/Main Ship/Main Ship/Main ship weapons/PNGs/Main ship weapon - Projectile - Big Space Gun.png",
        {
            frameWidth: 32, frameHeight: 32,
            startFrame: 0, endFrame: 3
        });

    //Shooting Bar
    this.load.spritesheet("fireRateBar", "Assets/Pixel UI/Fire Rate.png",
        {
            frameWidth: 48, frameHeight: 24,
        });

    // Enemies
    loadAsset("asteroid", "Assets/Pixel Space/Environment Pack/Asteroids/PNGs/Asteroid 01 - Base.png");

    this.load.spritesheet("asteroid2", "Assets/Pixel Space/Environment Pack/Asteroids/PNGs/Asteroid 01 - Explode.png",
        {
            frameWidth: 100, frameHeight: 96,
            startFrame: 1, endFrame: 6
        });

    // Load audio files
    ['collisionSound', 'collisionSoundAsteroid2', 'Heal', 'cooldown', 'gameover', 'collected', 'chargingLaser', 'releaseLaser', 'rocketCharging', 'rocketRelease'].forEach(key => {
        this.load.audio(key, `Assets/Music/${key}.mp3`);
    });

    // Load background sound
    this.load.audio('backgroundSound', 'Assets/Music/spaceship.mp3');
};

gameScene.create = function () {

    if (inStartState) {

        // Create parallax backgrounds
        const createParallax = (key, speed) => {
            const scaleY = this.scale.height / this.textures.get(key).getSourceImage().height;
            return this.add.tileSprite(0, 0, this.scale.width, this.scale.height, key).setOrigin(0, 0).setScale(scaleY);
        };

        ['parallax1', 'parallax2', 'parallax3'].forEach((key, index) => {
            this[`parallax${index + 1}`] = createParallax(key, 0.5 * (index + 1));
        });

        //Player
        player = this.matter.add.sprite(0, 500, "player")
            .setBounce(0.0)
            .setScale(1.2)
            .setScrollFactor(0)
            .setFrictionAir(0.05)
            .setMass(-30)
            .setInteractive();
        ;

        player.setCircle(25, {
            radius: 150,
            isSensor: true, // Set the sensing region as a sensor (no physical interaction, only collision events)
            collisionFilter: {
                category: collisionCategories.asteroid, // Set collision category for the sensing region
                // mask: collisionCategories.player // Set collision mask for the sensing region (collide with the player)
            }
        })
            .setAngle(90)
            .setFixedRotation();

        // Set collision category for the player
        player.setCollisionCategory(collisionCategories.player);

        // Set collision mask for the player (collide with asteroids and hearts)
        player.setCollidesWith([collisionCategories.asteroid, collisionCategories.heart]);

        // Player Animation
        player.anims.create({
            key: 'full_health',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1
        });
        player.anims.create({
            key: 'semi_damaged',
            frames: [{ key: 'player', frame: 1 }],
            frameRate: 1
        });
        player.anims.create({
            key: 'damaged',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 1
        });
        player.anims.create({
            key: 'heavyly_damaged',
            frames: [{ key: 'player', frame: 3 }],
            frameRate: 1
        });

        player.anims.play('full_health', true);


        // Create a fire rate bar sprite
        fireRateBar = this.add.sprite(0, 0, 'fireRateBar');
        fireRateBar.setOrigin(0.5, 1); // Set origin to the bottom center
        fireRateBar.setScale(currentFireRate / maxFireRate, 1);

        for (let i = 0; i < fireRateAnimations.length; i++) {
            this.anims.create({
                key: fireRateAnimations[i],
                frames: this.anims.generateFrameNumbers('fireRateBar', { start: 4 - i, end: 4 }),
                frameRate: 10,
                repeat: 0,
                hideOnComplete: true
            });
        }

        // Call the setupPlayerRocketShootingAnimation function
        setupPlayerRocketShootingAnimation(this);

        missle = this.add.sprite(-100, 0, "missiles")
            .setScale(1.2)
            .setScrollFactor(0)
            .setAngle(90)

        // Missle Animation
        missle.anims.create({
            key: 'firing',
            frames: this.anims.generateFrameNumbers('missiles', { frames: [0, 1, 2, 3, 4, 5, 6] }),
            frameRate: 20
        });
        missle.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('missiles', { frames: 0 }),
            frameRate: 0
        });

        // Call the setupPlayerShootingAnimation function
        setupPlayerBigSpaceGunShootingAnimation(this);

        BigSpace = this.add.sprite(-100, 0, "BigSpaceGun")
            .setScale(1.2)
            .setScrollFactor(0)
            .setAngle(90)

        // Missle Animation
        BigSpace.anims.create({
            key: 'firing',
            frames: this.anims.generateFrameNumbers('BigSpaceGun', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }),
            frameRate: 20
        });
        BigSpace.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('BigSpaceGun', { frames: 0 }),
            frameRate: 0
        });

        // Heart
        additionalPhotos = [];
        hearts = [];
        for (let i = 0; i < maxHearts; i++) {
            let heart = this.add.image(50 + i * 20, 50, "heart").setScrollFactor(0);
            hearts.push(heart);

            // Create an additional photo for each heart
            let additionalPhoto = this.add.image(50 + i * 20, 50, 'backgroundHeart').setScrollFactor(0);
            additionalPhoto.setVisible(false);
            additionalPhotos.push(additionalPhoto);
        }

        // Spawn hearts every 10000 milliseconds
        this.time.addEvent({
            delay: 10000,
            callback: generateRandomHearts,
            callbackScope: this,
            loop: true
        });

        // Create the score text at the top right corner
        scoreText = this.add.text(config.width - 10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        scoreText.setOrigin(1, -1);

        // Create audio instances
        collisionSound = this.sound.add('collisionSound');
        collisionSoundAsteroid2 = this.sound.add('collisionSoundAsteroid2');
        heal_sound = this.sound.add("Heal");

        cooldownSound = this.sound.add('cooldown');
        gameoverSound = this.sound.add('gameover');
        collectSound = this.sound.add('collected');

        rocketCharging = this.sound.add('rocketCharging');
        rocketCharging.rate = 2;
        rocketRelease = this.sound.add('rocketRelease');

        chargingLaser = this.sound.add('chargingLaser');
        chargingLaser.rate = 2;
        releaseLaser = this.sound.add('releaseLaser');

        cooldownText = this.add.text(-100, 0, '', { font: '16px Arial', fill: '#ffffff' });
        cooldownText.setOrigin(0.5, 1);

        // Create background sound instance
        background = this.sound.add('backgroundSound', { loop: true });
        background.play();
        background.setVolume(1);

        // Create an enemy group
        enemyGroup = this.add.group();
        missileGroup = this.add.group();
        BigSpaceGroup = this.add.group();

        // Hide the mouse cursor during gameplay
        this.input.setDefaultCursor('none');

        return;
    }

};

gameScene.update = function (time, delta) {

    if (gameOver) {
        return; // Don't update anything if the game is over
    }

    // Update elapsed time
    elapsedTime += delta;

    // Check if 5 minutes have passed
    if (elapsedTime >= 50000) {
        // Speed up the parallax backgrounds
        speed1 += 0.5;
        speed2 += 1.0;
        speed3 += 1.5;

        speedEnemy -= 2.0;
        // Reset elapsed time
        elapsedTime = 0;
    }

    this.parallax1.tilePositionX += speed1
    this.parallax2.tilePositionX += speed2
    this.parallax3.tilePositionX += speed3

    const pointer = this.input.activePointer;
    player.setPosition(pointer.x, pointer.y);
    // this.matter.world.on('collisionstart', function (event) {
    //     event.pairs.forEach(pair => {
    //         const bodyA = pair.bodyA;
    //         const bodyB = pair.bodyB;

    //         // Check if one of the bodies is the player and the other is a missile
    //         if (
    //             (bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'player' &&
    //                 bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'missiles') ||
    //             (bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'player' &&
    //                 bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'missiles')
    //         ) {
    //             // Play collision sound
    //             collectSound.play();

    //             // Reset equipped missile
    //             //missle.setCollisionCategory(collisionCategories.missile);
    //             BigSpace.setVisible(false);
    //             fireRateBar.setVisible(false);
    //             cooldownText.setVisible(false);
    //             equippedBigSpace = null;

    //             // Equip the missile
    //             equippedMissile = bodyA.gameObject.texture.key === 'missiles' ? bodyA.gameObject : bodyB.gameObject;

    //             // Disable the missile's collisions and make it invisible
    //             equippedMissile.setCollisionCategory(0);
    //             equippedMissile.setVisible(false);

    //             missle.setVisible(true);
    //             fireRateBar.setVisible(true);
    //             cooldownText.setVisible(true);
    //             clearTimeout(shootingTimer);

    //             // Start shooting with playerRocketShooting animation
    //             //player.anims.play('playerRocketShootingAnimation', true);
    //             missle.anims.play('idle', true);

    //             // Set a timer to stop shooting and destroy the missile after 30 seconds
    //             shootingTimer = setTimeout(() => {

    //                 // Stop shooting animation
    //                 player.anims.stop('playerRocketShootingAnimation');

    //                 // Reset equipped missile
    //                 //missle.setCollisionCategory(collisionCategories.missile);
    //                 missle.setVisible(false);
    //                 fireRateBar.setVisible(false);
    //                 cooldownText.setVisible(false);
    //                 equippedMissile = null;

    //             }, 30000);
    //         }

    //         if (
    //             (bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'player' &&
    //                 bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'BigSpaceGun') ||
    //             (bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'player' &&
    //                 bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'BigSpaceGun')
    //         ) {
    //             // Play collision sound
    //             collectSound.play();

    //             // Reset equipped missile
    //             //missle.setCollisionCategory(collisionCategories.missile);
    //             missle.setVisible(false);
    //             fireRateBar.setVisible(false);
    //             cooldownText.setVisible(false);
    //             equippedMissile = null;

    //             // Equip the missile
    //             equippedBigSpace = bodyA.gameObject.texture.key === 'BigSpaceGun' ? bodyA.gameObject : bodyB.gameObject;

    //             // Disable the missile's collisions and make it invisible
    //             equippedBigSpace.setCollisionCategory(0);
    //             equippedBigSpace.setVisible(false);

    //             BigSpace.setVisible(true);
    //             fireRateBar.setVisible(true);
    //             cooldownText.setVisible(true);
    //             clearTimeout(shootingTimer);

    //             // Start shooting with playerRocketShooting animation
    //             //player.anims.play('playerRocketShootingAnimation', true);
    //             BigSpace.anims.play('idle', true);

    //             // Set a timer to stop shooting and destroy the missile after 30 seconds
    //             shootingTimer = setTimeout(() => {

    //                 player.anims.stop('playerBigSpaceShootingAnimation');

    //                 // Reset equipped missile
    //                 //missle.setCollisionCategory(collisionCategories.missile);
    //                 missle.setVisible(false);
    //                 fireRateBar.setVisible(false);
    //                 cooldownText.setVisible(false);
    //                 equippedMissile = null;

    //             }, 30000);
    //         }
    //     });
    // });

    this.matter.world.on('collisionstart', function (event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Check collision between player and missile or BigSpaceGun
            checkPlayerCollision(bodyA, bodyB);
            checkPlayerCollision(bodyB, bodyA);
        });
    });

    // Check if enough time has passed since the last shot for automatic update
    if (!gameOver && (this.time.now - lastShootTime) > 2000) {
        shootCounter = 0;
        currentFireRate = maxFireRate;

        // Calculate the frame index for the automatic update
        const frameIndex = shootCounter;
        fireRateBar.setFrame(frameIndex);

        updateFireRateBar();
    }

    if (equippedMissile || equippedBigSpace) {

        fireRateBar.x = pointer.x;
        fireRateBar.y = pointer.y - 30;

        cooldownText.x = pointer.x;
        cooldownText.y = pointer.y - 60;

        if (equippedMissile) {

            missle.x = pointer.x;
            missle.y = pointer.y;
        }

        if (equippedBigSpace) {

            BigSpace.x = pointer.x;
            BigSpace.y = pointer.y;
        }

        this.input.on('pointerdown', function (pointer) {
            if (!gameOver && pointer.leftButtonDown() && (this.time.now - lastShootTime) > fireRate) {
                if ((this.time.now - lastShootTime) > 2000) {
                    shootCounter = 0;
                    currentFireRate = maxFireRate;
                }

                if (shootCounter < shootLimit) {

                    if (equippedMissile) {
                        rocketCharging.play()
                        missle.anims.play('firing', true);
                        missle.once('animationcomplete-firing', function () {
                            rocketRelease.play();
                            shootBullet(player.x, player.y, this);
                        }, this);
                    }

                    if (equippedBigSpace) {
                        chargingLaser.play();
                        BigSpace.anims.play('firing', true);
                        BigSpace.once('animationcomplete-firing', function () {
                            releaseLaser.play();
                            shootBullet(player.x, player.y, this);
                        }, this);
                    }

                    spawnBulletAndHandleShootLogic(this);

                } else if (shootCounter >= shootLimit && (this.time.now - lastShootTime) > cooldownTime) {
                    shootCounter = 0;
                    currentFireRate -= 5;
                    if (currentFireRate < 0) {
                        currentFireRate = 0;
                    }
                }
            }
            updateFireRateBar();
        }, this);
    }

    // Check for collisions between player and asteroid1
    this.matter.world.on('collisionstart', function (event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Check if one of the bodies is the player and the other is an asteroid
            if (
                (bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'player' &&
                    bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'asteroid') ||
                (bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'player' &&
                    bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'asteroid')
            ) {
                // Get the circle bounds of the sensing region

                // Play collision sound
                collisionSound.play();

                // Reduce player's health
                currentHearts--;

                // Update the hearts UI
                updateHearts();

                // Check if the player is out of hearts (game over condition)
                if (currentHearts <= 0) {
                    console.log("Game Over");
                    gameOvers.call(this); // Call the gameOver function
                }

                // Destroy the asteroid
                if (bodyA.gameObject && bodyA.gameObject.texture.key === 'asteroid') bodyA.gameObject.destroy();
                if (bodyB.gameObject && bodyB.gameObject.texture.key === 'asteroid') bodyB.gameObject.destroy();

                // Update player's texture
                updatePlayerTexture();
            }
        });
    });

    // Check for collisions between player and asteroid2
    this.matter.world.on('collisionstart', function (event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Check if one of the bodies is the player and the other is the sensing region of asteroid2
            if (
                (bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'player' &&
                    bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'asteroid2') ||
                (bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'player' &&
                    bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'asteroid2')
            ) {
                // Handle collision events with the sensing region of asteroid2
                // Play the animation frames 2, 3, 4, 5 of asteroid2
                if (
                    bodyB.gameObject &&
                    bodyB.gameObject.anims &&
                    bodyB.gameObject.anims.exists('asteroid2Animation') &&
                    bodyB.gameObject.texture
                ) {
                    const asteroid2Animation = bodyB.gameObject.anims.get('asteroid2Animation');

                    // Play collision sound
                    collisionSoundAsteroid2.play();

                    // Check if the animation is not already playing
                    if (!asteroid2Animation.isPlaying) {

                        // Get the circle bounds of the sensing region
                        const circleBounds = new Phaser.Geom.Circle(
                            bodyB.gameObject.x,  // Use the x position of asteroid2
                            bodyB.gameObject.y,  // Use the y position of asteroid2
                            125  // Use the radius of the circle, It is bigger than the actual range
                        );

                        // Listen for the complete event on the Game Object (not the animation)
                        const completeEvent = 'animationcomplete-asteroid2Animation';
                        const completeCallback = function () {

                            // Animation completed, check if the player is still overlapping
                            const isPlayerOverlapping = Phaser.Geom.Intersects.CircleToRectangle(
                                circleBounds,
                                bodyA.gameObject.getBounds()
                            );

                            if (isPlayerOverlapping) {

                                // Player is still overlapping with asteroid2 after the animation, reduce player's health
                                currentHearts--;

                                // Update the hearts UI
                                updateHearts();

                                // Update player's texture
                                updatePlayerTexture();
                            }

                            // Destroy the asteroid
                            if (bodyB.gameObject && bodyB.gameObject.texture.key === 'asteroid2') bodyB.gameObject.destroy();

                            // Remove the event listener to ensure it only triggers once
                            bodyB.gameObject.off(completeEvent, completeCallback); //There is an error but it made the function works x-)
                        };

                        // Listen for the complete event on the Game Object (not the animation)
                        bodyB.gameObject.once(completeEvent, completeCallback);

                        // Play frames 2, 3, 4, 5 of the animation
                        bodyB.gameObject.anims.play('asteroid2Animation', true);

                    }
                }

                // Check if the player is out of hearts (game over condition)
                if (currentHearts <= 0) {
                    console.log("Game Over");
                    gameOvers.call(this); // Call the gameOver function
                }
            }
        });
    });

    // Check for collisions between bullets and Enemies
    this.matter.world.on('collisionstart', function (event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Check if both bodies have a gameObject property
            if (bodyA.gameObject && bodyB.gameObject) {
                // Check if one of the bodies is a bullet and the other is an asteroid
                const isBulletA = isBullet(bodyA);
                const isBulletB = isBullet(bodyB);
                const isAsteroidA = isAsteroid(bodyA);
                const isAsteroidB = isAsteroid(bodyB);

                if (isBulletA && isAsteroidB || isBulletB && isAsteroidA) {
                    handleBulletAsteroidCollision(bodyA, bodyB);
                }
            }
        });
    });

    // Check for collisions between player and hearts
    this.matter.world.on('collisionstart', function (event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Check if one of the bodies is the player and the other is a heart
            if (
                (bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'player' &&
                    bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'heart') ||
                (bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key === 'player' &&
                    bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key === 'heart')
            ) {
                // Find the heart object in the activeHearts array
                const activeHeart = activeHearts.find(item => item.heart.body === bodyA || item.heart.body === bodyB);

                heal_sound.setVolume(50);
                heal_sound.play();

                // Check if the heart is still active
                if (activeHeart) {

                    // Stop and destroy the tween
                    activeHeart.tween.stop();
                    activeHeart.tween.destroy();

                    // Destroy the heart
                    activeHeart.heart.destroy();

                    // Remove the heart from the activeHearts array
                    activeHearts = activeHearts.filter(item => item !== activeHeart);

                    // Increase player's hearts
                    currentHearts++;
                    if (currentHearts > maxHearts) {
                        currentHearts = maxHearts;
                    }

                    // Update the hearts UI
                    updateHearts();

                    // Update player's texture
                    updatePlayerTexture();
                }
            }
        });
    });

    // Check if any enemy has gone out of bounds from the left side
    const worldBounds = this.matter.world.bounds;

    // Ensure enemyGroup is defined before accessing bodies
    if (enemyGroup && enemyGroup.bodies) {
        enemyGroup.bodies.forEach(body => {
            if (body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'asteroid') {
                if (body.bounds.right < worldBounds.left) {
                    // Destroy the enemy if it has gone out of bounds
                    body.gameObject.destroy();
                }
            }

            if (body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'asteroid2') {
                if (body.bounds.right < worldBounds.left) {
                    // Destroy the enemy if it has gone out of bounds
                    body.gameObject.destroy();
                }
            }
        });
    }

    // Check if any swapped object (missile or BigSpace) has gone out of bounds from the left side
    if (missileGroup && missileGroup.bodies) {
        missileGroup.bodies.forEach(body => {
            if (body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'missile') {
                if (body.bounds.right < worldBounds.left) {
                    // Destroy the missile if it has gone out of bounds
                    body.gameObject.destroy();
                }
            }
        });
    }

    if (BigSpaceGroup && BigSpaceGroup.bodies) {
        BigSpaceGroup.bodies.forEach(body => {
            if (body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'BigSpaceGun') {
                if (body.bounds.right < worldBounds.left) {
                    // Destroy the BigSpaceGun if it has gone out of bounds
                    body.gameObject.destroy();
                }
            }
        });
    }

    // Generate enemies at the right edge of the screen
    if (Phaser.Math.Between(1, 100) <= 2) {
        if (gameOver) {
            return;
        }
        generateAsteroid(this, 'asteroid', 20);
    }

    // Generate the new enemy at the right edge of the screen
    if (Phaser.Math.Between(1, 500) <= 2) {
        if (gameOver) {
            return;
        }
        generateAsteroid(this, 'asteroid2', 45, { start: 2, end: 4 });
    }

    // Generate enemies at the right edge of the screen
    if (Phaser.Math.Between(1, 3000) <= 2) {
        if (gameOver) {
            return;
        }
        generateMissile(this);
        generateBigSpace(this);
    }
};

let config = {

    type: Phaser.AUTO,

    width: 800,
    height: 800,
    scene: [startScene, gameScene],

    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },

    fps: {
        target: 60,
        forceSetTimeOut: true // Force the use of setTimeout for better accuracy
    },

    render: {
        antialias: true, // Enable antialiasing
        pixelArt: false, // Disable pixelArt mode
        roundPixels: false // Disable rounding of pixel positions
    }
}

let game = new Phaser.Game(config)