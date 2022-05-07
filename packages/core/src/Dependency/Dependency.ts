import {Encoding} from "crypto";

export interface Dependency {
	getContent(): Dependency.ContentGenerator;
}

export namespace Dependency {
	export type ContentGenerator = Generator<Content, void, undefined> | AsyncGenerator<Content, void, undefined> | Promise<Content> | Content;
	export type Content = Buffer | readonly [string, Encoding];
}
