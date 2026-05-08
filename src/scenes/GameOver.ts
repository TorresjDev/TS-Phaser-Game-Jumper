import { Scene } from "phaser";
import { addLeaderboardScore, loadLeaderboard, ScoreEntry } from "../config/leaderboard";

export class GameOver extends Scene {
	constructor() {
		super("GameOver");
	}

	create(): void {
		const { width, height } = this.scale;
		const finalScore = Number(this.registry.get("lastScore") ?? 0);
		const bestScore = Number(this.registry.get("bestScore") ?? 0);
		const leaderboard = this.saveAndGetLeaderboard(finalScore);

		this.cameras.main.setBackgroundColor(0xff0000);
		this.add.image(width / 2, height / 2, "background").setAlpha(0.5);
		this.add
			.text(width / 2, height * 0.18, "Game Over", {
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(width / 2, height * 0.33, `Score: ${finalScore}\nBest: ${bestScore}`, {
				fontFamily: "Arial",
				fontSize: 32,
				color: "#ffffff",
				align: "center",
				stroke: "#000000",
				strokeThickness: 6,
			})
			.setOrigin(0.5);
		this.add
			.text(
				width / 2,
				height * 0.56,
				leaderboard
					.slice(0, 5)
					.map((entry, idx) => `${idx + 1}. ${entry.initials} - ${entry.score}`)
					.join("\n") || "No scores yet",
				{
					fontFamily: "Courier New",
					fontSize: 26,
					color: "#fffde7",
					align: "center",
					stroke: "#000000",
					strokeThickness: 4,
				}
			)
			.setOrigin(0.5);

		this.setupNavigation();
	}

	private setupNavigation(): void {
		const { width, height } = this.scale;
		const buttonY = height * 0.86;
		const buttonW = 210;
		const buttonH = 66;
		const gap = 18;
		const startX = width / 2 - buttonW - gap;

		const playAgainButton = this.add
			.rectangle(startX, buttonY, buttonW, buttonH, 0xe74c3c)
			.setStrokeStyle(3, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		const mainMenuButton = this.add
			.rectangle(width / 2, buttonY, buttonW, buttonH, 0x6d4c41)
			.setStrokeStyle(3, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		const leaderboardButton = this.add
			.rectangle(startX + (buttonW + gap) * 2, buttonY, buttonW, buttonH, 0x00695c)
			.setStrokeStyle(3, 0xffffff)
			.setInteractive({ cursor: "pointer" });

		this.add
			.text(playAgainButton.x, buttonY, "PLAY AGAIN", {
				fontFamily: "Arial Black",
				fontSize: 24,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		this.add
			.text(mainMenuButton.x, buttonY, "MAIN MENU", {
				fontFamily: "Arial Black",
				fontSize: 22,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		this.add
			.text(leaderboardButton.x, buttonY, "LEADERBOARD", {
				fontFamily: "Arial Black",
				fontSize: 20,
				color: "#ffffff",
			})
			.setOrigin(0.5);

		playAgainButton.on("pointerdown", () => this.scene.start("Game"));
		mainMenuButton.on("pointerdown", () => this.scene.start("MainMenu"));
		leaderboardButton.on("pointerdown", () => this.scene.start("Leaderboard"));
	}

	private saveAndGetLeaderboard(finalScore: number): ScoreEntry[] {
		const current = this.loadLeaderboard();
		if (finalScore <= 0) {
			return current;
		}

		const initials = this.requestInitials();
		return addLeaderboardScore(initials, finalScore);
	}

	private loadLeaderboard(): ScoreEntry[] {
		return loadLeaderboard();
	}

	private requestInitials(): string {
		const raw = window.prompt("Enter 3-character initials for the leaderboard:", "AAA") ?? "AAA";
		const normalized = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
		if (!normalized) {
			return "AAA";
		}
		return normalized.padEnd(3, "A");
	}
}
