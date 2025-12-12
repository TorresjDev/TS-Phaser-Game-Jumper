export class MobileControls {
	private scene: Phaser.Scene;
	private leftButton: Phaser.GameObjects.Graphics;
	private rightButton: Phaser.GameObjects.Graphics;
	private jumpButton: Phaser.GameObjects.Graphics;
	
	// State
	private leftPressed: boolean = false;
	private rightPressed: boolean = false;
	private jumpPressed: boolean = false;
	
	// Configuration
	private readonly BUTTON_SIZE = 80;
	private readonly MARGIN = 20;
	private readonly BUTTON_COLOR = 0x444444;
	private readonly BUTTON_ALPHA = 0.5;
	private readonly BUTTON_PRESSED_COLOR = 0x666666;
	private readonly BUTTON_PRESSED_ALPHA = 0.8;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.createControls();
		this.setupInputHandlers();
		
		// Listen for resize events
		this.scene.scale.on('resize', this.handleResize, this);
	}

	private createControls(): void {
		// Create graphics objects if they don't exist
		if (!this.leftButton) this.leftButton = this.scene.add.graphics();
		if (!this.rightButton) this.rightButton = this.scene.add.graphics();
		if (!this.jumpButton) this.jumpButton = this.scene.add.graphics();

		// Set initial positions and draw
		this.updateLayout();

		// Set properties common to all buttons
		[this.leftButton, this.rightButton, this.jumpButton].forEach(btn => {
			btn.setScrollFactor(0);
			btn.setDepth(1000);
		});
	}

	private updateLayout(): void {
		const { width, height } = this.scene.scale;
		
		// Position Left settings
		const leftX = this.MARGIN;
		const leftY = height - this.BUTTON_SIZE - this.MARGIN;
		
		// Position Right settings
		const rightX = this.MARGIN + this.BUTTON_SIZE + 10;
		const rightY = height - this.BUTTON_SIZE - this.MARGIN;

		// Position Jump settings
		const jumpX = width - this.BUTTON_SIZE - this.MARGIN;
		const jumpY = height - this.BUTTON_SIZE - this.MARGIN;

		// Draw logic
		this.drawButton(this.leftButton, leftX, leftY, this.leftPressed, 'left');
		this.drawButton(this.rightButton, rightX, rightY, this.rightPressed, 'right');
		this.drawButton(this.jumpButton, jumpX, jumpY, this.jumpPressed, 'jump');

		// Update hit areas
		const shape = new Phaser.Geom.Rectangle(0, 0, this.BUTTON_SIZE, this.BUTTON_SIZE);
		this.leftButton.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
		// Update position of hit area by setting the graphics active position
		// Note: Graphics.setPosition moves the whole graphics context.
		this.leftButton.setPosition(leftX, leftY);
		
		this.rightButton.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
		this.rightButton.setPosition(rightX, rightY);
		
		this.jumpButton.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
		this.jumpButton.setPosition(jumpX, jumpY);
	}

	private drawButton(
		graphics: Phaser.GameObjects.Graphics, 
		x: number, // x and y are not used for drawing relative to 0,0 of the graphics object
		y: number, 
		isPressed: boolean, 
		type: 'left' | 'right' | 'jump'
	): void {
		graphics.clear();

		// Background
		graphics.fillStyle(isPressed ? this.BUTTON_PRESSED_COLOR : this.BUTTON_COLOR, isPressed ? this.BUTTON_PRESSED_ALPHA : this.BUTTON_ALPHA);
		graphics.fillRoundedRect(0, 0, this.BUTTON_SIZE, this.BUTTON_SIZE, 10);

		// Icon
		graphics.fillStyle(0xffffff, 0.9);
		
		const cx = this.BUTTON_SIZE / 2;
		const cy = this.BUTTON_SIZE / 2;
		const arrowSize = this.BUTTON_SIZE * 0.4;

		if (type === 'left') {
			graphics.fillTriangle(
				cx + arrowSize * 0.3, cy - arrowSize * 0.5,
				cx + arrowSize * 0.3, cy + arrowSize * 0.5,
				cx - arrowSize * 0.4, cy
			);
		} else if (type === 'right') {
			graphics.fillTriangle(
				cx - arrowSize * 0.3, cy - arrowSize * 0.5,
				cx - arrowSize * 0.3, cy + arrowSize * 0.5,
				cx + arrowSize * 0.4, cy
			);
		} else if (type === 'jump') {
			// Up arrow
			graphics.fillTriangle(
				cx - arrowSize * 0.5, cy + arrowSize * 0.3,
				cx + arrowSize * 0.5, cy + arrowSize * 0.3,
				cx, cy - arrowSize * 0.4
			);
		}
	}

	private setupInputHandlers(): void {
		// Use a helper to clean up repetitive code
		this.bindButtonEvents(this.leftButton, () => {
			this.leftPressed = true;
			this.leftButton.clear(); // Clear before redraw
			this.updateLayout(); // Or just redraw specific button for perf, but layout is cheap here
		}, () => {
			this.leftPressed = false;
			this.updateLayout();
		});

		this.bindButtonEvents(this.rightButton, () => {
			this.rightPressed = true;
			this.updateLayout();
		}, () => {
			this.rightPressed = false;
			this.updateLayout();
		});

		this.bindButtonEvents(this.jumpButton, () => {
			this.jumpPressed = true;
			this.updateLayout();
		}, () => {
			this.jumpPressed = false;
			this.updateLayout();
		});
	}

	private bindButtonEvents(gameObj: Phaser.GameObjects.GameObject, onDown: () => void, onUp: () => void): void {
		gameObj.on('pointerdown', onDown);
		gameObj.on('pointerup', onUp);
		gameObj.on('pointerout', onUp); // Treat leaving the button as releasing it
	}

	private handleResize(gameSize: Phaser.Structs.Size): void {
		this.updateLayout();
	}

	// Public API for Game Scene
	public get isLeft(): boolean { return this.leftPressed; }
	public get isRight(): boolean { return this.rightPressed; }
	public get isJump(): boolean { return this.jumpPressed; }

	public destroy(): void {
		this.scene.scale.off('resize', this.handleResize, this);
		this.leftButton.destroy();
		this.rightButton.destroy();
		this.jumpButton.destroy();
	}
}

