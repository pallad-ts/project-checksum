import {Project} from "../Project";
import {Dependency} from "./Dependency";

export class ProjectDependency implements Dependency {
	constructor(readonly project: Project) {
	}

	async getContent() {
		return [await this.project.computeChecksum(), 'hex'] as const;
	}
}
