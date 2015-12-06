        // SHREY CODE IN TEST FOLDER IN test.js

        var Hapi = require('hapi');
        var server = new Hapi.Server();
        var Joi = require('joi');
        var Boom = require("boom");

        server.connection({ port: 3000 });

        //MOHAN CODE 
        server.on('log', (event, tags) => {
            if (tags.error) {
                console.log(event);
            }
        });

        // DHRUV CODE
        server.state('session', {
            ttl: 60 * 60 * 1000,     // One hour
            isSecure: false,
            path: '/',
            encoding: 'base64json'
        });
        
        // MOHAN CODE
        var dbOpts = {
            "url": "mongodb://localhost:27017/test",
            "settings": {
                "db": {
                    "native_parser": false
                }
            }
        };
        // MOHAN CODE
        server.register({
            register: require('hapi-mongodb'),
            options: dbOpts
        }, function (err) {
            if (err) {
                console.error(err);
                throw err;
            }
        });
        // MOHAN CODE
        server.register(require('vision'), function (err) {

            server.views({
                engines: {
                    html: require('handlebars')
                },
                relativeTo: __dirname,
                path: 'public'
            });
        });

        // DHRUV CODE
       var registerHandler = function (request, reply) {
                    
                    var data = request.payload;
                    var db = request.server.plugins['hapi-mongodb'].db;
                    var user = {name: data.username, pass:data.password};


                      db.collection('users').findOne({  "name" : data.username }, function(err, result) {
                        if (err) return reply(Boom.internal('Internal MongoDB error', err));
                        if(result == null){
                            db.collection('users').insert(user);
                            reply.redirect('/login');
                        }
                        else{

                            reply.view('register', {"message" : "username already exists"});
                        }
                        });
                };
      


                // DHRUV CODE

        server.method('isValidUser', function (request,reply, next) {
                       
                var flag = false;
                var user = {"name" : request.payload.username, "pass" : request.payload.password};
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').
                findOne(user, function(err, result) {

                        if (err) return reply(Boom.internal('Internal MongoDB error', err));

                        if(result == null){
                            
                            reply.view('login', {"message" : "username and/or password invalid"});
                        }
                        else {
                            flag = true; 
                            var session = { user:  request.payload.username};
                            reply.view('userpage', {"username" : session.user}).state('session', session);                   
                        }
                        });

            next(null, flag); });

            // SOUMIK CODE
            server.route({
                method: 'GET',
                path: '/',
                handler: function (request, reply) {
                    reply.view('hello');
                }
            });
             server.route({
                method: 'GET',
                path: '/register',
                handler: function (request, reply) {
                    reply.view('register');
                }
            });
               server.route({
                method: 'POST',
                path: '/register',
                config: {               // SOUMIK CODE (VALIDATION WITH JOI)
                    validate: {
                        payload:{
                            username: Joi.string().min(2).max(20),
                            email: Joi.string().email().required(),
                            password: Joi.string().min(2).max(200).required(),
                            password_confirm:Joi.any().valid(Joi.ref('password')).required()   
                        }
                        // failAction: function (request, reply) {
                        // return reply.view('register',{"message" : "one or more fields invalid"});
                        // }
                    }

                },
                handler: registerHandler
            });
              server.route({            // DHRUV CODE
                method: 'GET',
                path: '/login',
                handler: function (request, reply) {
                    console.log(request.state);
                    var session = request.state.session;
                    if(session) {
                        reply.view('userpage',{"username" : session.user});
                    }
                    else {
                        reply.view('login');
                    }
                }
             
            });
               server.route({
                method: 'POST',
                path: '/login',
                config: {       //SOUMIK CODE (VALIDATION WITH JOI)
                    validate: {
                        payload:{
                            username: Joi.string().min(2).max(20),
                            password: Joi.string().min(2).max(200).required(),  
                        }

                    }

                },
                handler:  function (request, reply) {

                    server.methods.isValidUser(request,reply, 
                    function (err, result){
                   
                    });

                    }
            });

        // MOHAN CODE
        server.start(function () {
            console.log('Server running at:', server.info.uri);
            server.log(['error', 'database', 'read'], 'Test event');
        });

        module.exports = server;
