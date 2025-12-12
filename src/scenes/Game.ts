import { Scene } from "phaser";
import { MobileControls } from "../controls/MobileControls";

// Interfaces
interface BombSprite extends Phaser.Physics.Arcade.Sprite {
	bounceCount?: number;
	maxBounces?: number;
}

export class Game extends Scene {
	// Game Objects
	private player: Phaser.Physics.Arcade.Sprite;
	private platforms: Phaser.Physics.Arcade.StaticGroup;
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private coins: Phaser.Physics.Arcade.Group;
	private bombs: Phaser.Physics.Arcade.Group;
	private scoreText: Phaser.GameObjects.Text;
	
	// Audio
	private collectSound: Phaser.Sound.BaseSound;
	private explosionSound: Phaser.Sound.BaseSound;
	
	// State
	private gameOver: boolean = false;
	private score: number = 0;
	private isMobile: boolean = false;
	
	// Controls
	private mobileControls: MobileControls;

	constructor() {
		super("Game");
	}

	create(): void {
		// Assets
		this.collectSound = this.sound.add("collectSound");
		this.explosionSound = this.sound.add("explosionSound");

		// Environment
		this.createPlatforms();

		// Animations
		this.createAnimations();

		// Input
		this.cursors = this.input.keyboard!.createCursorKeys();

		// Player
		this.player = this.physics.add.sprite(100, 500, "dude");
		this.player.setBounce(0.2);
		this.player.body!.setSize(this.player.width, this.player.height * 0.9, false);
		this.player.setCollideWorldBounds(true); // Added for basic bounds, though we might wrap

		// Coins
		this.coins = this.physics.add.group({
			key: "coin",
			repeat: 18,
			setXY: { x: 21, y: 100, stepX: 55 },
		});

		this.coins.children.iterate((child) => {
			const coin = child as Phaser.Physics.Arcade.Sprite;
			coin.play("spin");
			return true;
		});

		// Bombs
		this.bombs = this.physics.add.group();

		// UI
		this.createScoreUI();

		// Colliders
		this.physics.add.collider(this.player, this.platforms);
		this.physics.add.collider(this.coins, this.platforms);
		this.physics.add.collider(
			this.bombs,
			this.platforms,
			this.handleBombPlatformCollision,
			undefined,
			this
		);
		this.physics.add.overlap(
			this.player,
			this.coins,
			this.collectCoin,
			undefined,
			this
		);
		this.physics.add.collider(
			this.player,
			this.bombs,
			this.hitBomb,
			undefined,
			this
		);

		// Mobile Detection & Controls
		this.isMobile = this.sys.game.device.input.touch;
		if (this.isMobile) {
			this.mobileControls = new MobileControls(this);
		}

		// Scene Navigation
		this.input.addPointer(2);
	}

	update(): void {
		if (this.gameOver) {
			return;
		}

		// Input Handling
		const isLeft = this.cursors.left.isDown || (this.mobileControls && this.mobileControls.isLeft);
		const isRight = this.cursors.right.isDown || (this.mobileControls && this.mobileControls.isRight);
		const isJump = this.cursors.up.isDown || (this.mobileControls && this.mobileControls.isJump);

		// Player Movement
		if (isLeft) {
			this.player.setVelocityX(-160);
			this.player.anims.play("left", true);
		} else if (isRight) {
			this.player.setVelocityX(160);
			this.player.anims.play("right", true);
		} else {
			this.player.setVelocityX(0);
			this.player.anims.play("turn");
		}

		if (isJump && this.player.body!.touching.down) {
			this.player.setVelocityY(-333);
		}

		// Physics Logic
		this.physics.world.wrap(this.player, 0);
		
		// Custom Bomb Wrapping (Only Horizontal)
		this.bombs.children.each((bomb) => {
			const bombSprite = bomb as BombSprite;
			if (bombSprite.x < -bombSprite.width) {
				bombSprite.x = this.cameras.main.width + bombSprite.width;
			} else if (bombSprite.x > this.cameras.main.width + bombSprite.width) {
				bombSprite.x = -bombSprite.width;
			}
			return true;
		}, this);
	}

