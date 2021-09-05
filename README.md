# lambda-circuitbreaker-node

## About

This is a prototype implementation of the circuit breaker pattern in node/lambda. 
The pattern can be used to limit the number of calls to a rate limited 3th party API.

## Inspiration

* https://www.jeremydaly.com/throttling-third-party-api-calls-with-aws-lambda/
* https://www.jeremydaly.com/serverless-microservice-patterns-for-aws/#circuitbreaker
* https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

## Parts of prototype:

* mock AWS API Gateway with rate limits (see serverless.yml)
* DynamoDB (one table/record) to keep circuitbreaker status (open/closed)
* SQS queue to queue up the full workload
* Fill queue function to fill the queue
* Orchestrator that queues functions (calling the api)
* CallAPI function that touches the API gateway

