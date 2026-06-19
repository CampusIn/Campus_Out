import request from 'supertest';
import app from '../../src/app.js';
import sessionModel from '../../src/models/session.models.js';
import userModel from '../../src/models/user.models.js';

describe('Logout tests', () => {
    test('Successful logout, should return 200 status code', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'Joel',
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007',
                role: 'user'
            })
        const user = await userModel.findOne({
            username: 'Joel'
        })

        user.verified = true
        await user.save()


        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('User-Agent', 'Jest-test')
            .send({
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007'
            })


        const cookie = loginResponse.headers['set-cookie']

        const logOutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookie)

        const session = await sessionModel.findOne({
            user: user._id
        })


        expect(logOutResponse.statusCode).toBe(200)
        expect(logOutResponse.body.message).toBe('Logout Successful')
        expect(session.revoked).toBe(true)

    });

    test('No refresh token given, should return 401 status code', async () =>{
        const res = await request(app)
            .post('/api/auth/logout')

        console.log(res.body);
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Unauthorised, refresh token not found')
        
        
    });

    test('Session already revoked, should return 400 status code', async ()=>{
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'Joel',
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007',
                role: 'user'
            })
        const user = await userModel.findOne({
            username: 'Joel'
        })

        user.verified = true
        await user.save()


        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('User-Agent', 'Jest-test')
            .send({
                email: 'eapenjoel4@gmail.com',
                password: 'J@2007'
            })


        const cookie = loginResponse.headers['set-cookie']
        const session = await sessionModel.findOne({
            user:user._id
        })

        session.revoked = true
        await session.save()

        const logOutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Cookie',cookie)
        
        expect(logOutResponse.statusCode).toBe(400)
        expect(logOutResponse.body.message).toBe('No session in progress')
        expect(session.revoked).toBe(true)
    })
})