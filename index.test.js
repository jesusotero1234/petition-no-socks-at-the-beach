const supertest = require('supertest'); //?
const { app } = require('./index.js');
const cookieSession = require('cookie-session');



test('1) Request to go to /petition without login', () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get('/petition')
        .then(res => {
            // expect(res.statusCode).toBe(302);
            expect(res.header['location']).toBe('/register');
        });
});

test('2) Redirected to /petition after login', () => {
    cookieSession.mockSessionOnce({
        userId: 1
    });
    return supertest(app)
        .get('/login')
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header['location']).toBe('/petition');
        });
});
test('2) Redirected to /petition after login', () => {
    cookieSession.mockSessionOnce({
        userId: 1
    });
    return supertest(app)
        .get('/register')
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header['location']).toBe('/petition');
        });
});


test('3) end to thanks if already signed the petition and attemp to go to to sign again', () => {
    cookieSession.mockSessionOnce({
        userId: 2
    });
    return supertest(app)
        .get('/petition')
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header['location']).toBe('/thanks');
        });
});

test('send to /petition if they are logged in and they attemp to go to /signers or /thanks without signing', () => {
    cookieSession.mockSessionOnce({
        userId: 1
    });
    return supertest(app)
        .get('/signers')
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header['location']).toBe('/petition');
        });
});

// cookieSession.mockSession({
//     userId: 1
// })
