import {Config} from "@src/Config";

describe('Config', () => {
	describe('External', () => {
		it('without name', () => {
			expect(Config.External.toLoaderConfig('foo'))
				.toEqual({
					loader: 'foo',
					options: undefined
				});
		});

		it('with name', () => {
			expect(Config.External.toLoaderConfig('foo:name'))
				.toEqual({
					loader: 'foo',
					options: 'name'
				});
		});

		it('simple loader object', () => {
			const external = {
				loader: 'foo'
			};
			expect(Config.External.toLoaderConfig(external))
				.toBe(external);
		});
		it('simple loader object', () => {
			const external = {
				loader: 'foo',
				options: 'name'
			};
			expect(Config.External.toLoaderConfig(external))
				.toBe(external);
		});
	});
});
