import { Scene } from "phaser";
import { MobileControls } from "../controls/MobileControls";
import {
	DEFAULT_SETTINGS,
	formatLives,
	formatVolume,
	GameSettings,
	nextLivesOption,
	saveSettings,
} from "../config/settings";

// Interfaces
interface BombSprite extends Phaser.Physics.Arcade.Sprite {
	bounceCount?: number;
	maxBounces?: number;
}

export class Game extends Scene {
	// Game Objects
	private player!: Phaser.Physics.Arcade.Sprite;
	private platforms!: Phaser.Physics.Arcade.StaticGroup;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private coins!: Phaser.Physics.Arcade.StaticGroup;
	private bombs!: Phaser.Physics.Arcade.Group;
	private scoreText!: Phaser.GameObjects.Text;
	private livesText!: Phaser.GameObjects.Text;
	private timerText!: Phaser.GameObjects.Text;
	
	// Audio
	private collectSound!: Phaser.Sound.BaseSound;
	private explosionSound!: Phaser.Sound.BaseSound;
	
	// State
	private gameOver: boolean = false;
	private isPaused: boolean = false;
	private isTakingDamage: boolean = false;
	private score: number = 0;
	private isMobile: boolean = false;
	private lives: number = 3;
	private timeLeft: number = 45;
	private settings: GameSettings = { ...DEFAULT_SETTINGS };
	private coinSpawnPoints: Array<{ x: number; y: number }> = [
		// Left platform
		{ x: 20, y: 385 },
		{ x: 75, y: 385 },
		{ x: 130, y: 385 },
		{ x: 185, y: 385 },
		{ x: 240, y: 385 },
		{ x: 295, y: 385 },
		// Mid platform
		{ x: 405, y: 515 },
		{ x: 460, y: 515 },
		{ x: 515, y: 515 },
		// Top platform
		{ x: 555, y: 255 },
		{ x: 610, y: 255 },
		{ x: 665, y: 255 },
		{ x: 720, y: 255 },
		{ x: 775, y: 255 },
		{ x: 830, y: 255 },
		// Right platform
		{ x: 835, y: 420 },
		{ x: 890, y: 420 },
		{ x: 945, y: 420 },
		{ x: 1000, y: 420 },
	];
	private wasdKeys?: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
		SPACE: Phaser.Input.Keyboard.Key;
	};
	private pauseKey?: Phaser.Input.Keyboard.Key;
	private timerEvent?: Phaser.Time.TimerEvent;
	private pauseOverlay?: Phaser.GameObjects.Container;
	
	// Controls
	private mobileControls?: MobileControls;

	constructor() {
		super("Game");
	}

	create(): void {
		// Defensive reset to avoid state carry-over after scene transitions.
		this.gameOver = false;
		this.isPaused = false;
		this.isTakingDamage = false;
		this.physics.resume();

		this.settings = (this.registry.get("settings") as GameSettings | undefined) ?? {
			...DEFAULT_SETTINGS,
		};
		this.lives = this.settings.startingLives;
		this.timeLeft = 45;

		// Assets
		this.collectSound = this.sound.add("collectSound");
		this.explosionSound = this.sound.add("explosionSound");
		this.applyAudioSettings();

		// Environment
		this.createPlatforms();

		// Animations
		this.createAnimations();

		// Input
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.wasdKeys = this.input.keyboard?.addKeys("W,A,S,D,SPACE") as {
			W: Phaser.Input.Keyboard.Key;
			A: Phaser.Input.Keyboard.Key;
			S: Phaser.Input.Keyboard.Key;
			D: Phaser.Input.Keyboard.Key;
			SPACE: Phaser.Input.Keyboard.Key;
		};
		this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.pauseKey?.on("down", () => this.togglePauseMenu());

		// Player
		this.player = this.physics.add.sprite(100, 500, "dude");
		this.player.setBounce(0.2);
		this.player.body!.setSize(this.player.width, this.player.height * 0.9, false);
		this.player.setCollideWorldBounds(true);
		this.applyPlayerBoundaryMode();

		// Coins (static bodies for reliable pickup hit detection)
		this.coins = this.physics.add.staticGroup();
		this.coinSpawnPoints.forEach(({ x, y }) => {
			const coin = this.coins.create(x, y, "coin") as Phaser.Physics.Arcade.Sprite;
			coin.play("spin");
		});

		// Bombs
		this.bombs = this.physics.add.group();

		// UI
		this.createScoreUI();
		this.startTimer();

		// Colliders
		this.physics.add.collider(this.player, this.platforms);
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
		this.physics.add.overlap(
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
		this.createPauseButton();
	}

	update(): void {
		if (this.gameOver || this.isPaused) {
			return;
		}

		// Input Handling
		const wasd = this.wasdKeys;
		const isLeft =
			this.cursors.left.isDown || Boolean(wasd?.A.isDown) || Boolean(this.mobileControls?.isLeft);
		const isRight =
			this.cursors.right.isDown || Boolean(wasd?.D.isDown) || Boolean(this.mobileControls?.isRight);
		const isJump =
			this.cursors.up.isDown ||
			Boolean(wasd?.W.isDown) ||
			Boolean(wasd?.SPACE.isDown) ||
			Boolean(this.mobileControls?.isJump);

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

		// Horizontal wrap requires side-world collisions disabled.
		if (this.settings.edgeWrapEnabled) {
			this.physics.world.wrap(this.player, this.player.width * 0.5);
		}
		
		// Custom bomb wrap keeps threats in play and avoids dead zones.
		this.bombs.children.each((bomb) => {
			const bombSprite = bomb as BombSprite;
			if (bombSprite.x < -bombSprite.width) {
				bombSprite.x = this.cameras.main.width + bombSprite.width;
			} else if (bombSprite.x > this.cameras.main.width + bombSprite.width) {
				bombSprite.x = -bombSprite.width;
			}
			return true;
		}, this);

		this.checkCoinPickupSafety();
		this.checkBombContactSafety();
	}

	private checkCoinPickupSafety(): void {
		if (this.gameOver || this.isPaused) {
			return;
		}

		const pickupRadius = 24;
		let pickedCoin = false;
		this.coins.children.each((coin) => {
			if (pickedCoin) {
				return false;
			}
			const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
			if (!coinSprite.active || !coinSprite.body) {
				return true;
			}
			const distance = Phaser.Math.Distance.Between(
				this.player.x,
				this.player.y,
				coinSprite.x,
				coinSprite.y
			);
			if (distance <= pickupRadius) {
				pickedCoin = true;
				this.collectCoin(this.player, coinSprite);
				return false;
			}
			return true;
		});
	}

	private checkBombContactSafety(): void {
		if (this.gameOver || this.isTakingDamage) {
			return;
		}

		const hitRadius = 26;
		let detectedContact = false;
		this.bombs.children.each((bomb) => {
			if (detectedContact) {
				return false;
			}
			const bombSprite = bomb as BombSprite;
			if (!bombSprite.active || !bombSprite.body) {
				return true;
			}
			const distance = Phaser.Math.Distance.Between(
				this.player.x,
				this.player.y,
				bombSprite.x,
				bombSprite.y
			);
			if (distance <= hitRadius) {
				detectedContact = true;
				this.hitBomb(this.player);
				return false;
			}
			return true;
		});
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
		this.livesText = this.add
			.text(16, 56, `Lives: ${formatLives(this.settings.startingLives < 0 ? -1 : this.lives)}`, {
				fontSize: "26px",
				color: "#ffffff",
				fontStyle: "bold",
				fontFamily: '"Roboto Condensed", Arial, sans-serif',
				stroke: "#000000",
				strokeThickness: 5,
			})
			.setDepth(10);
		this.timerText = this.add
			.text(16, 94, `Time: ${this.timeLeft}s`, {
				fontSize: "26px",
				color: "#ffffff",
				fontStyle: "bold",
				fontFamily: '"Roboto Condensed", Arial, sans-serif',
				stroke: "#000000",
				strokeThickness: 5,
			})
			.setDepth(10);
	}

	private createPauseButton(): void {
		const pauseButton = this.add
			.rectangle(this.scale.width - 58, 42, 92, 40, 0x111111, 0.65)
			.setStrokeStyle(2, 0xffffff)
			.setScrollFactor(0)
			.setDepth(20)
			.setInteractive({ cursor: "pointer" });
		this.add
			.text(this.scale.width - 58, 42, "PAUSE", {
				fontFamily: "Arial Black",
				fontSize: 15,
				color: "#ffffff",
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(21);
		pauseButton.on("pointerdown", () => this.togglePauseMenu());
	}

	private startTimer(): void {
		this.timerEvent = this.time.addEvent({
			delay: 1000,
			loop: true,
			callback: () => {
				if (this.isPaused || this.gameOver) {
					return;
				}
				this.timeLeft -= 1;
				this.timerText.setText(`Time: ${this.timeLeft}s`);
				if (this.timeLeft <= 0) {
					this.timeLeft = 0;
					this.gameOver = true;
					this.endRun();
				}
			},
		});
	}

	private togglePauseMenu(): void {
		if (this.gameOver) {
			return;
		}
		if (this.isPaused) {
			this.closePauseMenu();
			return;
		}
		this.isPaused = true;
		this.physics.pause();

		const { width, height } = this.scale;
		const bg = this.add.rectangle(width / 2, height / 2, 700, 430, 0x000000, 0.85).setStrokeStyle(3, 0xffffff);
		const title = this.add.text(width / 2, height / 2 - 130, "PAUSED", {
			fontFamily: "Arial Black",
			fontSize: 40,
			color: "#ffffff",
		}).setOrigin(0.5);
		const wrap = this.add.text(width / 2, height / 2 - 45, `EDGE WRAP: ${this.settings.edgeWrapEnabled ? "ON" : "OFF"}`, {
			fontFamily: "Arial",
			fontSize: 26,
			color: "#ffffff",
		}).setOrigin(0.5).setInteractive({ cursor: "pointer" });
		const volume = this.add.text(width / 2, height / 2 - 5, `VOLUME: ${formatVolume(this.settings.sfxVolume)}`, {
			fontFamily: "Arial",
			fontSize: 26,
			color: "#90caf9",
		}).setOrigin(0.5);
		const volumeHelp = this.add.text(width / 2, height / 2 + 23, "Drag slider", {
			fontFamily: "Arial",
			fontSize: 15,
			color: "#cfd8dc",
		}).setOrigin(0.5);
		const sliderY = height / 2 + 47;
		const sliderWidth = 280;
		const sliderLeft = width / 2 - sliderWidth / 2;
		const sliderRight = width / 2 + sliderWidth / 2;
		const sliderTrack = this.add.rectangle(width / 2, sliderY, sliderWidth, 8, 0xffffff, 0.35);
		const sliderFill = this.add.rectangle(sliderLeft, sliderY, sliderWidth * this.settings.sfxVolume, 8, 0x90caf9, 0.9).setOrigin(0, 0.5);
		const sliderHandle = this.add.circle(
			sliderLeft + sliderWidth * this.settings.sfxVolume,
			sliderY,
			12,
			0xffffff,
			0.95
		).setStrokeStyle(2, 0x1e88e5).setInteractive({ cursor: "pointer", draggable: true });
		this.input.setDraggable(sliderHandle);

		const livesLabel = this.add.text(width / 2, height / 2 + 87, "LIVES", {
			fontFamily: "Arial Black",
			fontSize: 20,
			color: "#a5d6a7",
		}).setOrigin(0.5);
		const lives = this.add.text(width / 2, height / 2 + 119, `${formatLives(this.settings.startingLives)}`, {
			fontFamily: "Arial",
			fontSize: this.settings.startingLives < 0 ? 24 : 28,
			color: "#a5d6a7",
		}).setOrigin(0.5);
		const livesPrev = this.add.rectangle(width / 2 - 138, height / 2 + 119, 52, 46, 0x2e7d32).setStrokeStyle(2, 0xffffff).setInteractive({ cursor: "pointer" });
		const livesNext = this.add.rectangle(width / 2 + 138, height / 2 + 119, 52, 46, 0x2e7d32).setStrokeStyle(2, 0xffffff).setInteractive({ cursor: "pointer" });
		const livesPrevText = this.add.text(width / 2 - 138, height / 2 + 119, "-", {
			fontFamily: "Arial Black",
			fontSize: 28,
			color: "#ffffff",
		}).setOrigin(0.5);
		const livesNextText = this.add.text(width / 2 + 138, height / 2 + 119, "+", {
			fontFamily: "Arial Black",
			fontSize: 28,
			color: "#ffffff",
		}).setOrigin(0.5);
		const closeButton = this.add
			.rectangle(width / 2 + 320, height / 2 - 188, 34, 34, 0xd32f2f)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		const closeText = this.add
			.text(closeButton.x, closeButton.y, "X", {
				fontFamily: "Arial Black",
				fontSize: 20,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		const resume = this.add.rectangle(width / 2, height / 2 + 205, 190, 56, 0x2e7d32).setStrokeStyle(3, 0xffffff).setInteractive({ cursor: "pointer" });
		const restart = this.add.rectangle(width / 2 - 220, height / 2 + 205, 190, 56, 0x1565c0).setStrokeStyle(3, 0xffffff).setInteractive({ cursor: "pointer" });
		const menu = this.add.rectangle(width / 2 + 220, height / 2 + 205, 190, 56, 0x6d4c41).setStrokeStyle(3, 0xffffff).setInteractive({ cursor: "pointer" });
		const resumeText = this.add.text(width / 2, height / 2 + 205, "RESUME", {
			fontFamily: "Arial Black",
			fontSize: 23,
			color: "#ffffff",
		}).setOrigin(0.5);
		const restartText = this.add.text(width / 2 - 220, height / 2 + 205, "RESTART", {
			fontFamily: "Arial Black",
			fontSize: 23,
			color: "#ffffff",
		}).setOrigin(0.5);
		const menuText = this.add.text(width / 2 + 220, height / 2 + 205, "MAIN MENU", {
			fontFamily: "Arial Black",
			fontSize: 20,
			color: "#ffffff",
		}).setOrigin(0.5);
		wrap.on("pointerdown", () => {
			this.settings.edgeWrapEnabled = !this.settings.edgeWrapEnabled;
			wrap.setText(`EDGE WRAP: ${this.settings.edgeWrapEnabled ? "ON" : "OFF"}`);
			this.persistSettings();
		});
		sliderHandle.on(
			"drag",
			(
				_pointer: Phaser.Input.Pointer,
				dragX: number
			) => {
				const clampedX = Phaser.Math.Clamp(dragX, sliderLeft, sliderRight);
				sliderHandle.x = clampedX;
				const ratio = (clampedX - sliderLeft) / sliderWidth;
				this.settings.sfxVolume = Number(ratio.toFixed(2));
				sliderFill.width = sliderWidth * this.settings.sfxVolume;
				volume.setText(`VOLUME: ${formatVolume(this.settings.sfxVolume)}`);
				this.persistSettings();
			}
		);
		const changeLives = (): void => {
			this.settings.startingLives = nextLivesOption(this.settings.startingLives);
			lives.setText(formatLives(this.settings.startingLives));
			lives.setFontSize(this.settings.startingLives < 0 ? 24 : 28);
			this.persistSettings();
		};
		livesPrev.on("pointerdown", changeLives);
		livesNext.on("pointerdown", changeLives);
		resume.on("pointerdown", () => this.closePauseMenu());
		restart.on("pointerdown", () => this.scene.restart());
		menu.on("pointerdown", () => this.scene.start("MainMenu"));
		closeButton.on("pointerdown", () => this.closePauseMenu());

		this.pauseOverlay = this.add
			.container(0, 0, [
				bg,
				title,
				wrap,
				volume,
				volumeHelp,
				sliderTrack,
				sliderFill,
				sliderHandle,
				livesLabel,
				lives,
				livesPrev,
				livesNext,
				livesPrevText,
				livesNextText,
				closeButton,
				closeText,
				restart,
				resume,
				menu,
				restartText,
				resumeText,
				menuText,
			])
			.setDepth(1000);
	}

	private closePauseMenu(): void {
		this.pauseOverlay?.destroy();
		this.pauseOverlay = undefined;
		this.isPaused = false;
		this.physics.resume();
	}

	private persistSettings(): void {
		saveSettings(this.settings);
		this.registry.set("settings", this.settings);
		this.applyAudioSettings();
		this.applyPlayerBoundaryMode();
	}

	private applyAudioSettings(): void {
		const level = this.settings.sfxVolume;
		this.sound.volume = level;
	}

	private applyPlayerBoundaryMode(): void {
		const body = this.player.body as Phaser.Physics.Arcade.Body;
		if (!body) {
			return;
		}

		const wrapEnabled = this.settings.edgeWrapEnabled;
		this.player.setCollideWorldBounds(!wrapEnabled);
		body.checkCollision.left = !wrapEnabled;
		body.checkCollision.right = !wrapEnabled;
		body.checkCollision.up = !wrapEnabled;
		body.checkCollision.down = true;

		if (!wrapEnabled) {
			const halfWidth = this.player.displayWidth * 0.5;
			this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, this.scale.width - halfWidth);
		}
	}

	private handleBombPlatformCollision = (
		bomb: unknown
	) => {
		const bombSprite = bomb as BombSprite;
		// Count bounces when bomb hits a platform
		if (bombSprite.bounceCount !== undefined) {
			bombSprite.bounceCount++;
			if (bombSprite.bounceCount >= bombSprite.maxBounces!) {
				bombSprite.destroy();
			}
		}
	}

	private collectCoin = (
		player: unknown,
		coin: unknown
	) => {
		const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
		coinSprite.disableBody(true, true);
		this.collectSound.play();
		this.score += 10;
		this.timeLeft += 3;
		this.timerText.setText(`Time: ${this.timeLeft}s`);
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
			this.coins.children.iterate((child, index) => {
				const c = child as Phaser.Physics.Arcade.Sprite;
				const spawn = this.coinSpawnPoints[index];
				c.enableBody(false, spawn.x, spawn.y, true, true);
				(c.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
				return true;
			});
		}
	}

	private spawnBomb(x: number): void {
		const bomb = this.bombs.create(x, 16, "bomb") as BombSprite;
		bomb.setBounce(0.9);
		bomb.setCollideWorldBounds(true);
		
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		
		bomb.bounceCount = 0;
		bomb.maxBounces = 20;
	}

	private hitBomb = (
		player: unknown
	) => {
		if (this.gameOver || this.isTakingDamage) {
			return;
		}
		const playerSprite = player as Phaser.Physics.Arcade.Sprite;
		this.explosionSound.play();
		this.isTakingDamage = true;

		// Keep player in-place; provide stronger red damage feedback.
		this.tweens.add({
			targets: playerSprite,
			alpha: 0.35,
			duration: 80,
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				playerSprite.clearTint();
				playerSprite.setAlpha(1);
			},
		});
		for (let i = 0; i < 6; i++) {
			this.time.delayedCall(i * 80, () => {
				if (!playerSprite.active) {
					return;
				}
				if (i % 2 === 0) {
					playerSprite.setTintFill(0xff3b30);
				} else {
					playerSprite.clearTint();
				}
			});
		}

		if (this.settings.startingLives < 0) {
			this.livesText.setText("Lives: Unlimited");
			this.time.delayedCall(500, () => {
				this.isTakingDamage = false;
			});
			return;
		}

		this.lives -= 1;
		this.livesText.setText(`Lives: ${formatLives(this.lives)}`);

		if (this.lives <= 0) {
			this.gameOver = true;
			if (this.mobileControls) this.mobileControls.destroy();
			setTimeout(() => this.endRun(), 1200);
			return;
		}

		this.time.delayedCall(500, () => {
			this.isTakingDamage = false;
		});
	}

	private endRun(): void {
		this.physics.resume();
		this.timerEvent?.remove(false);
		const bestScore = Number(localStorage.getItem("jumper.bestScore") ?? 0);
		const nextBest = Math.max(bestScore, this.score);
		localStorage.setItem("jumper.bestScore", String(nextBest));
		this.registry.set("lastScore", this.score);
		this.registry.set("bestScore", nextBest);
		this.scene.start("GameOver");
	}
}
