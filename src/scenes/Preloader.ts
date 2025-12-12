import { Scene } from "phaser";

export class Preloader extends Scene {
	constructor() {
		super("Preloader");
	}

	init(): void {
		const { width, height } = this.scale;
		this.add.image(width / 2, height / 2, "background");
		
		// Loading bar container
		const barWidth = 468;
		const barHeight = 32;
		this.add.rectangle(width / 2, height / 2, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

		// Optional: Add progress bar fill logic here if desired later
		// const bar = this.add.rectangle(width / 2 - barWidth / 2 + 2, height / 2, 4, barHeight - 4, 0xffffff);
		
		this.load.on('progress', (progress: number) => {
			// Update bar width based on progress
			// bar.width = (barWidth - 4) * progress;
		});
	}

	preload(): void {
		this.load.setPath("assets");

		this.load.image("logo", "images/ui/jumper-title.png");
		this.load.image("sky", "images/background/sky.png");
		this.load.image("platform-sm", "images/platforms/platform-sm-i.png");
		this.load.image("platform-lg", "images/platforms/platform-lg-i.png");
		this.load.image("left-button", "images/controls/icons8-left-arrow.png");
		this.load.image("right-button", "images/controls/icons8-right-arrow.png");
		this.load.image("jump-button", "images/controls/icons8-up-arrow.png");
		this.load.image("floor", "images/platforms/floor.png");
		this.load.image("bomb", "images/items/bomb-i.png");
		this.load.spritesheet("coin", "images/items/coin.png", {
			frameWidth: 18,
			frameHeight: 18,
		});
		this.load.spritesheet("dude", "images/characters/jumper-hero.png", {
			frameWidth: 32,
			frameHeight: 48,
		});
		this.load.audio("collectSound", "audio/collect.mp3");
		this.load.audio("explosionSound", "audio/bmb-ex-ii.mp3");
	}

	create(): void {
		this.scene.start("MainMenu");
	}
}
