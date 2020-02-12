/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          expect(err, 'database error').to.not.exist;
          console.log('Successful database connection');
          let database = client.db("test");
          var collection = database.collection("books");
          collection.find().toArray((err, docs) => {
            docs.map(el => { el["commentcount"] = el.comments.length; delete el.comments;});
            res.json(docs);
          });
        });
    })
    .post(function (req, res){
      var title = req.body.title;
      if(!title) {
        res.send('missing title');
      } else {
        expect(title, 'posted title').to.be.a('string');
          MongoClient.connect(CONNECTION_STRING, function(err, client) {
              expect(err, 'database error').to.not.exist;
              console.log('Successful database connection');
              let database = client.db("test");
              var collection = database.collection("books");
              var book = {title:title, comments:[]};
              collection.insertOne(book, (err, doc) => {
                book._id = doc.insertedId;
                res.json(book);
              });
          });
        }
    })
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        expect(err, 'database error').to.not.exist;
        console.log('Successful database connection');
        let database = client.db("test");
        var collection = database.collection("books");
        collection.remove();
        res.send("complete delete successful");
      });
    });


  app.route('/api/books/:id')
     .get(function (req, res){
      var bookid = req.params.id;

      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        if (bookid) bookid = ObjectId(bookid);
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
            expect(err, 'database error').to.not.exist;
            console.log('Successful database connection');
            let database = client.db("test");
            var collection = database.collection("books");
            collection.find({_id: bookid}).toArray((err, result) => {
                expect(err, 'database find error').to.not.exist;
                if(result.length === 0) {
                  res.send('no book exists');
                } else {
                  res.json(result[0]);
                }
            });
        });
    })
     .post(function(req, res){
     var bookid = req.params.id;

      if (bookid) bookid = ObjectId(bookid);
      var comment = req.body.comment;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection('books');
        collection.findAndModify(
          {_id: bookid},
          {},
          {$push: { comments: comment }},
          {new: true, upsert: false},
          function(err, result){
            expect(err, 'database findAndModify error').to.not.exist;
            res.json(result.value);
          })
      });
    })
    .delete(function(req, res){
       var bookid = req.params.id;

      if (!bookid) {
          res.send('_id error');
        } else {
          MongoClient.connect(CONNECTION_STRING, function(err, client) {
              expect(err, 'database error').to.not.exist;
              console.log('Successful database connection');
              let database = client.db("test");
              var collection = database.collection("books");
              collection.findAndRemove({_id:new ObjectId(bookid)}, (err, data) => {
                if (err) {
                  res.send('could not delete ' + bookid);
                } else {
                  res.send('deleted successful');
                }
              });
          });
        }
    });

};
