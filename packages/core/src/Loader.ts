import {Dependency} from "./Dependency";
import {ConfigLoader} from "./ConfigLoader";

export interface Loader<TOptions> {
	load(context: Loader.Context, options: TOptions): Promise<Loader.Result> | Loader.Result;
}

export namespace Loader {
	export function getLoader(name: string) {
		
	}

	export interface Context {
		configLoader: ConfigLoader;
	}

	export type Result = Dependency | Dependency[];
}
