// passwordGenerator.js

// Function to generate a random password using Polish words
function generatePassword(wordArray, numWords = 3) {
    if (numWords < 1 || numWords > wordArray.length) {
        throw new Error("Number of words should be between 1 and the length of the word array.");
    }
    
    // Shuffle the array of words
    const shuffledWords = wordArray.sort(() => 0.5 - Math.random());
    
    // Select the first 'numWords' words to create a password
    const selectedWords = shuffledWords.slice(0, numWords);
    
    // Join the words with a separator, e.g., '-'
    return selectedWords.join('-');
}

// Example usage:
const polishWords = ["kot", "pies", "dom", "słońce", "drzewo", "samochód", "wiatr"];
const password = generatePassword(polishWords);
console.log(`Generated password: ${password}`);