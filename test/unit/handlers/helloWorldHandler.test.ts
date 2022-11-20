import * as helloWorldHandler from '../../../src/handlers/helloWorldHandler';

test('sample UT', () => {
    const response = helloWorldHandler.handler();
    expect(response).toEqual('hoge');
});
    