	private createPlatforms(): void {
		this.platforms = this.physics.add.staticGroup();
		this.platforms.create(505, 735, "floor").setScale(3).refreshBody(); // Ground
		this.platforms.create(150, 420, "platform-lg");
		this.platforms.create(700, 300, "platform-lg");
		this.platforms.create(515, 550, "platform-sm");
		this.platforms.create(910, 450, "platform-sm");
	}

	private createAnimations(): void {
		this.anims.create({
			key: "left",
			frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "turn",
			frames: [{ key: "dude", frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: "right",
			frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "spin",
			frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 4 }),
			frameRate: 9,
			repeat: -1,
		});
	}

	private createScoreUI(): void {
		const labelStyle = {
			fontSize: "32px",
			color: "#ffffff",
			fontStyle: "bold",
			fontFamily: '"Roboto Condensed", Arial, sans-serif',
			stroke: "#000000",
			strokeThickness: 6,
		};

		const scoreLabel = this.add.text(16, 16, "Score:", labelStyle);
		this.scoreText = this.add.text(16 + scoreLabel.width, 16, "0", labelStyle);
	}

	private handleBombPlatformCollision = (bomb: any, platform: any) => {
		const bombSprite = bomb as BombSprite;
		// Count bounces when bomb hits a platform
		if (bombSprite.bounceCount !== undefined) {
			bombSprite.bounceCount++;
			if (bombSprite.bounceCount >= bombSprite.maxBounces!) {
				bombSprite.destroy();
			}
		}
	}

	private collectCoin = (player: any, coin: any) => {
		const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
		coinSprite.disableBody(true, true);
		this.collectSound.play();
		this.score += 10;
		this.scoreText.setText(this.score.toString());

		this.tweens.add({
			targets: this.scoreText,
			scale: { from: 1.5, to: 1 },
			ease: "Cubic",
			duration: 300,
			onUpdate: () => { this.scoreText.setColor("#ffb600"); },
			onComplete: () => { this.scoreText.setColor("#ffffff"); },
		});

		const playerSprite = player as Phaser.Physics.Arcade.Sprite;
		const x = playerSprite.x < 275
				? Phaser.Math.Between(275, 600)
				: Phaser.Math.Between(0, 275);

		this.spawnBomb(x);

		if (this.coins.countActive(true) === 0) {
			this.coins.children.iterate((child) => {
				const c = child as Phaser.Physics.Arcade.Sprite;
				c.enableBody(true, c.x, 30, true, true);
				return true;
			});
		}
	}

	private spawnBomb(x: number): void {
		const bomb = this.bombs.create(x, 16, "bomb") as BombSprite;
		bomb.setBounce(0.9);
		bomb.setCollideWorldBounds(true);
		
		// Allow horizontal wrapping by disabling world bounds just for X if needed, 
		// but Phaser 'collideWorldBounds' is usually all-or-nothing.
		// However, we can disable the X checks in the updates if we want wrapping, 
		// OR we can just rely on the world bounds for "wall bouncing" which is often better for gameplay.
		// Current design: collide World Bounds (so they don't fall out bottom), but we manually wrap X in update.
		// To allow manual X wrapping with collideWorldBounds, we need to allow them to go offscreen? 
		// Actually, collideWorldBounds prevents going offscreen. 
		// If we want wrapping, we should turn off collision on left/right. 
		// For now, let's try standard physics bouncing first as it's less buggy.
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		
		bomb.bounceCount = 0;
		bomb.maxBounces = 20;
	}

	private hitBomb = (player: any, bomb: any) => {
		this.physics.pause();
		const playerSprite = player as Phaser.Physics.Arcade.Sprite;
		playerSprite.setTint(0xff0000);
		playerSprite.anims.play("turn");
		this.gameOver = true;
		this.explosionSound.play();
		
		if (this.mobileControls) this.mobileControls.destroy();
		
		setTimeout(() => this.resetGame(), 2000);
	}

	private resetGame(): void {
		this.scene.restart();
		this.gameOver = false;
		this.score = 0;
	}
}
