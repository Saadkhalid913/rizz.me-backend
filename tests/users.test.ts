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


describe("/api/user", () => {
    const createProfile = async () => {
        const response = await request(server).post("/api/user")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})
        return response 
    }

    it("Should create a new user", async () => {
        const response = await createProfile()
        expect(response.body).toBeDefined()
    })

    it("Should log in the user", async () => {
        const response = await request(server).post("/api/user/login")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})
        expect(response.statusCode).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.headers["auth-token"]).toBeDefined()
    })

    it("Should delete the user's account", async () => {
        await createProfile()
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

