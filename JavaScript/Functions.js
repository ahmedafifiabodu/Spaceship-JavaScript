function gameOvers() {
    gameOver = true;

    gameoverSound.play();
    gameScene.input.setDefaultCursor('auto');

    destroyHearts(activeHearts);

    additionalPhotos.forEach(photo => photo.setVisible(false));
    setPlayerAndMissileVisibility(false);
    hearts.forEach(heart => heart.setVisible(false));

    overlay = this.scene.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);

    gameOverText = this.scene.add.text(400, 300, 'Game Over', { fontSize: '32px', fill: '#fff' });
    gameOverText.setOrigin(0.5);

    restartButton = this.scene.add.text(400, 400, 'Restart', { fontSize: '24px', fill: '#fff' });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive();

    restartButton.on('pointerover', () => restartButton.setStyle({ fill: '#ff0' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ fill: '#fff' }));
    restartButton.on('pointerdown', restartGame, this);

    speed1 = 0.5;
    speed2 = 1.0;
    speed3 = 1.5;

    elapsedTime = 0;

    destroyEnemies(enemyBodies);
    enemyBodies = [];

    score = 0;
    updateScoreText();

    background.pause();

    //player.anims.stop('playerRocketShootingAnimation');
    missle.setVisible(false);
    fireRateBar.setVisible(false);
    cooldownText.setVisible(false);
    //equippedMissile.setVisible(false);

    // Destroy active missiles and reset equippedMissile
    destroyMissiles(missileGroup);
}

function restartGame() {
    inStartState = false;
    gameScene.input.setDefaultCursor('none');
    gameOver = false;

    destroyHearts(activeHearts);

    if (gameOverText) {
        gameOverText.destroy();
        overlay.destroy();
    }

    if (restartButton) {
        restartButton.destroy();
    }

    //missle.destroy();

    setPlayerAndMissileVisibility(true);

    currentHearts = maxHearts;
    updateHearts();
    updatePlayerTexture();

    background.stop();
    background.play();
}

function setupPlayerRocketShootingAnimation(scene) {
    if (!scene.anims.exists('playerRocketShootingAnimation')) {
        scene.anims.create({
            key: "playerRocketShootingAnimation",
            frames: scene.anims.generateFrameNumbers(
                "playerRocketShooting",
                { start: 0, end: 3 }
            ),
            frameRate: 10,
            repeat: -1
        });
    }
}

function setupPlayerBigSpaceGunShootingAnimation(scene) {
    if (!scene.anims.exists('playerBigSpaceShootingAnimation')) {
        scene.anims.create({
            key: "playerBigSpaceShootingAnimation",
            frames: scene.anims.generateFrameNumbers(
                "playerBigSpaceShooting",
                { start: 0, end: 3 }
            ),
            frameRate: 10,
            repeat: -1
        });
    }
}

function updatePlayerTexture() {

    if (gameOver) {
        return;
    }

    let animationKey;

    switch (currentHearts) {
        case 4:
            animationKey = 'full_health';
            break;
        case 3:
            animationKey = 'semi_damaged';
            break;
        case 2:
            animationKey = 'damaged';
            break;
        case 1:
            animationKey = 'heavyly_damaged';
            break;
        default:
            // Handle other cases if necessary
            break;
    }

    player.anims.play(animationKey, true);
}

// Add a new function to destroy active missiles
function destroyMissiles(missilesArray) {

    //FIX IT///////////////////////////////************************************************************************************************* */
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


    // Clear the array
    missilesArray = [];
}

function destroyHearts(heartsArray) {
    heartsArray.forEach(item => {
        item.heart.destroy();
        item.tween.stop();
        item.tween.destroy();
    });
}

function destroyEnemies(enemyBodiesArray) {
    enemyBodiesArray.forEach(body => {
        if (body.gameObject) {
            body.gameObject.destroy();
        }
    });
}

