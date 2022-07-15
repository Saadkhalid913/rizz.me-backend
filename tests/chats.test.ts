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

    const deleteProfile = async () => {
        const response = await request(server).delete("/api/user")
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
        expect(response.body.data.username).toBeDefined()
        expect(response.body.data.password).toBeDefined()
        expect(response.body.data.JWT).toBeDefined()
        expect(response.body.data.chat_id).toBeDefined()


        const delete_profile_response = await deleteProfile()
        expect(delete_profile_response.statusCode).toBe(200)
        expect(delete_profile_response.body.id).toBeDefined()
        expect(delete_profile_response.body.username).toBeDefined()
    
    })

    it("Should provide chat credentials", async () => {
        await createProfile()
        const user_response = await request(server).post("/api/user/login")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})

        const auth_token = user_response.headers["auth-token"]


        const chat_response = await request(server).post("/api/chats/create/" + test_username)
            .set('Content-Type', 'application/json')
            .send()
            expect(chat_response.statusCode).toBe(200)
            expect(chat_response.body).toBeDefined()
            expect(chat_response.body.data.username).toBeDefined()
            expect(chat_response.body.data.password).toBeDefined()
            expect(chat_response.body.data.JWT).toBeDefined()
            expect(chat_response.body.data.chat_id).toBeDefined()
            
            const response = await request(server).get(`/api/chats/getcredentials/${chat_response.body.data.chat_id}`)
                .set('Content-Type', 'application/json')
                .set('auth-token', auth_token)
                .send()
                
            expect(response.statusCode).toBe(200)
            expect(response.body.JWT).toBeDefined()

        const delete_profile_response = await deleteProfile()
        expect(delete_profile_response.statusCode).toBe(200)
        expect(delete_profile_response.body.id).toBeDefined()
        expect(delete_profile_response.body.username).toBeDefined()
    })

    it("Should get anonymous credentials", async () => {
        await createProfile()
        const user_response = await request(server).post("/api/user/login")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})

        const auth_token = user_response.headers["auth-token"]


        const chat_response = await request(server).post("/api/chats/create/" + test_username)
            .set('Content-Type', 'application/json')
            .send()

        expect(chat_response.statusCode).toBe(200)
        expect(chat_response.body).toBeDefined()
        expect(chat_response.body.data.username).toBeDefined()
        expect(chat_response.body.data.password).toBeDefined()
        expect(chat_response.body.data.JWT).toBeDefined()
        expect(chat_response.body.data.chat_id).toBeDefined()

        const { username, password } = chat_response.body.data
        const response = await request(server).post("/api/chats/getcredentials/anon")
            .set('Content-Type', 'application/json')
            .send({username, password, non_anon_username: test_username})
        

        expect(response.statusCode).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.JWT).toBeDefined()

        const delete_profile_response = await deleteProfile()
        expect(delete_profile_response.statusCode).toBe(200)
        expect(delete_profile_response.body.id).toBeDefined()
        expect(delete_profile_response.body.username).toBeDefined()
    })

    it("Should create 3 chats and retrieve them", async () => {
        await createProfile()
        const user_response = await request(server).post("/api/user/login")
                .set('Content-Type', 'application/json')
                .send({ username: test_username, password: test_password})

        const auth_token = user_response.headers["auth-token"]

        const ChatCreationCalls = []

        for (let i = 0; i < 3; i++) {
            ChatCreationCalls.push(
                request(server).post("/api/chats/create/" + test_username)
                    .set('Content-Type', 'application/json')
                    .send()
            )
        }

        await Promise.all(ChatCreationCalls)

        const response = await request(server).get("/api/chats")
        .set('Content-Type', 'application/json')
        .set('auth-token', auth_token)
        
        expect(response.statusCode).toBe(200)
        expect(response.body.length).toEqual(3)

        const delete_profile_response = await deleteProfile()
        expect(delete_profile_response.statusCode).toBe(200)
        expect(delete_profile_response.body.id).toBeDefined()
        expect(delete_profile_response.body.username).toBeDefined()
    })

})



afterAll(() => {
    server && server.close()    
    store.shutdown()
})

