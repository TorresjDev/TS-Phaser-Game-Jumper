export interface GameSettings {
	sfxEnabled: boolean;
	sfxVolume: number;
	edgeWrapEnabled: boolean;
	startingLives: number;
}

export const LIVES_OPTIONS = [1, 3, 5, -1] as const;

const STORAGE_KEY = "jumper.settings.v1";

export const DEFAULT_SETTINGS: GameSettings = {
	sfxEnabled: true,
	sfxVolume: 0.8,
	edgeWrapEnabled: true,
	startingLives: 3,
};

export function formatLives(value: number): string {
	return value < 0 ? "Unlimited" : String(value);
}

export function nextLivesOption(current: number): number {
	const idx = LIVES_OPTIONS.findIndex((value) => value === current);
	const nextIdx = idx >= 0 ? (idx + 1) % LIVES_OPTIONS.length : 0;
	return LIVES_OPTIONS[nextIdx];
}

export function nextVolumeOption(current: number): number {
	const steps = [0, 0.25, 0.5, 0.75, 1];
	const rounded = Math.round(current * 100) / 100;
	const idx = steps.findIndex((value) => value === rounded);
	const nextIdx = idx >= 0 ? (idx + 1) % steps.length : 0;
	return steps[nextIdx];
}

export function formatVolume(value: number): string {
	return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

export function loadSettings(): GameSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { ...DEFAULT_SETTINGS };
		}

		const parsed = JSON.parse(raw) as Partial<GameSettings>;
		return {
			sfxEnabled: parsed.sfxEnabled ?? DEFAULT_SETTINGS.sfxEnabled,
			sfxVolume:
				typeof parsed.sfxVolume === "number"
					? Math.max(0, Math.min(1, parsed.sfxVolume))
					: DEFAULT_SETTINGS.sfxVolume,
			edgeWrapEnabled: parsed.edgeWrapEnabled ?? DEFAULT_SETTINGS.edgeWrapEnabled,
			startingLives:
				typeof parsed.startingLives === "number"
					? parsed.startingLives
					: DEFAULT_SETTINGS.startingLives,
		};
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}

export function saveSettings(settings: GameSettings): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
