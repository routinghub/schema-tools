# Routing API JSON schema tools.

## Provides
- Tools to generate example Excel task with documenation from OpenAPI schema;
- Tools to generate JSON compatible with Routing API from formatted Excel.

## Usage
Install and test:
```
yarn install
yarn jest
```

Generate schema from https://routinghub.com/api/routing/v1-devel/schemas/openapi.json:
```
yarn routing-schema
```

Generate JSON from formatted Excel and write to stdout:
```
yarn convert-routing-excel document.xlsx out.json
```

## Notes
The Excel -> JSON converter can be used to facilitate preparation of API requests
from customer data.

Note, that generated JSON is to be used internally by `vrs-frontend` app, and not
directly compatible with Routing API schema. 

The conversion to Routing API schema is straightforward:
- `.json` field contains Routing API request definition;
- `.json.options` field must be replaced with correct object, see https://routinghub.com/api/routing/v1-devel/doc#addRoutingRequest.request.options

## Known issues
Excel files, provided by customers and based on this template, can contain all sorts
of inconsistencies that are not handled by the converter.

Most common errors include non-flattened formulas, or invalid cell formats.

In case when customer Excel template fails conversion, please share the problematic
file via private support channel for partners.
