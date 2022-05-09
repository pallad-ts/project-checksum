import {Dependency} from "./Dependency";
import {ConfigLoader} from "./ConfigLoader";

export interface Loader<TOptions> {
	load(context: Loader.Context, options: TOptions): Promise<Loader.Result> | Loader.Result;
}

export namespace Loader {
	export interface Context extends ConfigLoader.Context {
		configLoader: ConfigLoader;
		directory: string;
	}

	export type Result = Dependency | Dependency[];
}
