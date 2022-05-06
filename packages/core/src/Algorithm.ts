export type Algorithm = ElementOf<typeof Algorithm.Values>;

type ElementOf<T extends readonly any[]> = T extends ReadonlyArray<infer ET> ? ET : never;
export namespace Algorithm {
	export const Values = ['sha256', 'md5'] as const;
}
