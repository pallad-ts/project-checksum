import {StateGenerator} from "./StateGenerator";
import {StateFile} from "./StateFile";
import {LoadingStrategy, State} from "./types";
import {ERRORS} from "./errors";

export class StateManager {
	constructor(private stateFile: string, private stateGenerator: StateGenerator) {

	}

	async generateFile() {
		const state = await this.stateGenerator.computeState();
		await StateFile.save(this.stateFile, state);
		return state;
	}

	async computeProjectsChecksums(projectNames: string[]) {
		const map = new Map<string, string>();

		await Promise.all(projectNames.map(
			async projectName => {
				const checksum = await this.stateGenerator.computeChecksum(projectName);
				map.set(projectName, checksum);
			}
		))
		return map;
	}

	async getChecksums(strategy: LoadingStrategy, projectNames?: string[]): Promise<Map<string, string>> {
		if (strategy === 'only-state') {
			const state = await StateFile.load(this.stateFile);
			if (state.isNone()) {
				throw ERRORS.STATE_FILE_NOT_FOUND.format(this.stateFile);
			}
			return filterState(state.some(), projectNames);
		} else if (strategy === 'only-compute') {
			if (projectNames) {
				return this.computeProjectsChecksums(projectNames);
			}
			return this.stateGenerator.computeState();
		}

		const state = await StateFile.load(this.stateFile);
		if (state.isNone()) {
			if (projectNames) {
				return this.computeProjectsChecksums(projectNames);
			}
			return this.stateGenerator.computeState();
		}
		return filterState(state.some(), projectNames);
	}
}

function filterState(state: Map<string, string>, projectNames?: string[]) {
	if (projectNames) {
		return new Map(
			Array.from(state.entries())
				.filter(([x]) => projectNames.includes(x))
		);
	}
	return state;
}