function setPlayerAndMissileVisibility(visible) {
    player.setVisible(visible);
    missle.setVisible(visible);
}

function updateFireRateBar() {
    const scale = currentFireRate / maxFireRate;
    fireRateBar.setScale(scale, 1);
}

function updateScoreText() {
    if (scoreText) {
        scoreText.setText('Score: ' + score);
    }
}

function updateHearts() {
    for (let i = 0; i < maxHearts; i++) {
        hearts[i].setVisible(i < currentHearts);
        additionalPhotos[i].setVisible(i >= currentHearts);
    }
}

function shootBullet(x, y, scene) {
    if (gameOver) {
        return;
    }

    // Check if the player has an equipped missile
    if (equippedMissile) {
        // Use the equipped missile for shooting
        const bullet = scene.matter.add.sprite(x, y - 10, "playerRocketShooting")
            .setAngle(90)
            .setCollisionCategory(collisionCategories.bullet)
            .setCollidesWith([collisionCategories.asteroid]);

        bullet.isPlayerBullet = true;

        bullet.anims.play('playerRocketShootingAnimation', true);
        bullet.setVelocityX(7);
        bullet.outOfBoundsKill = true;

        scene.time.delayedCall(5000, () => bullet.destroy());

        // Use the equipped missile for shooting
        const bullet2 = scene.matter.add.sprite(x - 10, y + 10, "playerRocketShooting")
            .setAngle(90)
            .setCollisionCategory(collisionCategories.bullet)
            .setCollidesWith([collisionCategories.asteroid]);

        bullet2.isPlayerBullet = true;

        bullet2.anims.play('playerRocketShootingAnimation', true);
        bullet2.setVelocityX(7);
        bullet2.outOfBoundsKill = true;

        scene.time.delayedCall(5000, () => bullet2.destroy());

    }

    if (equippedBigSpace) {
        // Use the equipped missile for shooting
        const bullet = scene.matter.add.sprite(x, y, "playerBigSpaceShooting")
            .setAngle(90)
            .setCollisionCategory(collisionCategories.bullet)
            .setCollidesWith([collisionCategories.asteroid]);

        bullet.isPlayerBullet = true;

        bullet.anims.play('playerBigSpaceShootingAnimation', true);
        bullet.setVelocityX(7);
        bullet.outOfBoundsKill = true;

        scene.time.delayedCall(5000, () => bullet.destroy());

    }
}

function spawnBulletAndHandleShootLogic(scene) {

    lastShootTime = scene.time.now;
    currentFireRate += 10;

    // Calculate the frame index based on shootCounter
    const frameIndex = shootCounter;
    fireRateBar.setFrame(frameIndex);

    shootCounter++;

    if (shootCounter === shootLimit) {
        // Play the sound when the player shoots 5 times and has to wait 3 seconds
        cooldownSound.play();

        // Display the cooldown text
        cooldownText.setText('Cooldown 2 seconds');
        scene.time.delayedCall(2000, function () {
            cooldownText.setText(''); // Hide the cooldown text after 3 seconds
        });
    }

    if (currentFireRate > maxFireRate) {
        currentFireRate = maxFireRate;
    }
}

function generateRandomHearts() {
    if (gameOver) {
        return;
    }

    const heart = this.matter.add.image(this.sys.game.config.width,
        Phaser.Math.Between(100, this.sys.game.config.height - 100), "heart");

    heart.setScrollFactor(0);
    heart.setSensor(true)
        .setCollisionCategory(collisionCategories.heart)
        .setCollidesWith([collisionCategories.player]);

    const tween = this.tweens.add({
        targets: heart,
        x: 0,
        duration: 3000,
        onComplete: () => heart.destroy()
    });

    activeHearts.push({ heart, tween });
}

