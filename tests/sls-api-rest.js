'use strict';

const assert = require('assert');

const sinon = require('sinon');

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const { Dispatcher } = require('@janiscommerce/api');

const Events = require('@janiscommerce/events');

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

		beforeEach(() => {
			sinon.stub(Events, 'emit');
		});

		afterEach(() => {

			sinon.assert.calledOnceWithExactly(Events.emit, 'janiscommerce.ended');

			sinon.restore();
		});

		context('When requestPath is not defined', async () => {

			it('Should return an error', async () => {

				sinon.spy(SlsApiRest, 'getDispatcher');

				sinon.stub(ApiResponse, 'send');

				await SlsApiRest.handler({});

				sinon.assert.notCalled(SlsApiRest.getDispatcher);

				sinon.assert.calledOnceWithExactly(ApiResponse.send, {
					statusCode: 500,
					body: {
						message: sinon.match.string
					}
				});
			});

		});

		context('When requestPath is defined', async () => {

			it('Should pass the default http method (get) to the Dispatcher', async () => {

				sinon.stub(ApiResponse, 'send');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);

				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				await SlsApiRest.handler({
					requestPath: '/some-entity/1/sub-entity/2'
				});

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.stub(ApiResponse, 'send');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				await SlsApiRest.handler({
					requestPath: '/some-entity/1/sub-entity/2',
					headers: {
						cookie: 'foo=bar'
					}
				});

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.stub(ApiResponse, 'send');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				await SlsApiRest.handler({
					requestPath: '/some-entity/1/sub-entity/2',
					headers: {
						Cookie: 'foo=bar'
					}
				});

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.stub(ApiResponse, 'send');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				await SlsApiRest.handler({
					requestPath: '/some-entity/{entityId}/sub-entity/{subEntityId}',
					path: {
						entityId: 1,
						subEntityId: 2
					}
				});

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.stub(ApiResponse, 'send');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				await SlsApiRest.handler({
					requestPath: '/some-entity'
				});

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					},
					extraProp: 'more foo'
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (with querystring and multiple sort) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					},
					extraProp: 'more foo'
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
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
						// eslint-disable-next-line no-sparse-arrays
						sortDirection: [, 'asc']
					}
				});

				assert.deepStrictEqual(apiResponse, 'the actual response');

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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
						// eslint-disable-next-line no-sparse-arrays
						sortDirection: [, 'asc']
					},
					rawData: undefined,
					authenticationData: {}
				});

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (without querystring) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					},
					extraProp: 'more foo'
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
				apiResponseStub.returns('the actual response');

				const apiResponse = await SlsApiRest.handler({
					requestPath: '/some-entity/1/sub-entity/2',
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(apiResponse, 'the actual response');

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (with body) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					},
					extraProp: 'more foo'
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (without body) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					},
					extraProp: 'more foo'
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
				apiResponseStub.returns('the actual response');

				const apiResponse = await SlsApiRest.handler({
					requestPath: '/some-entity/1/sub-entity/2',
					method: 'post',
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(apiResponse, 'the actual response');

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (without authentication data) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
					statusCode: 200,
					body: {
						foo: 'bar'
					},
					headers: undefined,
					cookies: undefined
				});
			});

			it('Should pass the request arguments (with authentication data) to the Dispatcher and map the dispatcher result', async () => {

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.resolves({
					code: 200,
					body: {
						foo: 'bar'
					}
				});

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'send');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, {
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

				const dispatcherStub = sinon.stub(Dispatcher.prototype);

				dispatcherStub.dispatch.throws(apiError);

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'sendError');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, apiError, undefined);
			});

			it('Should return an error with the client code if the Dispatcher throws with a client', async () => {

				const apiError = new Error('Some error');

				const dispatcherStub = sinon.stub(Dispatcher.prototype);

				dispatcherStub.dispatch.throws(apiError);

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'sendError');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, apiError, 'fizzmod');
			});

			it('Should return an error with a custom statusCode if the Dispatcher throws with a code', async () => {

				const apiError = new Error('Some error');
				apiError.code = 503;

				const dispatcherStub = sinon.stub(Dispatcher.prototype);
				dispatcherStub.dispatch.throws(apiError);

				sinon.stub(SlsApiRest, 'getDispatcher')
					.returns(dispatcherStub);

				const apiResponseStub = sinon.stub(ApiResponse, 'sendError');
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

				sinon.assert.calledOnceWithExactly(SlsApiRest.getDispatcher, {
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

				sinon.assert.calledOnce(dispatcherStub.dispatch);

				sinon.assert.calledOnceWithExactly(apiResponseStub, apiError, undefined);

			});
		});
	});

});
