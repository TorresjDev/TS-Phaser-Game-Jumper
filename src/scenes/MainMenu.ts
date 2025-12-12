import { Scene } from "phaser";

export class MainMenu extends Scene {
	constructor() {
		super("MainMenu");
	}

	create(): void {
		const { width, height } = this.scale;

		// Background - centered and scaled to cover if needed, or just placed
		const bg = this.add.image(width / 2, height / 2, "background");
		// Simple cover logic if we want responsiveness
		const scaleX = width / bg.width;
		const scaleY = height / bg.height;
		const scale = Math.max(scaleX, scaleY);
		bg.setScale(scale).setScrollFactor(0);

		// Logo
		this.add.image(width / 2, height * 0.4, "logo").setScale(0.3);

		// Title Text
		this.add
			.text(width / 2, height * 0.6, "CLICK TO START", {
				fontFamily: "Arial Black",
				fontSize: 38,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.setupNavigation();
	}

	private setupNavigation(): void {
		const isMobile = this.sys.game.device.input.touch;
		const { width, height } = this.scale;

		if (isMobile) {
			// For mobile: Create a dedicated "Start Game" button
			const buttonY = height * 0.75;
			
			const startButton = this.add
				.rectangle(width / 2, buttonY, 300, 80, 0x4a90e2)
				.setStrokeStyle(4, 0xffffff)
				.setInteractive({ cursor: "pointer" });

			this.add
				.text(width / 2, buttonY, "START GAME", {
					fontFamily: "Arial Black",
					fontSize: 32,
					color: "#ffffff",
				})
				.setOrigin(0.5);

			startButton.on("pointerdown", () => {
				this.scene.start("Game");
			});
		} else {
			// Desktop: Any click starts the game
			this.input.once("pointerdown", () => {
				this.scene.start("Game");
			});
		}
	}
}
