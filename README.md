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
yarn convert-routing-excel document.xlsx > out.json
```

## Notes

Generated JSON is used internally by `vrs-frontend` app, and not directly compatible 
with Routing API schema (although). 

The converter can be used to facilitate preparation of API requests from customer data.