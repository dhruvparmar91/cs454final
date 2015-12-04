var Hapi = require('hapi');
var server = new Hapi.Server();
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
                    reply.view('userpage', {"username" : request.payload.username});
                }
                });
    next(null, flag); });

//SERVER LOG IS DEFINED HERE  
server.on('log', (event, tags) => {
    if (tags.error) {
        console.log(event);
    }
});


function checkPassword(data) {
	var return_string;
	if(data.password === data.password_confirm) {
		return_string = "confirmed password";
	}
	else {
		return_string = "password does not match";
	}
	return return_string;
}

var loginHandler = function(request,reply) {
    if(request.payload.username !== null) {
        return reply.view('userpage', {"username" : request.payload.username});
    }
    return reply.view('login', {"message" : "username and/or password invalid"});
}


server.register(require('vision'), function (err) {

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'public'
    });
});

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
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
            var user = {name: data.username, pass:data.password};
            //var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;


              db.collection('users').findOne({  "name" : data.username }, function(err, result) {
                if (err) return reply(Boom.internal('Internal MongoDB error', err));
                //reply(result);
                //console.log(result);
                if(result == null){
                    db.collection('users').insert(user);
                    reply.redirect('/login');
                }
                else{
                    reply.view('register', {"message" : "username already exists"});
                }
                
                });
 

        }
    });
      server.route({
        method: 'GET',
        path: '/login',
        handler: function (request, reply) {
            reply.file('./public/login.html');
        }
     
    });
       server.route({
        method: 'POST',
        path: '/login',
        config: {
            validate: {
                payload:{
                    username: Joi.string().min(2).max(20),
                    password: Joi.string().min(2).max(200).required(),  
                }

            }

        },
        handler: function (request, reply) {

            server.methods.isValidUser(request,reply, 
                function (err, result){
                });
        }
    });
       
});


server.start(function () {
    console.log('Server running at:', server.info.uri);
    server.log(['error', 'database', 'read'], 'Test event');
});

