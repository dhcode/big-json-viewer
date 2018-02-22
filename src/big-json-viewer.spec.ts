import {BigJsonViewer} from './big-json-viewer';

describe('Big JSON Viewer', function () {
    it('should instantiate', function () {
        const instance = new BigJsonViewer('{}');
        expect(instance).toBeTruthy();
    });

});

