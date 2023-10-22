const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../../app.js");
const User = require("../../models/User.js");

const { TEST_DB_HOST, PORT = 3000 } = process.env;

describe("test auth routes", () => {
    let server = null;

    beforeAll(async () => {
        await mongoose.connect(TEST_DB_HOST);
        server = app.listen(PORT);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    test('should signup a new user, login, and check duplicate email', async () => {
        const userData = {
            email: 'test@example.com',
            password: '456987',
        };

        const responseSignup = await request(app)
            .post('/api/users/register')
            .send(userData);

        expect(responseSignup.status).toBe(201);
        expect(responseSignup.body).toHaveProperty('user');
        expect(responseSignup.body.user).toHaveProperty('email');
        expect(typeof responseSignup.body.user.email).toBe('string');
        expect(responseSignup.body.user).toHaveProperty('subscription');
        expect(typeof responseSignup.body.user.subscription).toBe('string');

        const responseDuplicateEmail = await request(app)
            .post('/api/users/register')
            .send(userData);

        expect(responseDuplicateEmail.status).toBe(409);
        expect(responseDuplicateEmail.body).toHaveProperty('message');
        expect(responseDuplicateEmail.body.message).toBe('Email is in use');

        const responseLogin = await request(app)
            .post('/api/users/login')
            .send(userData);

        expect(responseLogin.status).toBe(200);
        expect(responseLogin.body).toHaveProperty('token');
        expect(responseLogin.body).toHaveProperty('user');
        expect(responseLogin.body.user).toHaveProperty('email');
        expect(typeof responseLogin.body.user.email).toBe('string');
        expect(responseLogin.body.user).toHaveProperty('subscription');
        expect(typeof responseLogin.body.user.subscription).toBe('string');
    });
});
