'use strict';
//Basic Setup
const Hapi = require('hapi');
const Joi = require('joi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const mongoose = require('mongoose');

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 7002
});

// Connecting MongoDB & Importing Models
mongoose.connect('mongodb://localhost/restdemo');
var UserModel = require('./models/user');

// Register Inert & Vision For Registring Swagger
server.register([
{ register: Inert },
{ register: Vision }
]);

// Register Swagger
server.register({ register: HapiSwagger }, function (err) {
  if (err) {
    server.log(['error'], 'hapi-swagger load error: ' + err );
  } else {
    server.log(['start'], 'hapi-swagger interface loaded');
  }
});

// API Route

server.route({
  method: 'GET',
  path: '/api/user',
  config: {
    tags: ['api'],
    description: 'Get All User data',
    notes: 'Get All user Data',

    handler: function (request, reply) {
      // Fetch all data from User Collection.
      UserModel.find({}, function (error, data) {
        if (error) {
          reply({
            statusCode: 503,
            message: 'Failed to get data',
            data: error
          });
        } else {
          reply({
            statusCode: 200,
            message: 'User Data Successfully Fetched',
            data: data
          });
        }
      });
    } 
  }
});

server.route({
  method: 'POST',
  path: '/api/user',
  config: {
    tags: ['api'],
    description: 'Save user data',
    notes: 'Save user data',
    // Using Joi plugin to validate request
    validate: {
      payload: {
        name: Joi.string().required(),
        age: Joi.number().required()
      }
    },
    handler: function (request, reply) {
      
      // Create mongodb user object to save it into database.
      let user = new UserModel(request.payload);

      // Call save methods to save data into database
      user.save(function (error) {
        if (error) {
          reply({
            statusCode: 503,
            message: error
          });
        } else {
          reply({
            statusCode: 201,
            message: 'User Saved Successfully'
          });
        }
      });
    }
  }
});


server.route({
  method: 'GET',
  path: '/api/user/{id}', // Getting data for particular user "/api/user/123456789"
  config: {
    tags: ['api'],
    description: 'Get specific user data',
    notes: 'Get specific user data',
    validate: {
      params: { //Id is required filed
        id: Joi.string().required()
      }
    },
    handler: function (request, reply) {
      UserModel.find({_id: request.params.id}, function (error, data) {
        if (error) {
          reply({
            statusCode: 503,
            message: 'Failed to get data',
          });
        } else {
          if (data.length === 0) {
            reply({
              statusCode: 200,
              message: 'User Not Found',
              data: data
            });
          } else {
            reply({
              statusCode: 200,
              message: 'User Data Successfully Fetched',
              data: data
            });
          }
        }
      });
    }
  }
});

server.route({
  method: 'PUT',
  path: '/api/user/{id}',
  config: {
    tags: ['api'],
    description: 'Update specific user data',
    notes: 'Update specific user data',
    validate: {
      params: {
        id: Joi.string().required()
      },
      payload: {
        name: Joi.string(),
        age: Joi.number()
      }
    },
    handler: function (request, reply) {
      // `findOneAndUpdate` is a mongoose model methods to update a particular record.
      UserModel.findOneAndUpdate({_id: request.params.id}, request.payload, function (error, data) {
        if (error) {
          reply({
            statusCode: 503,
            message: 'Failed to get data',
            data: error
          });
        } else {
          reply({
            statusCode: 200,
            message: 'User Updated Successfully',
            data: data
          });
        }
      });
    }
  }
});

server.route({
  method: 'DELETE',
  path: '/api/user/{id}',
  config: {
    tags: ['api'],
    description: 'Remove specific user data',
    notes: 'DRemove specific user data',
    validate: {
      params: {
        id : Joi.string().required()
      }
    },

    handler: function (request, reply) {
      UserModel.findOneAndRemove({_id: request.params.id}, function (error) {
        if (error) {
          reply({
            statusCode: 503,
            message: 'Error in removing specific user',
            data: error
          });
        } else {
          reply({
            statusCode: 200,
            message: 'User Deleted Successfully'
          });
        }
      });
    }
  }
});

server.start( (err) => {

  if (err) {
    throw err;
  }

  console.log(`server runnning at ${server.info.uri}`);
});
