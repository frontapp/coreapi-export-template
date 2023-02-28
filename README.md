# Front Sample Application - CoreAPI Export
This project provides an example application that customers can use as a starting point for exporting conversations
Similar to the import sample application, this is an ETL script, with Front as the *extract* point rather than *load*. To learn more about using this sample application, visit our [Developer Portal](https://dev.frontapp.com/docs/sample-application#conversationmessage-export-application).

## Application Structure

### `connector.ts`
`FrontConnector` provides a method to make generic paginated requests for API resources and handles rate-limiting.

### `export.ts`
`FrontExport` provides methods to list and export Front resources.

### `helpers.ts`
Customers are expected to manage any transforms and loading through the methods here.

### `index.ts`
Where customers can specify what they want exported through usage of `FrontExport` methods.

### `types.ts`
Non-exhaustive typing for responses from Front's API.  Allows for easy casting in paginated responses.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the export.

## Configuration

### `.env`

Put your `API_KEY` here.

### `helpers.ts`

Define your *transform* and *load* logic here.

### `index.ts`

Logic for what will be exported here.