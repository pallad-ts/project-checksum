import {Either} from "monet";
import {ERRORS} from "./errors";
import {Loader} from "./Loader";

export class LoadersLoader {
	private loaders = new Map<string, Loader<unknown>>();

	getLoader(name: string): Loader<unknown> {
		if (this.loaders.has(name)) {
			return this.loaders.get(name)!
		}

		const packageNames = [`@pallad/project-checksum-loader-${name}`, name];
		for (const packageName of packageNames) {
			const module = this.tryLoadModule(packageName);
			if (module) {
				const loader = this.createLoaderFromModule(module, packageName);
				this.loaders.set(name, loader);
				return loader;
			}
		}
		throw ERRORS.NO_LOADER_FOUND.format(name);
	}

	private createLoaderFromModule(module: unknown, packageName: string) {
		// eslint-disable-next-line no-null/no-null
		if (typeof module === 'object' && module !== null && 'Loader' in module) {
			const loader = (module as any).Loader;
			if (typeof loader === 'function') {
				return new loader();
			}
		}
		throw ERRORS.NO_LOADER_EXPORTED.format(packageName);
	}

	private tryLoadModule(name: string) {
		return Either.fromTry(() => require(name))
			.cata(
				() => undefined,
				x => x
			);
	}
}
