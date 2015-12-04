var Hapi = require('hapi');
var server = new Hapi.Server();
var bell = require('bell');

var Joi = require('joi');



server.connection({ port: 3000 });

var Boom = require("boom");
 
var dbOpts = {
    "url": "mongodb://localhost:27017/test",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};


server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});


server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            console.log(request);
            reply.file('./public/hello.html');
        }        
    });
     server.route({
        method: 'GET',
        path: '/register',
        handler: function (request, reply) {
            reply.file('./public/register.html');
        }

    });
      server.route({
        method: 'GET',
        path: '/login',        
        handler: function (request, reply) {
            reply.file('./public/login.html')
            //console.log(request);
        }
       
    });

      server.route({
        method: 'POST',
        path: '/register',
        config: {
            validate: {
                payload:{
                    username: Joi.string().min(2).max(20),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(2).max(200).required(),
                    password_confirm:Joi.any().valid(Joi.ref('password')).required()   
                }

            }

        },
        handler: function (request, reply) {
            
            var data = request.payload;

            var db = request.server.plugins['hapi-mongodb'].db;
            var doc = {name: data.username, pass:data.password};
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;


              db.collection('users').findOne({  "name" : data.username }, function(err, result) {
                if (err) return reply(Boom.internal('Internal MongoDB error', err));
                if(result == null){
                    db.collection('users').insert(doc);
                    reply.redirect('/login');
                }
                else{
                    reply(Boom.unauthorized('username already exist'));
                }
                
                });
 

        }
    });



});
    




server.start(function () {
    console.log('Server running at:', server.info.uri);
});

