//Once we have established a connection to our database and required all the necessary packages, we can now begin defining our server-side logic. 
//So for storing an image in MongoDB, we need to create a schema with mongoose. 
//For that create the file `model.js` file and define the schema. 
//The important point here is that our data type for the image is a Buffer which allows us to store our image as data in the form of arrays.

import { Schema, model } from 'mongoose';
  
var imageSchema = new Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});

//Image is a model which has a schema imageSchema
   
export default new model('Image', imageSchema);