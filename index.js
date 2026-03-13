// Password Generator Application using Polish Words

const polishWords = [
    'kot',
    'pies',
    'dom',
    'samochód',
    'drzewo',
    'kwiatek',
    'słońce',
    'ksieżyc',
    'gwiazda',
    'szkoła'
];

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * polishWords.length);
    return polishWords[randomIndex];
}

function generatePassword(wordCount) {
    let password = '';
    for (let i = 0; i < wordCount; i++) {
        password += getRandomWord() + (i < wordCount - 1 ? '-' : '');
    }
    return password;
}

// Example usage
console.log(generatePassword(3)); // Generates a password with 3 random Polish words
