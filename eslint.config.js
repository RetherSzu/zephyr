import {createRequire} from 'module';
import {existsSync} from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const ignoresPath = path.resolve('./eslint.ignores.js');

let customConfig = [];
if (existsSync(ignoresPath)) {
    const {default: ignores} = await import(ignoresPath);
    customConfig = [{ignores}];
}

export default [
    ...customConfig,
    ...require('gts'),
    {
        files: ['**/*.js'],
        languageOptions: {sourceType: 'module'},
    },
];
