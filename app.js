// Defining variables to be available throughout the game
let player, cursors, enemies, playerLasers, winText;

// Config to set up the main game object
const config = {
  type: Phaser.AUTO, // Tells Phaser to try WebGL API and fallback to Canvas if it fails
  parent: 'app', // ID of div to host game
  width: window.innerWidth,
  heigth: window.innerHeight,
  // The scene that contains the logic + state of the game, can be a JS object with these 3 functions
  scene: {
    preload,
    create,
    update
  },
  // Physics engine is responsible for moving, collisions etc. We use the arcade engine as it's the simplest one
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false
    }
  }
};

// The game object, such a beautiful thing
const game = new Phaser.Game(config);

/**
 * This function loads all the assets
 * For images and for most other assets we usually define a 'key' for the asset
 * that we can reference to put on the screen and then provide the location of
 * the asset relevant to the website's root /
 */
function preload() {
  this.load.image('red', 'player.png');
  this.load.image('redLaser', 'playerLaser.png');
  this.load.image('blue', 'enemy.png');
}

/**
 * This function sets up our game objects to be updated
 * It's here we create the players, enemies, the containers for the lasers and
 * the text when a user wins. We also set up the physical conditions of the game
 * world, like boundaries and collisions
 */
function create() {
  /**
   * Don't forget coordinates start at 0,0 from the top left
   * As we move rightward, the x value increases
   * As we move downward, the y value increases. 
   */
  player = this.physics.add.sprite(
    window.innerWidth / 2, // x position
    window.innerHeight / 1.2, // y position
    'red' // key of image for the sprite
  );
  // Variable to track key presses
  cursors = this.input.keyboard.createCursorKeys();
  // Ensure that the player can't leave the screen
  player.setCollideWorldBounds(true);

  /**
   * We create sprite groups when we have numerous sprites with similar
   * properties and behaviours. Properties and behaviours like collisions are
   * observed by all sprites when they belong to the same group
   */
  enemies = this.physics.add.group({
    key: 'blue', // key of image for the sprites
    repeat: 2, // Tells Phaser to repeat the creation of a sprite 2 more times i.e. total of 3 times
    setXY: {
      x: 100, // Initial x position of sprite
      y: 50, // Initial y position of sprite,
      stepX: (window.innerWidth / 3), // Distance between sprites on the x-axis
      stepY: 100 // Distance between sprites on the y-axis
    },
    velocityX: -250, // Set the intial velocity of the sprites so that they go to the left
    collideWorldBounds: true, // Collide with the world so they won't go out of bounds
    bounceX: 1, // Go to the next side with the same velocity when colliding with the world
  });

  // Create a sprite group of lasers that can only have 3 at a time
  playerLasers = this.physics.add.group({
    maxSize: 3
  });

  /**
   * Tell Phaser to handle collisions between the laser group and the enemies
   * Every time a laser hits an enemy, call the destroyEnemy function
   * Do your homework for the other 2 arguments ;-)
   */
  this.physics.add.collider(playerLasers, enemies, destroyEnemy, null, this);

  /**
   * Add text to the screen
   * We set the XY values of where the text box would reside, the message itself
   * and some font information. We're just using standard fonts, for more 
   * personalised options you'll want to look at Bitmap fonts
   */
  winText = this.add.text(
    window.innerWidth / 2,
    window.innerHeight / 2,
    'You Won!',
    {
      fontFamily: 'Helvetica, Impact, Arial',
      fontSize: '64px',
      color: '#ffffff'
    }
  );
  /**
   * Text object's origin is at the top left, so we set the origin to the centre
   * to make the entire text centred
   */
  winText.setOrigin(0.5);
  // Since the user hasn't won, let's hide this for now
  winText.setVisible(false);
}

function update() {
  /**
   * It's standard practice to check for game over/winning conditions at the 
   * beginning of the game loop. Recall that members of a sprite group are 
   * called children. In our case, the user wins the game if they destroy all
   * enemies i.e. there are no more children in the group
   */
  if (enemies.getChildren().length === 0) {
    winText.setVisible(true);
  }

  // Put this in so that the player doesn't move if no key is being pressed
  player.body.setVelocityX(0);
  /**
   * Check the cursor and move the velocity accordingly. With Arcade Physics we
   * adjust velocity for movement as opposed to manipulating xy values directly
   */
  if (cursors.left.isDown) {
    player.body.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(200);
  }

  /**
   * We want to prevent multiple lasers being fired at the same time in this
   * game, so we use Phaser's JustDown method to see if it was pressed as 
   * opposed to being held down. We also don't want to fire if there are 3 
   * children in the laser group already. If we try to add a sprite more than
   * the max group of the sprite group. Phaser will throw an error.
   */
  if (Phaser.Input.Keyboard.JustDown(cursors.space) && playerLasers.getChildren().length < 3) {
    shootLaser(playerLasers, player, 'redLaser', -200);
  }

  // If a laser has left the screen, destroy it so we can fire a new one
  playerLasers.getChildren().forEach(laser => {
    if (laser.body.y <= 0) {
      laser.destroy();
    }
  });
}

/**
 * 
 * @param spriteGroup - the laser sprite group
 * @param shootingSprite - the sprite shooting the laser
 * @param spriteImage - the image of the laser
 * @param velocityY 
 */
function shootLaser(spriteGroup, shootingSprite, spriteImage, velocityY) {
  spriteGroup.create(
    shootingSprite.body.center.x,
    shootingSprite.body.y,
    spriteImage
  ).setVelocity(0, velocityY);
}

/**
 * This function handles the collision between a laser and ship sprite
 * Did you notice that the arguments are in single and not plural? Even though
 * the collider takes 2 sprites groups in our case, Phaser is smart enough to
 * pass the 2 respective objects in the collision to our handler
 * @param laser - the laser sprite object
 * @param enemy - the enemy sprite object
 */
function destroyEnemy(laser, ship) {
  ship.destroy();
  // Take away the laser too, don't want it suriving a collision with an enemy
  laser.destroy();
}