function generateAsteroid(scene, asteroidType, radius, frameConfig) {
    const asteroid = scene.matter.add.sprite(
        scene.sys.game.config.width,
        Phaser.Math.Between(0, scene.sys.game.config.height),
        asteroidType
    );

    // Set up asteroid animation
    if (frameConfig) {
        asteroid.anims.create({
            key: asteroidType + 'Animation',
            frames: asteroid.anims.generateFrameNumbers(asteroidType, frameConfig),
            frameRate: 5,
            repeat: 0
        });
        //asteroid.anims.play(asteroidType + 'Animation', true);
    }

    // Create a sensing region around the asteroid
    asteroid.setCircle(radius, {
        radius: 150,
        isSensor: true,
        collisionFilter: {
            category: collisionCategories.asteroid,
            mask: collisionCategories.player
        }
    });

    // Set the asteroid's velocity and other properties
    asteroid.setVelocityX(speedEnemy).setFrictionAir(0).setMass(1)
        .setCollisionCategory(collisionCategories.asteroid)
        .setCollidesWith([collisionCategories.bullet, collisionCategories.asteroid, collisionCategories.player]);

    // Add the asteroid to the enemy group
    asteroid.setInteractive();
    enemyGroup.add(asteroid);

    // Store the asteroid body in the array
    enemyBodies.push(asteroid.body);
}

function isBullet(body) {
    return body.gameObject.texture && (body.gameObject.texture.key === 'playerRocketShooting' || body.gameObject.texture.key === 'playerBigSpaceShooting');
}

function isAsteroid(body) {
    return body.gameObject.texture && (body.gameObject.texture.key === 'asteroid' || body.gameObject.texture.key === 'asteroid2');
}

function handleBulletAsteroidCollision(bulletBody, asteroidBody) {
    // Check if bodyA is a bullet and increment the score
    if (isBullet(bulletBody)) {
        bulletBody.gameObject.destroy();
        score += 1;
        updateScoreText();
    }

    // Check if bodyB is a bullet and increment the score
    if (isBullet(asteroidBody)) {
        asteroidBody.gameObject.destroy();
        score += 1;
        updateScoreText();
    }

    // Destroy both bodies if they still exist
    if (bulletBody.gameObject) bulletBody.gameObject.destroy();
    if (asteroidBody.gameObject) asteroidBody.gameObject.destroy();
}

function generateMissile(scene) {

    if (gameOver) {
        return;
    }

    const missile = scene.matter.add.image(
        scene.sys.game.config.width,
        Phaser.Math.Between(0, scene.sys.game.config.height),
        'missiles'
    );

    missile.setCircle(20, {
        radius: 150,
        isSensor: true,
        collisionFilter: {
            category: collisionCategories.weapon,
            mask: collisionCategories.player,
        },
    });

    missile.setVelocityX(speedEnemy).setFrictionAir(0).setMass(1)
        .setCollisionCategory(collisionCategories.weapon)
        .setCollidesWith([collisionCategories.player]);

    missile.setInteractive();
    missileGroup.add(missile);

    // Add the missile to activeMissiles
    activeMissiles.push({ missile });

    // Destroy the missile after a certain time
    scene.time.delayedCall(50000, () => {
        // Check if the missile's body and game object exist before destroying
        if (missile.body && missile.body.gameObject) {
            missile.body.gameObject.destroy();

            // Remove the missile from activeMissiles
            activeMissiles = activeMissiles.filter(item => item.missile !== missile);
        }
    });
}

function generateBigSpace(scene) {
    if (gameOver) {
        return;
    }

    const BigSpace = scene.matter.add.image(
        scene.sys.game.config.width,
        Phaser.Math.Between(0, scene.sys.game.config.height),
        'BigSpaceGun'
    );

    BigSpace.setCircle(20, {
        radius: 150,
        isSensor: true,
        collisionFilter: {
            category: collisionCategories.weapon,
            mask: collisionCategories.player,
        },
    });

    BigSpace.setVelocityX(speedEnemy).setFrictionAir(0).setMass(1)
        .setCollisionCategory(collisionCategories.weapon)
        .setCollidesWith([collisionCategories.player]);

    BigSpace.setInteractive();

    BigSpaceGroup.add(BigSpace);

    // Add the missile to activeMissiles
    activeMissiles.push({ BigSpace });

    // Destroy the missile after a certain time
    scene.time.delayedCall(50000, () => {
        // Check if the missile's body and game object exist before destroying
        if (BigSpace.body && BigSpace.body.gameObject) {
            BigSpace.body.gameObject.destroy();

            // Remove the missile from activeMissiles
            activeMissiles = activeMissiles.filter(item => item.BigSpace !== BigSpace);
        }
    });
}

