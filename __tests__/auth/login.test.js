import request from "supertest";
import app from "../../src/app.js";
import userModel from "../../src/models/user.models.js";
import sessionModel from "../../src/models/session.models.js";


describe('Login Tests', () => {
    test('User logs in successfully and session created successfully, when email and password was given', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'Joel',
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007',
                role: 'user'
            })

        const user = await userModel.findOne({
            username:'Joel'
        })

        user.verified = true
        await user.save()

        const res = await request(app)
            .post('/api/auth/login')
            .set('User-Agent','Jest-Test')
            .send({
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007'
            })
        const session = await sessionModel.findOne({
            user:user._id
        })
        

        console.log(res.body)

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Login successful')
        expect(res.body.data).toHaveProperty('accessToken')
        expect(session).not.toBeNull()


    });

    test('User not found on invalid credentials', async ()=>{
        const res = await request(app)
            .post('/api/auth/login')
            .set('User-Agent','Jest-Test')
            .send({
                email:'fake@gamil.com',
                password:'J@2007'
            })
        
            expect(res.statusCode).toBe(400)
            expect(res.body.message).toBe("Invalid credentials")

        
    });

    test('User Email not verified, returns 400 error code', async ()=>{
        await request(app)
            .post('/api/auth/register')
            .send({
                username:'Joel',
                password:'J@2007',
                email:'eapenjoel4@gmail.com'
            })

        const res = await request(app)
            .post('/api/auth/login')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com',
                password:'J@2007'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Please verify your email before logging in')
    });

    test('User enter wrong password, returns 400 error code',async()=>{
        await request(app)
            .post('/api/auth/register')
            .send({
                username:'Joel',
                email:'eapenjoel4@gmail.com',
                password:'J@2007'
            })
        const user = await userModel.findOne({
            username:'Joel'
        })

        user.verified = true
        await user.save()

        const res = await request(app)
            .post('/api/auth/login')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com',
                password:'wrongpassword'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Invalid credentials')
    })
})