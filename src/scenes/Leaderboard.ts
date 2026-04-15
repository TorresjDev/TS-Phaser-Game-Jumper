import { Scene } from "phaser";
import { loadLeaderboard } from "../config/leaderboard";

export class Leaderboard extends Scene {
	constructor() {
		super("Leaderboard");
	}

	create(): void {
		const { width, height } = this.scale;
		this.add.image(width / 2, height / 2, "background").setAlpha(0.6);

		this.add
			.text(width / 2, 80, "LEADERBOARD", {
				fontFamily: "Arial Black",
				fontSize: 52,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
			})
			.setOrigin(0.5);

		const board = this.add
			.rectangle(width / 2, height / 2 + 10, 760, 520, 0x001122, 0.88)
			.setStrokeStyle(3, 0xffffff);

		const rows = loadLeaderboard().slice(0, 10);
		const listText = rows.length
			? rows
					.map((entry, idx) => {
						const date = new Date(entry.createdAt);
						const dateText = Number.isNaN(date.getTime())
							? "-"
							: date.toLocaleDateString(undefined, {
									year: "numeric",
									month: "short",
									day: "numeric",
								});
						return `${String(idx + 1).padStart(2, "0")}  ${entry.initials.padEnd(3, " ")}   ${String(
							entry.score
						).padStart(4, " ")}   ${dateText}`;
					})
					.join("\n")
			: "No leaderboard entries yet.\nFinish a run to create the first score.";

		this.add
			.text(width / 2, height / 2 + 10, listText, {
				fontFamily: "Courier New",
				fontSize: 28,
				color: "#fffde7",
				align: "center",
				stroke: "#000000",
				strokeThickness: 4,
				lineSpacing: 10,
			})
			.setOrigin(0.5);

		this.add
			.text(width / 2, height / 2 - 205, "#  TAG  SCORE  DATE", {
				fontFamily: "Courier New",
				fontSize: 24,
				color: "#90caf9",
				stroke: "#000000",
				strokeThickness: 3,
			})
			.setOrigin(0.5);

		const backButton = this.add
			.rectangle(width / 2, height - 72, 260, 66, 0x2e7d32)
			.setStrokeStyle(3, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		this.add
			.text(width / 2, height - 72, "BACK TO MENU", {
				fontFamily: "Arial Black",
				fontSize: 26,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		backButton.on("pointerdown", () => this.scene.start("MainMenu"));

		const closeButton = this.add
			.rectangle(board.x + board.width / 2 - 24, board.y - board.height / 2 + 24, 36, 36, 0xd32f2f)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		this.add
			.text(closeButton.x, closeButton.y, "X", {
				fontFamily: "Arial Black",
				fontSize: 22,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		closeButton.on("pointerdown", () => this.scene.start("MainMenu"));
	}
}
