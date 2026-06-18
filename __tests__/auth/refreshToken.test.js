import request from 'supertest';
import app from '../../src/app.js';
import userModel from '../../src/models/user.models.js';
import sessionModel from '../../src/models/session.models.js';

describe('Refresh Token API', () => {
    test('New access token should be generated successfully', async () => {
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

        const refreshResponse = await request(app)
            .post('/api/auth/refresh-token')
            .set('Cookie', cookie)

        expect(refreshResponse.statusCode).toBe(201)
        expect(refreshResponse.body.message).toBe('New access token created')
        expect(refreshResponse.body.data).toHaveProperty('accessToken')

    });

    test('Missing cookie in the headers, should return 401 error code', async () =>{
        const res = await request(app)
            .post('/api/auth/refresh-token')
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Unauthorised, refresh token not found')
        
        
        
    });

    test('Inavlid cookie, should return 401 error code', async ()=>{
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .set('Cookie','refreshToken=fake-token')

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('JWT verification failed')

    });

    test('Session is invalid, should return 400 error code', async ()=>{
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
        const session = await sessionModel.findOneAndDelete({
            user: user._id
        })

        const sessionAfterDeletion = await sessionModel.findOne({
            user:user._id
        })


        console.log(sessionAfterDeletion)

        const refreshResponse = await request(app)
            .post('/api/auth/refresh-token')
            .set('Cookie', cookie)
        
        expect(refreshResponse.statusCode).toBe(400)
        expect(refreshResponse.body.message).toBe('No session in progress')
        expect(sessionAfterDeletion).toBeNull()
    });
    
})