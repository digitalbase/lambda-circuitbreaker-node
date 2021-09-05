const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
    //const messageBody = JSON.parse(event.Body);
    // const ApiUrlThatIsRateLimited = messageBody.url;
    //const ApiUrlThatIsRateLimited = process.env.ENDPOINT_TO_TEST;
    const headers = {
        'x-api-key': process.env.ENDPOINT_API_KEY,
    }

    return fetch(process.env.ENDPOINT_TO_TEST, { method: 'GET', headers: headers})
}
