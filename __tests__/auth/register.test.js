import request from "supertest";
import app from "../../src/app.js";
import userModel from "../../src/models/user.models.js";
import otpModel from "../../src/models/otp.models.js";


describe("Register API",()=>{
    test("Should register a user successfully", async ()=>{
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username:'Joel',
                email:"eapenjoel4@gmail.com",
                password:"J@2007",
                role:'user'
            })
        
            const user = await userModel.findOne({
                username:"Joel"
            })
            const otp = await otpModel.findOne({
                email:"eapenjoel4@gmail.com"
            })

        console.log(res.body)
        console.log(otp.otpHash)
        expect(res.statusCode).toBe(201)
        expect(user).not.toBeNull()
        expect(otp).not.toBeNull()
        expect(user.password).not.toBe('J@2007')
    });

});

describe("Duplication User Test",()=>{
    test("Should throw error when same username is typed",async ()=>{
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username:'Joel',
                email:"eapenjoel4@gmail.com",
                password:"J@2007",
                role:'user'
            })
        
        const res2 = await request(app)
            .post('/api/auth/register')
            .send({
                username:"Joel",
                password:"Joel2007",
                email:"eapenjoel123@gmail.com",
                role:"user"
            })
            const user = await userModel.find({
                username:"Joel"
            })

            console.log(res2.body)
            expect(res2.statusCode).toBe(409)
            expect(res2.body.message).toBe("Username or email already exists")
            expect(user.length).toBe(1)
    })
});

describe("Missing credentials test",()=>{
    test("Missing username, should return 400 error", async ()=>{
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email:"eapenjoel123@gmail.com",
                password:"J@2007"
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("Validation failed")
    })

    test("Missing email, should return 400 error",async()=>{
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username:"Joel",
                password:"J@2007"
            })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("Validation failed")
    });

    test("Missing password, should return 400 error",async()=>{
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username:"Joel",
                password:"J@2007",

            })

        console.log(res.body)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe("Validation failed")
    });
})