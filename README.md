# sls-api-rest

![Build Status](https://github.com/janis-commerce/sls-api-rest/workflows/Build%20Status/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-rest/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-rest?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Fsls-api-rest.svg)](https://www.npmjs.com/package/@janiscommerce/sls-api-rest)

An integration handler for Serverless and JANIS Rest APIs

## Installation

```
npm install @janiscommerce/sls-api-rest
```

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