function checkPlayerCollision(playerBody, otherBody) {
    const playerKey = playerBody.gameObject && playerBody.gameObject.texture && playerBody.gameObject.texture.key;
    const otherKey = otherBody.gameObject && otherBody.gameObject.texture && otherBody.gameObject.texture.key;

    if (playerKey === 'player' && otherKey === 'missiles') {
        handleCollision('missile', playerBody, otherBody);
    } else if (playerKey === 'player' && otherKey === 'BigSpaceGun') {
        handleCollision('BigSpaceGun', playerBody, otherBody);
    }
}

function handleCollision(type, playerBody, otherBody) {
    // Play collision sound
    collectSound.play();

    // Equip the missile or BigSpaceGun
    const equippedItem = playerBody.gameObject.texture.key === type ? playerBody.gameObject : otherBody.gameObject;

    // Disable collisions and make it invisible
    equippedItem.setCollisionCategory(0);
    equippedItem.setVisible(false);

    // Reset previously equipped item
    resetEquipped();

    // Show relevant elements
    showElements(type, equippedItem);

    // Clear shooting timer
    clearTimeout(shootingTimer);

    startShootingAnimation(type);

    // Set a timer to stop shooting and destroy the missile after a certain time
    shootingTimer = setTimeout(() => {
        stopShootingAnimation(type);

        BigSpace.setVisible(false);
        equippedBigSpace = null;

        missle.setVisible(false);
        equippedMissile = null;

        // Reset equipped missile or BigSpaceGun
        resetEquipped();

    }, SHOOTING_DURATION);

}

function resetEquipped() {
    if (equippedMissile) {
        // Clear visibility and timer for the previous missile
        equippedMissile.setCollisionCategory(0);
        equippedMissile.setVisible(false);
        equippedMissile = null;
    }

    if (equippedBigSpace) {
        // Clear visibility and timer for the previous BigSpaceGun
        equippedBigSpace.setCollisionCategory(0);
        equippedBigSpace.setVisible(false);
        equippedBigSpace = null;
    }

    fireRateBar.setVisible(false);
    cooldownText.setVisible(false);
}

function showElements(type, equippedItem) {
    if (type === 'missile') {
        BigSpace.setVisible(false);
        equippedBigSpace = null;
        missle.setVisible(true);
        equippedMissile = equippedItem;

        // Listen for the animation complete event
        missle.on('animationcomplete-idle', function () {
            // Start shooting after the animation is complete
            startShooting();
        });
    } else if (type === 'BigSpaceGun') {
        missle.setVisible(false);
        equippedMissile = null;
        BigSpace.setVisible(true);
        equippedBigSpace = equippedItem;

        // Listen for the animation complete event
        BigSpace.on('animationcomplete-idle', function () {
            // Start shooting after the animation is complete
            startShooting();
        });
    }
    fireRateBar.setVisible(true);
    cooldownText.setVisible(true);
}

function startShootingAnimation(type) {
    if (type === 'missile') {
        missle.anims.play('idle', true);
    } else if (type === 'BigSpaceGun') {
        BigSpace.anims.play('idle', true);
    }
}

function stopShootingAnimation(type) {
    if (type === 'missile') {
        player.anims.stop('playerRocketShootingAnimation');
    } else if (type === 'BigSpaceGun') {
        player.anims.stop('playerBigSpaceShootingAnimation');
    }
}