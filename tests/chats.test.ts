import { Server } from "http"
import request from "supertest"
import prisma from "../db"

import { store } from "../setup/addMiddlewear"

let server: Server

beforeEach(() => {
    server = require("../index")
    prisma.$connect()
})
afterEach(() => {
    server && server.close()
})

const test_username = "testUsername123"
const test_password = "4^v3s^2h*@c3^c52ds25AvSwrcaWRH424B51xF42W@#"


describe("/api/chats/create/:username", () => {

    const createProfile = async () => {
        const response = await request(server).post("/api/user")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})
        return response 
    }

    it("Should create a new chat with the user", async () => {
        const user_response = await createProfile()
        expect(user_response.body).toBeDefined()

        const response = await request(server).post("/api/chats/create/" + test_username)
            .set('Content-Type', 'application/json')
            .send()
        expect(response.statusCode).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.username).toBeDefined
        expect(response.body.password).toBeDefined
        expect(response.body.JWT).toBeDefined
    })

    it("Should delete the user's account", async () => {
        const response = await request(server).delete("/api/user")
            .set('Content-Type', 'application/json')
            .send({ username: test_username, password: test_password})

        expect(response.statusCode).toBe(200)
        expect(response.body.id).toBeDefined()
        expect(response.body.username).toBeDefined()
    })
})



afterAll(() => {
    server && server.close()    
    store.shutdown()
})

