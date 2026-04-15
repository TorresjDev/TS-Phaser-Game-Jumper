import { Scene } from "phaser";
import {
	formatLives,
	formatVolume,
	GameSettings,
	loadSettings,
	nextLivesOption,
	saveSettings,
} from "../config/settings";

export class MainMenu extends Scene {
	private settings!: GameSettings;
	private settingsPanel?: Phaser.GameObjects.Container;

	constructor() {
		super("MainMenu");
	}

	create(): void {
		this.settings = loadSettings();
		this.registry.set("settings", this.settings);

		const { width, height } = this.scale;

		// Background - centered and scaled to cover if needed, or just placed
		const bg = this.add.image(width / 2, height / 2, "background");
		// Simple cover logic if we want responsiveness
		const scaleX = width / bg.width;
		const scaleY = height / bg.height;
		const scale = Math.max(scaleX, scaleY);
		bg.setScale(scale).setScrollFactor(0);

		// Header
		this.add.image(width / 2, height * 0.26, "logo").setScale(0.28);
		this.add
			.text(width / 2, height * 0.46, "READY TO JUMP?", {
				fontFamily: "Arial Black",
				fontSize: 38,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.createMenuButtons();

		this.setupNavigation();
	}

	private createMenuButtons(): void {
		const { width, height } = this.scale;
		const startY = height * 0.67;
		const gap = 88;

		const startButton = this.createMenuButton(width / 2, startY, "START GAME", 0x4a90e2);
		startButton.on("pointerdown", () => this.scene.start("Game"));

		const leaderboardButton = this.createMenuButton(width / 2, startY + gap, "LEADERBOARD", 0x00695c);
		leaderboardButton.on("pointerdown", () => this.scene.start("Leaderboard"));

		const settingsButton = this.createMenuButton(width / 2, startY + gap * 2, "SETTINGS", 0x6d4c41);
		settingsButton.on("pointerdown", () => this.toggleSettingsPanel());
	}

	private createMenuButton(x: number, y: number, label: string, color: number): Phaser.GameObjects.Rectangle {
		const button = this.add
			.rectangle(x, y, 340, 70, color)
			.setStrokeStyle(4, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		this.add
			.text(x, y, label, {
				fontFamily: "Arial Black",
				fontSize: 34,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		return button;
	}

	private setupNavigation(): void {
		this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("Game"));
	}

	private toggleSettingsPanel(): void {
		if (this.settingsPanel) {
			this.hideSettingsPanel();
			return;
		}

		const { width, height } = this.scale;
		const panelBg = this.add.rectangle(width / 2, height / 2, 700, 420, 0x000000, 0.85).setStrokeStyle(3, 0xffffff);
		const title = this.add
			.text(width / 2, height / 2 - 150, "SETTINGS", {
				fontFamily: "Arial Black",
				fontSize: 40,
				color: "#ffffff",
			})
			.setOrigin(0.5);

		const wrapText = this.add
			.text(width / 2, height / 2 - 56, `EDGE WRAP: ${this.settings.edgeWrapEnabled ? "ON" : "OFF"}`, {
				fontFamily: "Arial",
				fontSize: 28,
				color: "#ffffff",
			})
			.setOrigin(0.5)
			.setInteractive({ cursor: "pointer" });

		const volumeText = this.add
			.text(width / 2, height / 2 - 5, `VOLUME: ${formatVolume(this.settings.sfxVolume)}`, {
				fontFamily: "Arial",
				fontSize: 28,
				color: "#90caf9",
			})
			.setOrigin(0.5);

		const sliderY = height / 2 + 29;
		const sliderWidth = 280;
		const sliderLeft = width / 2 - sliderWidth / 2;
		const sliderRight = width / 2 + sliderWidth / 2;
		const sliderTrack = this.add.rectangle(width / 2, sliderY, sliderWidth, 8, 0xffffff, 0.35);
		const sliderFill = this.add
			.rectangle(sliderLeft, sliderY, sliderWidth * this.settings.sfxVolume, 8, 0x90caf9, 0.9)
			.setOrigin(0, 0.5);
		const sliderHandle = this.add
			.circle(sliderLeft + sliderWidth * this.settings.sfxVolume, sliderY, 12, 0xffffff, 0.95)
			.setStrokeStyle(2, 0x1e88e5)
			.setInteractive({ cursor: "pointer", draggable: true });
		this.input.setDraggable(sliderHandle);

		const livesText = this.add
			.text(width / 2, height / 2 + 112, `${formatLives(this.settings.startingLives)}`, {
				fontFamily: "Arial",
				fontSize: 28,
				color: "#a5d6a7",
			})
			.setOrigin(0.5);
		const livesLabel = this.add
			.text(width / 2, height / 2 + 82, "STARTING LIVES", {
				fontFamily: "Arial Black",
				fontSize: 22,
				color: "#a5d6a7",
			})
			.setOrigin(0.5);
		const livesPrev = this.add
			.rectangle(width / 2 - 130, height / 2 + 112, 52, 46, 0x2e7d32)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		const livesNext = this.add
			.rectangle(width / 2 + 130, height / 2 + 112, 52, 46, 0x2e7d32)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive({ cursor: "pointer" });
		const livesPrevText = this.add
			.text(livesPrev.x, livesPrev.y, "-", {
				fontFamily: "Arial Black",
				fontSize: 28,
				color: "#ffffff",
			})
			.setOrigin(0.5);
		const livesNextText = this.add
			.text(livesNext.x, livesNext.y, "+", {
				fontFamily: "Arial Black",
				fontSize: 28,
				color: "#ffffff",
			})
			.setOrigin(0.5);

		const hint = this.add
			.text(width / 2, height / 2 + 164, "Use slider and +/- controls.", {
				fontFamily: "Arial",
				fontSize: 16,
				color: "#cfd8dc",
			})
			.setOrigin(0.5);

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
		closeButton.on("pointerdown", () => this.hideSettingsPanel());

		wrapText.on("pointerdown", () => {
			this.settings.edgeWrapEnabled = !this.settings.edgeWrapEnabled;
			wrapText.setText(`EDGE WRAP: ${this.settings.edgeWrapEnabled ? "ON" : "OFF"}`);
			this.persistSettings();
		});

		sliderHandle.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => {
			const clampedX = Phaser.Math.Clamp(dragX, sliderLeft, sliderRight);
			sliderHandle.x = clampedX;
			const ratio = (clampedX - sliderLeft) / sliderWidth;
			this.settings.sfxVolume = Number(ratio.toFixed(2));
			sliderFill.width = sliderWidth * this.settings.sfxVolume;
			volumeText.setText(`VOLUME: ${formatVolume(this.settings.sfxVolume)}`);
			this.persistSettings();
		});

		const changeLives = (): void => {
			this.settings.startingLives = nextLivesOption(this.settings.startingLives);
			livesText.setText(formatLives(this.settings.startingLives));
			livesText.setFontSize(this.settings.startingLives < 0 ? 24 : 28);
			this.persistSettings();
		};
		livesPrev.on("pointerdown", changeLives);
		livesNext.on("pointerdown", changeLives);

		this.settingsPanel = this.add.container(0, 0, [
			panelBg,
			title,
			wrapText,
			volumeText,
			sliderTrack,
			sliderFill,
			sliderHandle,
			livesLabel,
			livesText,
			livesPrev,
			livesNext,
			livesPrevText,
			livesNextText,
			hint,
			closeButton,
			closeText,
		]);
	}

	private persistSettings(): void {
		this.settings.sfxEnabled = this.settings.sfxVolume > 0;
		saveSettings(this.settings);
		this.registry.set("settings", this.settings);
	}

	private hideSettingsPanel(): void {
		this.settingsPanel?.destroy();
		this.settingsPanel = undefined;
	}
}
