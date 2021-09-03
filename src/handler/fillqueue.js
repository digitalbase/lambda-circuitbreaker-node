const AWS = require("aws-sdk");
const uuid = require("uuid");
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async (event) => {
    const numberMessages = process.env.NUMBER_JOBS_TO_TEST;
    let messagesAdded = 0;

    while (messagesAdded < numberMessages) {

        const params = {
            QueueUrl: process.env.QUEUE_URL,
            Entries: []
        };
        for (let messagesInBatch = 0; messagesInBatch < 10 && messagesAdded < numberMessages; messagesAdded++ , messagesInBatch++) {
            params.Entries.push({
                Id: uuid.v4(),
                MessageBody: JSON.stringify({
                    fileName: 'foo/bar.mp4'
                })
            });
        }

        await sqs.sendMessageBatch(params).promise();
    }

    return { message: '!', event };
};
