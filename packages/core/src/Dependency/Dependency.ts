import {Encoding} from "crypto";

export interface Dependency {
	getContent(): Dependency.ContentGenerator;
}

export namespace Dependency {
	export type ContentGenerator = Generator<Content, void, never> | AsyncGenerator<Content, void, never>;
	export type Content = Buffer | [string, Encoding];
}
