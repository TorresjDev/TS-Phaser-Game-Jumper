export interface ScoreEntry {
	initials: string;
	score: number;
	createdAt: string;
}

const LEADERBOARD_KEY = "jumper.leaderboard.v1";

export function loadLeaderboard(): ScoreEntry[] {
	try {
		const raw = localStorage.getItem(LEADERBOARD_KEY);
		if (!raw) {
			return [];
		}
		const parsed = JSON.parse(raw) as Array<Partial<ScoreEntry>>;
		return parsed
			.filter((entry) => typeof entry.initials === "string" && typeof entry.score === "number")
			.map((entry) => ({
				initials: entry.initials as string,
				score: entry.score as number,
				createdAt:
					typeof entry.createdAt === "string" && entry.createdAt.length > 0
						? entry.createdAt
						: new Date().toISOString(),
			}));
	} catch {
		return [];
	}
}

export function saveLeaderboard(entries: ScoreEntry[]): void {
	localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

export function addLeaderboardScore(initials: string, score: number): ScoreEntry[] {
	const current = loadLeaderboard();
	const next = [...current, { initials, score, createdAt: new Date().toISOString() }]
		.sort((a, b) => b.score - a.score)
		.slice(0, 10);
	saveLeaderboard(next);
	return next;
}
