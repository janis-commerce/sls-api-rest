'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const { Dispatcher } = require('@janiscommerce/api');

const { SlsApiRest } = require('../lib');

describe('SlsApiRest', () => {

	describe('getDispatcher', () => {

		const validParams = {
			endpoint: 'some-entity/1/sub-entity/2',
			method: 'post',
			headers: {
				'x-foo': 'bar'
			},
			cookies: {
				someCookie: 'baz'
			},
			authenticationData: {
				clientId: 1,
				clientCode: 'fizzmod'
			}
		};

		it('Should throw when correct params are not given', () => {
			assert.throws(() => SlsApiRest.getDispatcher());
			assert.throws(() => SlsApiRest.getDispatcher('Invalid'));
			assert.throws(() => SlsApiRest.getDispatcher({}));

			assert.throws(() => SlsApiRest.getDispatcher({
				...validParams,
				endpoint: ['invalid']
			}));

			assert.throws(() => SlsApiRest.getDispatcher({
				...validParams,
				method: ['invalid']
			}));

			assert.throws(() => SlsApiRest.getDispatcher({
				...validParams,
				headers: ['invalid']
			}));

			assert.throws(() => SlsApiRest.getDispatcher({
				...validParams,
				cookies: ['invalid']
			}));

			assert.throws(() => SlsApiRest.getDispatcher({
				...validParams,
				authenticationData: ['invalid']
			}));
		});

		it('Should return a Dispatcher instance when correct params are given', () => {

			const dispatcher = SlsApiRest.getDispatcher(validParams);

			assert(dispatcher instanceof Dispatcher);
		});

	});

	describe('Handler', () => {

		afterEach(() => {
			sandbox.restore();
		});

		it('Should return an error if requestPath is not defined', async () => {

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');

			await SlsApiRest.handler({});

			sandbox.assert.notCalled(getDispatcherStub);
			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 500,
				body: {
					message: sandbox.match.string
				}
			});
		});

		it('Should pass the default http method (get) to the Dispatcher', async () => {

			sandbox.stub(ApiResponse, 'send');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2'
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});
		});

		it('Should pass the parsed cookies (in lower case) to the Dispatcher', async () => {

			sandbox.stub(ApiResponse, 'send');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				headers: {
					cookie: 'foo=bar'
				}
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {
					cookie: 'foo=bar'
				},
				cookies: {
					foo: 'bar'
				},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});
		});

		it('Should pass the parsed cookies (in upper case) to the Dispatcher', async () => {

			sandbox.stub(ApiResponse, 'send');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				headers: {
					Cookie: 'foo=bar'
				}
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {
					Cookie: 'foo=bar'
				},
				cookies: {
					foo: 'bar'
				},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});
		});

		it('Should replace the path variables in the endpoint', async () => {

			sandbox.stub(ApiResponse, 'send');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			await SlsApiRest.handler({
				requestPath: '/some-entity/{entityId}/sub-entity/{subEntityId}',
				path: {
					entityId: 1,
					subEntityId: 2
				}
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});
		});

		it('Should trim the first slash in the endpoint', async () => {

			sandbox.stub(ApiResponse, 'send');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			await SlsApiRest.handler({
				requestPath: '/some-entity'
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity',
				method: 'get',
				headers: {},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});
		});

		it('Should pass the request arguments (with querystring) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				},
				extraProp: 'more foo'
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				headers: {
					'x-foo': 'bar'
				},
				query: {
					sortBy: 'id',
					sortDirection: 'asc'
				}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {
					sortBy: 'id',
					sortDirection: 'asc'
				},
				rawData: undefined,
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (with querystring and multiple sort) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				},
				extraProp: 'more foo'
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				headers: {
					'x-foo': 'bar'
				},
				query: {
					filters: {
						name: ['foo', 'bar']
					},
					sortBy: ['name', 'id'],
					sortDirection: [, 'asc']
				}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {
					filters: {
						name: ['foo', 'bar']
					},
					sortBy: ['name', 'id'],
					sortDirection: [,'asc']
				},
				rawData: undefined,
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (without querystring) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				},
				extraProp: 'more foo'
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				headers: {
					'x-foo': 'bar'
				}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'get',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (with body) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				},
				extraProp: 'more foo'
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const body = {
				someProp: 'baz'
			};

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				body,
				rawBody: JSON.stringify(body)
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: body,
				rawData: JSON.stringify(body),
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (without body) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				},
				extraProp: 'more foo'
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (without authentication data) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				authorizer: {}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should pass the request arguments (with authentication data) to the Dispatcher and map the dispatcher result', async () => {

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.resolves({
				code: 200,
				body: {
					foo: 'bar'
				}
			});

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'send');
			apiResponseStub.returns('the actual response');

			const apiResponse = await SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				authorizer: {
					janisAuth: JSON.stringify({
						clientId: 1,
						clientCode: 'fizzmod'
					})
				}
			});

			assert.deepStrictEqual(apiResponse, 'the actual response');

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: {},
				rawData: undefined,
				authenticationData: {
					clientId: 1,
					clientCode: 'fizzmod'
				}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, {
				clientCode: 'fizzmod',
				statusCode: 200,
				body: {
					foo: 'bar'
				},
				headers: undefined,
				cookies: undefined
			});
		});

		it('Should return an error if the Dispatcher throws', async () => {

			const apiError = new Error('Some error');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);

			dispatcherStub.dispatch.throws(apiError);

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'sendError');
			apiResponseStub.throws(apiError);

			const body = {
				someProp: 'baz'
			};

			await assert.rejects(() => SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				body,
				rawBody: JSON.stringify(body)
			}), {
				message: apiError.message
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: body,
				rawData: JSON.stringify(body),
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, apiError, undefined);
		});

		it('Should return an error with the client code if the Dispatcher throws with a client', async () => {

			const apiError = new Error('Some error');

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);

			dispatcherStub.dispatch.throws(apiError);

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'sendError');
			apiResponseStub.throws(apiError);

			const body = {
				someProp: 'baz'
			};

			await assert.rejects(() => SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				body,
				rawBody: JSON.stringify(body),
				authorizer: {
					janisAuth: JSON.stringify({
						clientId: 1,
						clientCode: 'fizzmod'
					})
				}
			}), {
				message: apiError.message
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: body,
				rawData: JSON.stringify(body),
				authenticationData: {
					clientId: 1,
					clientCode: 'fizzmod'
				}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, apiError, 'fizzmod');
		});

		it('Should return an error with a custom statusCode if the Dispatcher throws with a code', async () => {

			const apiError = new Error('Some error');
			apiError.code = 503;

			const dispatcherStub = sandbox.stub(Dispatcher.prototype);
			dispatcherStub.dispatch.throws(apiError);

			const getDispatcherStub = sandbox.stub(SlsApiRest, 'getDispatcher');
			getDispatcherStub.returns(dispatcherStub);

			const apiResponseStub = sandbox.stub(ApiResponse, 'sendError');
			apiResponseStub.throws(apiError);

			const body = {
				someProp: 'baz'
			};

			await assert.rejects(() => SlsApiRest.handler({
				requestPath: '/some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				body,
				rawBody: JSON.stringify(body)
			}), {
				message: apiError.message
			});

			sandbox.assert.calledOnce(getDispatcherStub);
			sandbox.assert.calledWithExactly(getDispatcherStub, {
				endpoint: 'some-entity/1/sub-entity/2',
				method: 'post',
				headers: {
					'x-foo': 'bar'
				},
				cookies: {},
				data: body,
				rawData: JSON.stringify(body),
				authenticationData: {}
			});

			sandbox.assert.calledOnce(dispatcherStub.dispatch);

			sandbox.assert.calledOnceWithExactly(apiResponseStub, apiError, undefined);
		});
	});

});
