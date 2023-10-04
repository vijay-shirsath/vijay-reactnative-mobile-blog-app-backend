import { check, validationResult } from "express-validator";

export const postValidator = [
  check("title").trim().not().isEmpty().withMessage("post title is missing!"),
  check("content").trim().not().isEmpty().withMessage("post content is missing!"),
  check("meta").trim().not().isEmpty().withMessage("meta discription is missing!"),
  check("slug").trim().not().isEmpty().withMessage("post slug is missing!"),
  check("tags").isArray().withMessage("tags must be array of strings").custom((tags) => {
    for(let t of tags){
        if(typeof t !== "string"){
            throw Error("tags must be array of strings!");
        }
    }
    return true
  }),
  //check("thumbnail.url").trim().isURL(), // Assuming thumbnail.url is a URL
  //check("thumbnail.public_id").trim().isString(), // Assuming thumbnail.public_id is a String
]

export const validate = (req,res,next) => {
  const error = validationResult(req).array();
  if(error.length){
    return res.status(404).json({error : error[0].msg});
  }
  next();
}


/* 
This code appears to be part of an Express.js application, specifically for handling the creation of blog posts. Let's break down the code and explain its components:

Validation Middleware (postValidator):

This middleware, defined in postValidator, uses Express Validator to validate the incoming request's body.
It checks several fields, such as "title," "content," "meta," "slug," "tags," "thumbnail.url," and "thumbnail.public_id," to ensure they meet specific criteria.
Custom validation is applied to the "tags" field to verify that it's an array of strings.
Validation Function (validate):

validate is another middleware function that runs after postValidator.
It checks the results of validation using validationResult and collects any validation errors.
If validation errors are found, it responds with a 404 status code and the error message from the first validation error encountered.
Express Router for Creating Posts:

A router is created to handle routes related to creating blog posts. It's exported for use in other parts of your application.
The /create route is defined, and it expects a POST request.
It uses the upload middleware (which appears to be for handling file uploads using Multer) to process the "thumbnail" field.
The postValidator middleware is used to validate the request's body, ensuring that all required fields meet the specified criteria.
The validate middleware is used to check for any validation errors and respond accordingly.
Finally, the createPost controller function (not shown in the provided code) is responsible for actually creating the blog post.
In summary, this code sets up a route for creating blog posts in an Express.js application. It ensures that the request body is validated according to the defined criteria, and any validation errors are handled appropriately before attempting to create a new post.
*/