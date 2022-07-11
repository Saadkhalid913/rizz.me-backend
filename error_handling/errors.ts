export class BaseError extends Error {

    readonly message: string;

    constructor(message: string) {
        super(message)

        this.message = message
    }
}


interface HTTPErrorInfo {
    HTTPErrorCode: number;
    endUserMessage: string;
    environment: string        
    routePath: string;
    resource: any;
    userID?: string;
    log: boolean;
}

export class HTTPError extends BaseError {


    readonly info: HTTPErrorInfo

    constructor(message: string, info: HTTPErrorInfo) {
        super(message)
        this.info = info
    }
}

