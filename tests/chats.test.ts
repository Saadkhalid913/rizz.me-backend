import { Server } from "http"
import request from "supertest"
import prisma from "../db"
import dotenv from "dotenv"

import { store }from "../setup/addMiddlewear"

let server: Server

beforeEach(() => {
    server = require("../index")
    prisma.$connect()
})
afterEach(() => {
    server && server.close()
    prisma.$disconnect()
})

const test_username = "testUsername123"
const test_password = "4^v3s^2h*@c3^c52ds25AvSwrcaWRH424B51xF42W@#"


describe("/api/user", () => {
    it("Should run", async () => {

        const response = await request(server).post("/api/user")
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({ username: test_username, password: test_password}))
        expect(response.body).toBeDefined()
    })
})





afterAll(() => {
    server && server.close()    
    store.shutdown()
})

