const bcrypt = require("bcrypt");

const enteredPassword = "Password123!";
const storedHashedPassword = "$2b$10$ShZd5C9CH8JvqOC0hzeFi.rRF523MsrQkbyD79aNc14lU96S3Is5C"; // Replace with actual hash from DB

bcrypt.compare(enteredPassword, storedHashedPassword, (err, result) => {
    if (err) {
        console.error("Error comparing passwords:", err);
    } else {
        console.log("Manual bcrypt.compare result:", result);
    }
});