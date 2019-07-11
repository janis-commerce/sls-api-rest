# sls-api-rest

[![Build Status](https://travis-ci.org/janis-commerce/sls-api-rest.svg?branch=master)](https://travis-ci.org/janis-commerce/sls-api-rest)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-rest/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-rest?branch=master)

An integration handler for Serverless and JANIS Rest APIs

# Installation

```
npm install @janiscommerce/sls-api-rest
```

# Usage

- API Browse Data
```js
'use strict';

const { SlsApi } = require('@janiscommerce/sls-api-rest');

module.exports.handler = (...args) => SlsApi.handler(...args);
```


# Function minimal configuration

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
          template: |-
            Some velocity template that includes this properties:
            - headers
            - method
            - query
            - body
            - requestPath

            Native support for this template en Serverless Framework was suggested in https://github.com/serverless/serverless/issues/6364
            Sample template to use in serverless response template [here](docs/request-template-demo.yml)
          parameters:
            paths:
              entityId: true
```