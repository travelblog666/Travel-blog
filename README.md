

#Steps after downloading the project and opening the the entire project code in vscode

#note:-All the html,css,js files are inside public folder

Step 1   have the Node js installed and open the extracted folder in the VS STUDIO or  VS  code

step 2    In the terminal install the necessary dependencies 
           npm i express body-parser mongoose bycrypt multer path express-session


step 3  signin in mongodb and get the link of ur cluster and  replace in index.js line no 30 
            mongoose.connect('mongodb+srv://username:password@cluster0.0lg5lq0.mongodb.net/', {

step 4  go to the index.js page and click on run than start debugging when terminal opens select the 
            debug console and waite till u get connected to database successfully message


step 5  open any browser and type localhost:3000 and press enter 

------------------------------------
To manually add an admin user to your MongoDB Atlas cluster, you can follow these steps using MongoDB Compass, which is a graphical user interface for MongoDB:

1. **Access MongoDB Atlas:**
   - Go to the MongoDB Atlas website (https://www.mongodb.com/cloud/atlas).
   - Log in to your MongoDB Atlas account.

2. **Choose Your Project and Cluster:**
   - If you have multiple projects, select the correct project.
   - Click on your cluster to access its details.

3. **Connect to Your Cluster with MongoDB Compass:**
   - In the cluster details page, click the "Connect" button.
   - Choose "Connect with MongoDB Compass."

4. **Download and Install MongoDB Compass:**
   - Follow the prompts to download and install MongoDB Compass if you haven't already.

5. **Open MongoDB Compass:**
   - After installation, open MongoDB Compass.

6. **Configure Connection:**
   - MongoDB Compass should open with a connection dialog.
   - The connection string should already be populated. Click "Connect."

7. **Access Your Database:**
   - In MongoDB Compass, you'll see your connected cluster. Click on it to explore the databases.

8. **Choose the Database:**
   - Select the database where you want to add the admin user. You might already have a "users" collection within that database.

9. **Add a New Document (Admin User):**
   - In the database view, click the "Add Data" button.
   - Select the collection where you want to add the admin user (e.g., "users").
   - In the "Insert Document" dialog, enter the details for your admin user document, setting `isAdmin` to `true`. For example:

   ```json
   {
       "name": "Admin Name",
       "email": "admin@example.com",
       "phno": "1234567890",
       "password": "adminPassword",
       "isAdmin": true
   }
   ```

   - Click the "Insert" button to add the admin user document to the collection.

10. **Save the Document:**
    - After inserting the document, MongoDB Compass will display a success message. The admin user has now been manually added to your MongoDB Atlas database.

Remember to replace the example values with the actual admin user information you want to add, and consider using secure password storage practices like hashing and salting for production applications.
