const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const AWS = require("aws-sdk");
const dynamoDocumentClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const { circuitBreaker } = require("src/util/circuitBreaker");
const circuitBreakerClient = new circuitBreaker(dynamoDocumentClient);

exports.handler = async (event) => {
    //const messageBody = JSON.parse(event.Body);
    const receiptHandle = event.ReceiptHandle;

    const headers = {
        'x-api-key': process.env.ENDPOINT_API_KEY,
    }

    const response = await fetch(process.env.ENDPOINT_TO_TEST, { method: 'GET', headers: headers});
    const statusCode = response.status;
    console.log('status code', statusCode);

    if (statusCode === 200) {
        // success, remove message from SQS
        const params = {
            QueueUrl: process.env.QUEUE_URL,
            ReceiptHandle: receiptHandle
        };

        console.log('removing sqs message');
        await sqs.deleteMessage(params).promise();
    }

    //throttle kicked in. Open circuit
    if (statusCode === 429) {
        console.log('opening circuitbreaker');
        await circuitBreakerClient.open();
    }
}
