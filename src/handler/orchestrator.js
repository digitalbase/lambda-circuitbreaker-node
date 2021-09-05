const AWS = require("aws-sdk");
const dynamoDocumentClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const lambda = new AWS.Lambda();

const { circuitBreaker } = require("src/util/circuitBreaker");
const circuitBreakerClient = new circuitBreaker(dynamoDocumentClient);

exports.handler = async (event) => {
    const initialCircuitStatus = await circuitBreakerClient.fetchStatus();
    if (!initialCircuitStatus) {
        console.log('initialising circuit breaker');
        await circuitBreakerClient.close();
    }

    let messagesToProcessPerInvoke = 500;
    let messagesProcessed = 0;

    // loop forever, or maybe invoke itself after a while. Might be better than while true
    while (messagesProcessed < messagesToProcessPerInvoke) {
        console.log(`On the ${messagesProcessed} message the circuit is marked as ${circuitBreakerClient.status}`)

        if (circuitBreakerClient.isOpen()) {
            // launch some kind of test API that can close it


            // wait for a bit (few seconds? or longer)

            // increase waiting time
        }

        if (circuitBreakerClient.isClosed()) {
            // fetch SQS jobs in batches
            const params = {
                QueueUrl: process.env.QUEUE_URL,
                MaxNumberOfMessages: 10,
            };
            const { Messages }  = await sqs.receiveMessage(params).promise(); //10

            if (!Messages) {
                console.log('no messages, sleeping for 500ms');

                await sleep(500)

                continue;
            }

            for (const message of Messages) {
                if (circuitBreakerClient.isOpen()) {
                    continue; //do not invoke lambdas if the circuit is open
                }

                console.log(`invoking callApi`);

                lambda.invoke({
                    FunctionName: 'lambda-circuitbreaker-node-dev-callApi',
                    Payload: JSON.stringify(message, null, 2)
                }).promise().then(async (response) => {

                    console.log('status code', response.StatusCode);

                    if (response.StatusCode === 200) {
                        // success, remove message from SQS
                        const params = {
                            QueueUrl: process.env.QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle
                        };

                        await sqs.deleteMessage(params).promise();
                    }

                    //throttle kicked in. Open circuit
                    if (response.StatusCode === 429) {
                        await circuitBreakerClient.open();
                    }

                    messagesProcessed++;

                    //non standard response. To dead letter queue?
                });
            }
        }
    }

    return { message: '!', event };
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
