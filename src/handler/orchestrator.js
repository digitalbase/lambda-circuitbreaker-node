const AWS = require("aws-sdk");
const dynamoDocumentClient = new AWS.DynamoDB.DocumentClient();
const { circuitBreaker } = require("src/util/circuitBreaker");
const circuitBreakerClient = new circuitBreaker(dynamoDocumentClient);

exports.handler = async (event) => {
    let circuitStatus = await circuitBreakerClient.fetchStatus();
    if (!circuitStatus) {
        console.log('initialising circuit breaker');
        await circuitBreakerClient.close();
    }

    // loop forever, or maybe invoke itself after a while. Might be better than while true
    while (true) {
        if (circuitBreakerClient.isOpen()) {
            // launch some kind of test API that can close it

            // wait for a bit (few seconds? or longer)

            // fetch circuitBreaker status from dynamo
        }

        if (circuitBreakerClient.isClosed()) {
            // fetch SQS jobs in batches

            // trigger lambda function for each fetch
        }
    }

    return { message: '!', event };
};
