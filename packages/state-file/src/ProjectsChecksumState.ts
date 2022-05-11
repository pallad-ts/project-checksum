import * as path from "path";
import {ERRORS} from "./errors";

export class ProjectsChecksumState {
	private state?: ProjectsChecksumState.State;

	constructor(readonly projectsConfig: Map<string, ProjectsChecksumState.ProjectConfig>) {

	}

	private assertProjectConfig(name: string) {
		const config = this.projectsConfig.get(name);
		if (!config) {
			throw ERRORS.NO_PROJECT_FOUND.format(name);
		}
		return config;
	}

	getChecksumFromFile(projectName: string) {

	}

	computeChecksum(projectName: string) {

	}

	getChecksumFromFileOrCompute(projectName: string) {

	}

	saveToFile(filePath: string) {

	}
}

export namespace ProjectsChecksumState {
	export type State = Map<string, string>;

	export interface ProjectConfig {
		directory: string;
		configFile?: string;
	}
}
