import {getModulesPathsForDirectory} from "@src/getModulesPathForDirectory";

describe('getModulesPathForDirectory', () => {
	it('walks up to root directory', () => {
		expect(getModulesPathsForDirectory('/root/projects/test/alpha/beta'))
			.toMatchSnapshot();
	});
});
