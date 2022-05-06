import {Dependency} from "./Dependency";
import * as fs from 'fs';
import {matcher} from 'micromatch';
import {filesystemIterator} from "@pallad/filesystem-iterator";
import * as path from "path";

export class FilesPatternsDependency implements Dependency {
	private options: FilesPatternsDependency.Options
	static DEFAULT_OPTIONS = {
		highWaterMark: 256 * 1024
	}

	constructor(readonly patterns: string[], readonly cwd: string, options?: FilesPatternsDependency.Options) {
		this.options = {...FilesPatternsDependency.DEFAULT_OPTIONS, ...options || {}};
	}

	async* getContent() {
		for await (const file of this.getFilesIterator()) {
			yield* fs.createReadStream(file, this.options);
		}
	}

	private getFilesIterator() {
		const matchers = this.patterns.map(x => matcher(x));
		const filter = (name: string) => {
			const filePath = path.relative(this.cwd, name);
			return matchers.some(isMatch => isMatch(filePath))
		}
		return filesystemIterator(this.cwd, {
			filter,
			skipDirectories: true
		});
	}
}

export namespace FilesPatternsDependency {
	export interface Options {
		highWaterMark?: number;
	}
}
