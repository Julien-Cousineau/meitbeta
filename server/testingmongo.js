var MongoClient = require('mongodb').MongoClient;
const IP = process.env.IP;
var url = "mongodb://" + IP +":27017/meitdata";

const collection = "convert";
// const collection = "table";

function Test(){
  // this.createdb();
  // this.createCollection();
  // this.insertOne();
  // this.insertMany();
  // this.findOne();
  this.findMany();
  // this.findManyWithAttr();
  // this.query();
  // this.update();
  // this.delete();
}
Test.prototype = {
  createdb:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log("Database created!");
      db.close();
    });
  },
  createCollection:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("meitdata"); //here
      dbase.createCollection("table", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
      });
    });    
  },
  insertOne:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("meitdata"); //here
      var myobj = { name: "table1", 
                    datecreated: new Date().toString(),
                    childids:[]
                    
                    };
      dbase.collection("table").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
  },
  insertMany:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("mydb"); //here
      var myobj = [
        { name: 'John', address: 'Highway 71'},
        { name: 'Peter', address: 'Lowstreet 4'},
        { name: 'Amy', address: 'Apple st 652'},
        { name: 'Hannah', address: 'Mountain 21'},
        { name: 'Michael', address: 'Valley 345'},
        { name: 'Sandy', address: 'Ocean blvd 2'},
        { name: 'Betty', address: 'Green Grass 1'},
        { name: 'Richard', address: 'Sky st 331'},
        { name: 'Susan', address: 'One way 98'},
        { name: 'Vicky', address: 'Yellow Garden 2'},
        { name: 'Ben', address: 'Park Lane 38'},
        { name: 'William', address: 'Central st 954'},
        { name: 'Chuck', address: 'Main Road 989'},
        { name: 'Viola', address: 'Sideway 1633'}
      ];
      dbase.collection("customers").insertMany(myobj, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });
    });
  },
  findOne:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("mydb"); //here
      dbase.collection("customers").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result.name);
        db.close();
      });
    });    
  },
  findMany:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("meitdata"); //here
      dbase.collection(collection).find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });    
  },
  findManyWithAttr:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("mydb"); //here
      var query = { address: "Park Lane 38" };
      dbase.collection("customers").find({}, { _id: 0, name: false, address: true }).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });    
  },
  query:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("mydb"); //here
      var query = { address: "Park Lane 38" };
      dbase.collection("customers").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });    
  },
  update:function(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("mydb"); //here
      var myquery = { address: "Canyon 123" };
      var newvalues = { $set: { address: "Valley 345" } };
      dbase.collection("customers").updateOne(myquery,newvalues,function(err, result) {
        if (err) throw err;
        console.log(result.result.nModified);
        db.close();
      });
    });       
  },
  delete:function(){
        MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbase = db.db("meitdata"); //here
      var myquery = { name: "arcticWIG_09212017.csv2" };
      dbase.collection(collection).deleteMany(myquery,function(err, result) {
        if (err) throw err;
        db.close();
      });
    });   
  },

};


new Test();
