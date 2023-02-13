const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const uri =
  "mongodb+srv://tringuyen:Tri123456@cluster0.bru8zpm.mongodb.net/todolist-v1?retryWrites=true&w=majority";

try {
  // Connect to the MongoDB cluster
   mongoose.connect(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected")
  );

} catch (e) {
  console.log("could not connect");
}

const itemSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("todo", itemSchema);
const app = express();
const item1 = new Item({
    name:"A"
});
const item2 = new Item({
    name:"B"
});
const item3 = new Item({
    name:"C"
});
const listItem = [item1, item2, item3];



const pathSchema = ({
    name: String,
    items: [itemSchema]
});

const path = mongoose.model("path", pathSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function(req, res){
    var day = "Today";
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(listItem);
        }else{
            res.render("list", {day: day, items: foundItems});
        }
    })
    
});
app.get("/:listName", function(req, res){
    const customListName =  _.lowerCase(req.params.listName);

    path.findOne({name: customListName},function(err, results){
        if(!err){
            if(!results){
                const listPath = new path({
                    name: customListName,
                    items: listItem
                });
                listPath.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list", {day: results.name, items: results.items});
            }
        }
        else{
            console.log(err);
        }
    })
})
app.post("/delete", function(req, res){
    const idDelete = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(idDelete, function(err, foundItems){
            if(err){
                console.log(err);
            }else{
                console.log("Deleted : ", foundItems);
            }
            res.redirect("/");
        })
    }else{
        path.findOneAndUpdate({name: listName},{$pull: {items: {_id: idDelete}}} ,function(err, foundItems){
            if(err){
                console.log(err);
            }else{
               res.redirect("/" + listName);
            }
        })
    }
})
app.post("/",function(req, res){

    const item = req.body.newItem;
    const list = req.body.button;
    
    console.log(list);
    const addItem = new Item({
        name:item
    })

    if(list === "Today"){
        addItem.save();
        res.redirect("/");
    }else{
        path.findOne({name: list}, function(err, foundList){
            if(err){
                console.log(err);
            }else{
                foundList.items.push(addItem);
                foundList.save();  
                res.redirect("/" + list);
            }
        })
    }
})
app.listen(3000, function(){
    console.log("Server running on port 3000");
});