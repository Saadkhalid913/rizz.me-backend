import dotenv from "dotenv"

const ConfigInit = () => {
    const dev_env = (process.env.TS_NODE_DEV) ? "development" : "production"
    dotenv.config({path: `.env.${dev_env}`})    
    CheckAllVars()
}


function CheckAllVars() {
    const EnvrionmentVariables = [
        "key",
        "cookie_domain",
        "client_origin"
    ]

    for (let variable of EnvrionmentVariables) {
        if (!process.env[variable]) {
            throw new Error(`MISSING ENVIRONMENT VARIABLE ${variable} -- TERMINATING PROCESS`)
        }
    }
}

export default ConfigInit