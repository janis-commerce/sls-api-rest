'use strict';

const awsQs = require('amazon-api-gateway-querystring');

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const { Dispatcher } = require('@janiscommerce/api');

class SlsApiRest {

	static getDispatcher(...args) {
		return new Dispatcher(...args);
	}

	static async handler(event) {

		// This is a custom template property.
		// Native support was suggested in https://github.com/serverless/serverless/issues/6364
		if(!event.requestPath) {
			return ApiResponse.send({
				statusCode: 500,
				body: {
					message: 'requestPath not present in event object. Add a custom request mapping template to add it'
				}
			});
		}

		const headers = event.headers || {};
		const method = (event.method && event.method.toLowerCase()) || 'get';
		const data = method === 'get' ? awsQs(event.query || {}) : (event.body || {});
		const endpoint = this._buildEndpoint(event.requestPath, event.path);
		const authenticationData = (event.authorizer && event.authorizer.janisAuth && JSON.parse(event.authorizer.janisAuth)) || {};

		const dispatcher = this.getDispatcher({
			endpoint,
			method,
			data,
			rawData: event.rawBody,
			headers,
			cookies: this._parseCookies(headers.Cookie || headers.cookie),
			authenticationData
		});

		let result;

		try {
			result = await dispatcher.dispatch();
		} catch(e) {
			return ApiResponse.sendError(e, authenticationData && authenticationData.clientCode);
		}

		return ApiResponse.send({
			...(authenticationData.clientCode && { clientCode: authenticationData.clientCode }),
			statusCode: result.code,
			body: result.body,
			headers: result.headers,
			cookies: result.cookies
		});
	}

	static _parseCookies(cookiesString) {

		if(!cookiesString)
			return {};

		const cookies = {};

		cookiesString.split(';').forEach(cookie => {
			const parts = cookie.split('=');
			cookies[parts.shift().trim()] = decodeURI(parts.join('='));
		});

		return cookies;
	}

	static _buildEndpoint(requestPath, pathVariables) {

		requestPath = requestPath.replace(/^\//, '');

		if(!pathVariables)
			return requestPath;

		return Object.entries(pathVariables).reduce((endpoint, [key, value]) => endpoint.replace(`{${key}}`, value), requestPath);
	}

}

module.exports = SlsApiRest;
