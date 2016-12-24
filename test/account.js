var assert = require('assert'),
    should = require("should"),
    supertest = require("supertest"),
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    config = require('../config'),
    server = supertest.agent(config.uri);

console.log("Server URL: ", config.uri);

describe('Account Tests', function() {

    var token = null,
        random = Math.random().toString() + Date.now().toString(),
        email = random.replace(/\D/g,'') + '@' + random.replace(/\D/g,'') + '.com';

    var user = {
        'name': random,
        'email': email,
        'password': random
    };

    before(function(done) {
        mockgoose(mongoose).then(function() {
            mongoose.connect('mongodb://localhost/jessica', function(err) {
                done(err);
            });
        });
    });

    it('/POST Create Account Complete', function (done) {
        server
            .post('/api/account')
            .send(user)
            .expect("Content-type", /[json|javascript]/)
            .expect(200)
            .end(function(err,res){
                res.body.message.should.equal('Account create with success');
                res.body.data.email.should.equal(email);
                res.body.data.name.should.equal(random);
                done();
            });
    });

    it('/POST Login Account Complete', function (done) {
        server
            .post('/api/account/auth')
            .send({email: email, password: random })
            .expect("Content-type", /[json|javascript]/)
            .expect(200)
            .end(function(err,res){

                res.body.success.should.equal(true);
                if(res.body.success) token = res.body.token;
                done();
            });
    });

    it('/GET Accounts List Complete', function (done) {
        server
            .get('/api/account')
            .set('x-access-token', token)
            .expect("Content-type", /[json|javascript]/)
            .expect(200)
            .end(function(err,res){
                
                done();
            });
    });
});

