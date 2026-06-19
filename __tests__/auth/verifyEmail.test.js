import request from 'supertest';
import app from '../../src/app.js';
import userModel from '../../src/models/user.models.js';
import otpModel from '../../src/models/otp.models.js';
import sessionModel from '../../src/models/session.models.js';
import bcrypt from 'bcrypt'


describe('Verify Email OTP test',()=>{
    test('User successfully verifies the email, should return 200 status code', async ()=>{
        const user = await userModel.create({
            username:'Joel',
            email:'eapenjoel4@gmail.com',
            password:'J@2007',
            role:'user'
        })

        const otpDoc = await otpModel.create({
            email:'eapenjoel4@gmail.com',
            user: user._id,
            otpHash: await bcrypt.hash('123456',10)
        })

        const res = await request(app)
            .post('/api/auth/verify-email')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com',
                otp:'123456'
            })
        
        const otpAfter = await otpModel.findById(otpDoc._id)
        
        const updatedUser = await userModel.findById(user._id)

        const session = await sessionModel.findOne({
            user:user._id
        })


        console.log(res.body)
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Email verified successfully')
        expect(res.body.data).toHaveProperty('user')
        expect(res.body.data).toHaveProperty('accessToken')
        expect(updatedUser.verified).toBe(true)
        expect(otpAfter).toBeNull()
        expect(session).not.toBeNull()
    });

    test('Missing email, should return 400 error code', async () =>{
        const res = await request(app)
            .post('/api/auth/verify-email')
            .set('User-Agent','Jest-Test')
            .send({
                otp:'123456'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Validation failed')
    });

    test('Missing OTP, should return 400 error code', async () =>{
        const res = await request(app)
            .post('/api/auth/verify-email')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Validation failed')
    });

    test('OTP Document is Missing, should return 400 error code', async () =>{
         const user = await userModel.create({
            username:'Joel',
            email:'eapenjoel4@gmail.com',
            password:'J@2007',
            role:'user'
        })

        const otpDoc = await otpModel.create({
            email:'eapenjoel4@gmail.com',
            user: user._id,
            otpHash: await bcrypt.hash('123456',10)
        })

        await otpModel.findOneAndDelete({
            email:'eapenjoel4@gmail.com'
        })

        const otpDocAfter = await otpModel.findOne({
            email:'eapenjoel4@gmail.com'
        })

        const res = await request(app)
            .post('/api/auth/verify-email')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com',
                password:'123456'
            })
           
        console.log(res.body)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Validation failed')
        expect(otpDocAfter).toBeNull()
    });

    test('Sending inavlid OTP, should return 400 error code', async ()=>{
        const user = await userModel.create({
            username:'Joel',
            email:'eapenjoel4@gmail.com',
            password:'J@2007',
            role:'user'
        })

        const otpDoc = await otpModel.create({
            email:'eapenjoel4@gmail.com',
            user: user._id,
            otpHash: await bcrypt.hash('123456',10)
        })

        const res = await request(app)
            .post('/api/auth/verify-email')
            .set('User-Agent','Jest-Test')
            .send({
                email:'eapenjoel4@gmail.com',
                otp:'999999'
            })
        
        console.log(res.body)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Invalid OTP')
    })
})