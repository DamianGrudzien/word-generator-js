let words = [];

async function loadWords() {

const response = await fetch("words.txt");
const text = await response.text();

words = text.split("\n").map(w => w.trim()).filter(Boolean);

}

loadWords();

function randomInt(max) {

const array = new Uint32Array(1);
crypto.getRandomValues(array);

return array[0] % max;

}

function generatePassphrase() {

if (words.length === 0) {
alert("Słownik jeszcze się ładuje");
return;
}

const wordCount = parseInt(document.getElementById("wordCount").value);
const separator = document.getElementById("separator").value;

const capitalize = document.getElementById("capitalize").checked;
const addNumber = document.getElementById("addNumber").checked;
const addSymbol = document.getElementById("addSymbol").checked;

let selected = [];

for (let i = 0; i < wordCount; i++) {

let word = words[randomInt(words.length)];

if (capitalize) {
word = word.charAt(0).toUpperCase() + word.slice(1);
}

selected.push(word);

}

let password = selected.join(separator);

if (addNumber) {
password += randomInt(100);
}

if (addSymbol) {

const symbols = "!@#$%^&*";
password += symbols[randomInt(symbols.length)];

}

document.getElementById("password").value = password;

updateStrength(password);

}

function updateStrength(password) {

let score = 0;

if (password.length >= 12) score++;
if (/[A-Z]/.test(password)) score++;
if (/[0-9]/.test(password)) score++;
if (/[^A-Za-z0-9]/.test(password)) score++;
if (password.length >= 20) score++;

const bar = document.getElementById("strengthBar");
const text = document.getElementById("strengthText");

const widths = ["20%","40%","60%","80%","100%"];
const colors = ["red","orange","yellow","lime","green"];
const labels = ["Very Weak","Weak","Medium","Strong","Very Strong"];

if (score === 0) score = 1;

bar.style.width = widths[score-1];
bar.style.backgroundColor = colors[score-1];

text.textContent = labels[score-1];

}

function copyPassword() {

const password = document.getElementById("password").value;

navigator.clipboard.writeText(password);

const copied = document.getElementById("copied");

copied.classList.remove("hidden");

setTimeout(() => {
copied.classList.add("hidden");
},1500);

}