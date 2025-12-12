import { Scene } from "phaser";

export class GameOver extends Scene {
	constructor() {
		super("GameOver");
	}

	create(): void {
		const { width, height } = this.scale;

		this.cameras.main.setBackgroundColor(0xff0000);
		this.add.image(width / 2, height / 2, "background").setAlpha(0.5);
		this.add
			.text(width / 2, height * 0.5, "Game Over", {
				fontFamily: "Arial Black",
				fontSize: 64,
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
			// For mobile: Create a dedicated "Restart" button to avoid accidental touches
			const buttonY = height * 0.75;

			const restartButton = this.add
				.rectangle(width / 2, buttonY, 300, 80, 0xe74c3c)
				.setStrokeStyle(4, 0xffffff)
				.setInteractive({ cursor: "pointer" });

			this.add
				.text(width / 2, buttonY, "RESTART", {
					fontFamily: "Arial Black",
					fontSize: 32,
					color: "#ffffff",
				})
				.setOrigin(0.5);

			restartButton.on("pointerdown", () => {
				this.scene.start("MainMenu");
			});
		} else {
			// Desktop: Any click restarts
			this.input.once("pointerdown", () => {
				this.scene.start("MainMenu");
			});
		}
	}
}
