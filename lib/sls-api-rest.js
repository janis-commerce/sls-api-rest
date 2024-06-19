'use strict';

const { parse, stringify } = require('qs');

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const { Dispatcher } = require('@janiscommerce/api');

const Events = require('@janiscommerce/events');
const Log = require('@janiscommerce/log');

const RouterFetcher = require('@janiscommerce/router-fetcher');

module.exports = class SlsApiRest {

	static getDispatcher(...args) {
		return new Dispatcher(...args);
	}

	static async handler(event) {

		event = await this.prepareEvent(event);

		Log.start();

		// This is a custom template property.
		// Native support was suggested in https://github.com/serverless/serverless/issues/6364
		if(!event.requestPath) {

			await this.emitEnded();

			return ApiResponse.send({
				statusCode: 500,
				body: {
					message: 'requestPath not present in event object. Add a custom request mapping template to add it'
				}
			});
		}

		const queryString = stringify(event.query || {});

		const headers = event.headers || {};
		const method = (event.method && event.method.toLowerCase()) || 'get';
		const endpoint = this.buildEndpoint(event.requestPath, event.path);
		const data = method === 'get' ? parse(queryString, { arrayLimit: 1000, allowSparse: true }) : (event.body || {});

		const authenticationData =
			(event.authorizer && event.authorizer.janisAuth && JSON.parse(event.authorizer.janisAuth))
			|| event.authenticationData
			|| {};

		const dispatcher = this.getDispatcher({
			endpoint,
			method,
			data,
			rawData: event.rawBody,
			headers,
			cookies: this.parseCookies(headers.Cookie || headers.cookie),
			authenticationData
		});

		let result;

		try {
			result = await dispatcher.dispatch();
		} catch(error) {

			await this.emitEnded();

			return ApiResponse.sendError(error, authenticationData && authenticationData.clientCode);
		}

		await this.emitEnded();

		return ApiResponse.send({
			...(authenticationData.clientCode && { clientCode: authenticationData.clientCode }),
			statusCode: result.code,
			body: result.body,
			headers: result.headers,
			cookies: result.cookies
		});
	}

	static parseCookies(cookiesString) {

		if(!cookiesString)
			return {};

		const cookies = {};

		cookiesString.split(';').forEach(cookie => {
			const parts = cookie.split('=');
			cookies[parts.shift().trim()] = decodeURI(parts.join('='));
		});

		return cookies;
	}

	static buildEndpoint(requestPath, pathVariables) {

		requestPath = requestPath.replace(/^\//, '');

		if(!pathVariables)
			return requestPath;

		return Object.entries(pathVariables).reduce((endpoint, [key, value]) => endpoint.replace(`{${key}}`, value), requestPath);
	}

	static async emitEnded() {
		await Events.emit('janiscommerce.ended');
	}

	static async prepareEvent(event) {

		const { requestPath, namespace, method } = event;

		if(!requestPath && namespace && method) {

			const routerFetcher = new RouterFetcher();
			const { endpoint, httpMethod } = await routerFetcher.getEndpoint(process.env.JANIS_SERVICE_NAME, namespace, method);

			return {
				...event,
				requestPath: endpoint,
				method: httpMethod
			};
		}

		return event;
	}
};
