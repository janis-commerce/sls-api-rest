# sls-api-rest

[![Build Status](https://travis-ci.org/janis-commerce/sls-api-rest.svg?branch=master)](https://travis-ci.org/janis-commerce/sls-api-rest)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-rest/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-rest?branch=master)

An integration handler for Serverless and JANIS Rest APIs

## Installation

```
npm install @janiscommerce/sls-api-rest
```

## ⚠️ **Breaking changes from version *2.0.0*** ⚠️
*Since 2.0.0*

API upgraded to v5. API Session store validations replaced with loactions

For more information see [API](https://www.npmjs.com/package/@janiscommerce/api) and [API Session](https://www.npmjs.com/package/@janiscommerce/api-session)

## Dependencies

This package only works properly with serverless-offline@5.9.0 or greater

## Usage

```js
'use strict';

const { SlsApiRest } = require('@janiscommerce/sls-api-rest');

module.exports.handler = (...args) => SlsApiRest.handler(...args);
```


## Function minimal configuration

```yml
functions:
  handler: path/to/generic.handler
  package:
    include:
      - path/to/my/api/get.js
  events:
    - http:
        integration: lambda
        path: /some-entity/{entityId}
        method: GET
        request:
          parameters:
            paths:
              entityId: true
          # Some velocity template that includes this properties:
          # - headers
          # - method
          # - query
          # - body
          # - requestPath
          # Native support for this template en Serverless Framework was suggested in https://github.com/serverless/serverless/issues/6364
          # Still needed to work with serverless-offline
          template: ${file(./serverless/functions/subtemplates/lambda-request-with-path.yml)}
        # The response configuration to properly format body and headers + Error handling
        response: ${file(./serverless/functions/subtemplates/lambda-response-with-cors.yml)}
        # This is for serverless-offline only, because it doesn't use the `response` property (yet)
        responses: ${file(./serverless/functions/subtemplates/lambda-serverless-offline-responses.yml)}
```

Sample subtemplates can be found here:
- [Request template](docs/request-template-demo.yml)
- [Response template](docs/response-template-demo.yml)
- [Offline responses template](docs/offline-responses-template-demo.yml)
