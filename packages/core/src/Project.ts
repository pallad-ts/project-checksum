import {Dependency} from "./Dependency";
import {createHashForAlgorithm} from "./createHashForAlgorithm";
import {Algorithm} from "./Algorithm";
import {ERRORS} from "./errors";

export class Project {
	constructor(readonly config: Project.Config) {
	}

	async computeChecksum(): Promise<string> {
		const hash = createHashForAlgorithm(this.config.algorithm);
		let found = false;
		for (const dependency of this.config.dependencies) {
			const dependencyContent = await dependency.getContent();
			const isRegularContent = Buffer.isBuffer(dependencyContent) || Array.isArray(dependencyContent);
			const finalContent = isRegularContent ? [dependencyContent] : dependencyContent;
			for await (const content of finalContent) {
				if (!content) {
					continue;
				}
				found = true;
				if (Buffer.isBuffer(content)) {
					hash.update(content);
				} else {
					const [string, encoding] = content;
					hash.update(string, encoding);
				}
			}
		}

		if (!found) {
			throw ERRORS.NO_CONTENT_TO_HASH_COMPUTE_FOUND();
		}
		return hash.digest('hex');
	}
}

export namespace Project {
	export interface Config {
		algorithm: Algorithm;
		dependencies: Dependency[],
		rootDirectory: string
	}
}
