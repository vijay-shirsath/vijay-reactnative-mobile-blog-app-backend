import multer from "multer";  
 //Multer is an npm package for handling file uploads in Node.js applications. It's commonly used with web frameworks like Express to manage the reception and storage of files that are uploaded by clients, typically via HTTP POST requests.

 // Define storage settings for uploaded files
const storage = multer.diskStorage({
   
  });
  
  // Define a filter function to accept only image files
  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.includes("image")) {
      return cb(new Error("Invalid image format!"), false);
    }
    cb(null, true);
  };
  
  // Create a Multer instance with the defined storage and file filter settings
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  });
  
  export default upload;
