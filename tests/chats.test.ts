import { Server } from "http"
import request from "supertest"
import prisma from "../db"
let server: Server


beforeEach(() => {server = require("../index")})
// afterEach(() => server && server.close())

const test_username = "testUsername123"
const test_password = "4^v3s^2h*@c3^c52ds25AvSwrcaWRH424B51xF42W@#"


describe("/api/user", () => {
    it("Should run", async () => {
        const response = await request(server).post("/api/user").send({ username: test_username, password: test_password})
        expect(response.body).toBeDefined()

    })
})





afterAll(() => {
    server && server.close()    
})

