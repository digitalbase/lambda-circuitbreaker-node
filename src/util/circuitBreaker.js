const TABLE_NAME = 'circuit_breaker';
const STATUS_OPEN = 'opened';
const STATUS_CLOSED = 'closed';

class circuitBreaker {
    constructor(documentClient) {
        this.documentClient = documentClient;
        this.status = null;
    }

    async open() {
        return this.setStatus(STATUS_OPEN);
    }

    async close() {
        return this.setStatus(STATUS_CLOSED);
    }

    isOpen() {
        return this.status === STATUS_OPEN;
    }

    isClosed() {
        return this.status === STATUS_CLOSED;
    }

    async setStatus(status) {
        this.status = status;

        const params = {
            TableName: TABLE_NAME,
            Item:{
                "key": "status",
                "status": status,
            }
        };

        return this.documentClient.put(params).promise();
    }

    getStatus() {
        return this.status;
    }

    async fetchStatus() {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "key": "status",
            }
        };

        const circuitStatus = await this.documentClient.get(params).promise();
        if (circuitStatus?.Item) {
            this.status = circuitStatus?.Item.status;
        }

        return this.getStatus();
    }
}


exports.circuitBreaker = circuitBreaker;
