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
          if (err) {
            console.log('Database err', + err);
          } else {
            console.log('Successful database connection');
            let database = client.db("test");
            var collection = database.collection("books");
            collection.find({}).toArray((err, docs) => {
              docs.map(el => { el["commentcount"] = el.comments.length; delete el.comments;});
              res.json(docs);
            });
          }
        })
    })

    .post(function (req, res){
      var title = req.body.title;
        var book = {
          title: req.body.title,
          comments: []
        };
        if(!book.title) {
          res.send('missing title');
        } else {
          MongoClient.connect(CONNECTION_STRING, function(err, client) {
            if (err) {
              console.log('Database err', + err);
            } else {
              console.log('Successful database connection');
              let database = client.db("test");
              var collection = database.collection("books");
              collection.insertOne(book, (err, doc) => {
                book._id = doc.insertedId;
                res.json(book);
              })
            }
          })
        }
    })

    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });


  app.route('/api/books/:id')
     .get(function (req, res){
      var bookid = req.params.id;
       console.log("bookid get", bookid);

      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        if (bookid) bookid = ObjectId(bookid);
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          if (err) {
            console.log('Database err', + err);
          } else {
            console.log('Successful database connection');
            let database = client.db("test");
            var collection = database.collection("books");
            collection.find({_id: bookid}).toArray((err, docs) => {
              res.json(docs);
            });
          }
        })
    })

     .post(function(req, res){
     var bookid = req.params.id;
     console.log("bookid add comment", bookid);

      var oid = new ObjectId(bookid);
      var comment = req.body.comment;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        expect(err, 'database error').to.not.exist;
        let database = client.db("test");
        var collection = database.collection('books');
        collection.findAndModify(
          {_id: oid},
          {},
          {$push: { comments: comment }},
          {new: true, upsert: false},
          function(err, result){
            expect(err, 'database findAndModify error').to.not.exist;
            res.json(result.value);
          });
      })
    })

    .delete(function(req, res){
       var bookid = req.params.id;
          console.log("bookid delete", bookid);

// let params = req.params;
      // var myId = params.id;
    // console.log("params", params);
    //   //if successful response will be 'delete successful'
    // console.log("delete = ", req.params, bookid, myId);
      // if (!bookid) {
      //     res.send('_id error');
      //   } else {
      //     MongoClient.connect(CONNECTION_STRING, function(err, client) {
      //       if (err) {
      //         console.log('Database err', + err);
      //       } else {
      //         console.log('Successful database connection');
      //         let database = client.db("test");
      //         var collection = database.collection("books");
      //         collection.findAndRemove({_id:new ObjectId(bookid)}, (err, data) => {
      //           if (err) {
      //             res.send('could not delete ' + bookid);
      //           } else {
      //             res.send('deleted successful');
      //           }
      //         });
      //       }
      //     })
      //   }
    });

};
