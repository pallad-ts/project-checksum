import {ERRORS} from "./errors";
import {ProjectConfig, State} from "./types";
import {ConfigLoader, Project} from "@pallad/project-checksum-core";

export class StateGenerator {
	constructor(private projectsConfig: Map<string, ProjectConfig>,
				private projectConfigLoader: ConfigLoader) {

	}

	private assertProjectConfig({name}: { name: string }) {
		const config = this.projectsConfig.get(name);
		if (!config) {
			throw ERRORS.NO_PROJECT_FOUND.format(name);
		}
		return config;
	}

	async computeChecksum(projectName: string) {
		const config = this.assertProjectConfig({name: projectName});
		const project = await this.getProjectForConfig(config);

		return project.computeChecksum();
	}

	private getProjectForConfig(config: ProjectConfig): Promise<Project> {
		if (config.configFile) {
			return this.projectConfigLoader.loadProjectFromFile({
				rootDir: config.directory,
				filePath: config.configFile
			});
		}
		return this.projectConfigLoader.loadProjectFromDirectory(config.directory);
	}

	async computeState(): Promise<State> {
		const state = new Map<string, string>();
		await Promise.all(
			Array.from(this.projectsConfig.keys())
				.map(async projectName => {
					state.set(
						projectName,
						await this.computeChecksum(projectName)
					);
				})
		);
		return state;
	}
}
