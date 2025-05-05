// импортируем слова из файла
import { WORDS } from "./words.js";

// количество попыток
const NUMBER_OF_GUESSES = 6;
// сколько попыток осталось
let guessesRemaining = NUMBER_OF_GUESSES;
// текущая попытка
let currentGuess = [];
// следующая буква
let nextLetter = 0;
// загаданное слово
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
// на всякий случай выведем в консоль загаданное слово, чтобы проверить, как работает игра
console.log(rightGuessString)

// Функция для установки cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Функция для получения cookie по имени
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Функция для генерации уникального ID
function generateUniqueID() {
    const userID = getCookie('userID');
    if (userID) return userID;
    const newID = 'user_' + Math.random().toString(36).substring(2, 15);
    setCookie('userID', newID, 365);  // Сохраняем ID на 1 год
    return newID;
}

// Используем уникальный ID для статистики
const userID = generateUniqueID();
console.log('User ID:', userID);

// Установить cookie со счётчиком отгаданных слов
function setGuessedCount(count) {
    setCookie('guessedWordsCount', count, 365);
}

// Получить текущий счётчик отгаданных слов
function getGuessedCount() {
    const count = getCookie('guessedWordsCount');
    return count ? parseInt(count, 10) : 0;
}

// Увеличить счётчик на 1
function incrementGuessedCount() {
    const currentCount = getGuessedCount();
    const newCount = currentCount + 1;
    setGuessedCount(newCount);
    updateGuessedCountDisplay(newCount);
}

function updateGuessedCountDisplay(count) {
    const counterDiv = document.getElementById('guessed-count');
    if (counterDiv) {
        counterDiv.innerText = `Gefundene Wörter: ${count}`;
    }
}

const word = rightGuessString; // Загаданное слово
document.getElementById('word').textContent = word; // Отображаем слово в span



// Функция запуска стильного отсчёта и перезагрузки
function reloadPageAfterDelay(seconds = 7) {
    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown';
    countdownDiv.style.position = 'fixed';
    countdownDiv.style.bottom = '20%';
    countdownDiv.style.left = '50%';
    countdownDiv.style.transform = 'translateX(-50%)';
    countdownDiv.style.background = 'rgba(220, 53, 69, 0.9)'; // Красно-розовый фон
    countdownDiv.style.color = 'white';
    countdownDiv.style.padding = '15px 30px';
    countdownDiv.style.borderRadius = '12px';
    countdownDiv.style.fontSize = 'clamp(1.2rem, 5vw, 2rem)'; // Адаптивный шрифт
    countdownDiv.style.zIndex = '1000';
    countdownDiv.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    countdownDiv.style.opacity = '0';
    countdownDiv.style.transition = 'opacity 0.5s ease';

    countdownDiv.innerText = `Neue Runde in ${seconds} Sekunden...`;
    document.body.appendChild(countdownDiv);

    // Плавное появление
    setTimeout(() => {
        countdownDiv.style.opacity = '1';
    }, 100);

    const countdownInterval = setInterval(() => {
        seconds--;
        countdownDiv.innerText = `Neue Runde in ${seconds} Sekunden...`;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            location.reload();
        }
    }, 1000);
}


// создаём игровое поле
function initBoard() {
    // получаем доступ к блоку на странице
    let board = document.getElementById("game-board");

    // создаём строки
    // делаем цикл от 1 до 6, потому что попыток у нас как раз 6
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        // создаём новый блок на странице
        let row = document.createElement("div")
        // добавляем к нему класс, чтобы потом работать со строками напрямую
        row.className = "letter-row"
        
        // создаём отдельные клетки
        // добавляем по 5 клеток в ряд
        for (let j = 0; j < 5; j++) {
            // создаём новый блок на странице
            let box = document.createElement("div")
            // добавляем к нему класс
            box.className = "letter-box"
            // вкладываем новый блок внутрь блока со строкой
            row.appendChild(box)
        }

        // как все 5 клеток готовы, добавляем новую строку на поле
        board.appendChild(row)
    }
}

// удаление символа
function deleteLetter () {
    // получаем доступ к текущей строке
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    // и к последнему введённому символу
    let box = row.children[nextLetter - 1]
    // очищаем содержимое клетки
    box.textContent = ""
    // убираем жирную обводку
    box.classList.remove("filled-box")
    // удаляем последний символ из массива с нашей текущей догадкой
    currentGuess.pop()
    // помечаем, что у нас теперь на одну свободную клетку больше
    nextLetter -= 1
}

// проверка введённого слова
function checkGuess () {
    // получаем доступ к текущей строке
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    // переменная, где будет наша догадка
    let guessString = ''
    // делаем из загаданного слова массив символов
    let rightGuess = Array.from(rightGuessString)

    // собираем все введённые в строке буквы в одно слово
    for (const val of currentGuess) {
        guessString += val
    }

    // если в догадке меньше 5 букв — выводим уведомление, что букв не хватает
    if (guessString.length != 5) {
        // error означает, что уведомление будет в формате ошибки
        toastr.error("Nicht alle Buchstaben wurden eingegeben!");
        // и после вывода выходим из проверки догадки
        return;
    }

    // если введённого слова нет в списке возможных слов — выводим уведомление
    if (!WORDS.includes(guessString)) {
        toastr.error("Dieses Wort steht nicht auf der Liste!")
        // и после вывода выходим из проверки догадки
        return;
    }

    // перебираем все буквы в строке, чтобы подсветить их нужным цветом
    for (let i = 0; i < 5; i++) {
        // убираем текущий цвет, если он был
        let letterColor = ''
        // получаем доступ к текущей клетке
        let box = row.children[i]
        // и к текущей букве в догадке
        let letter = currentGuess[i]
        
        // смотрим, на каком месте в исходном слове стоит текущая буква
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // если такой буквы нет в исходном слове
        if (letterPosition === -1) {
            // закрашиваем клетку серым
            letterColor = 'grey'
        // иначе, когда мы точно знаем, что буква в слове есть
        } else {
            // если позиция в слове совпадает с текущей позицией 
            if (currentGuess[i] === rightGuess[i]) {
                // закрашиваем клетку зелёным
                letterColor = 'green'
            } else {
                // в противном случае закрашиваем жёлтым
                letterColor = 'yellow'
            }

            // заменяем обработанный символ на знак решётки, чтобы не использовать его на следующем шаге цикла
            rightGuess[letterPosition] = "#"
        }

        // применяем выбранный цвет к фону клетки
        box.style.backgroundColor = letterColor;
    }

    // если мы угадали
    if (guessString === rightGuessString) {
        // выводим сообщение об успехе
        toastr.success("Sie haben gewonnen!")
        incrementGuessedCount();
        reloadPageAfterDelay();        
        // обнуляем количество попыток
        guessesRemaining = 0;
        // выходим из проверки
        return
    // в противном случае
    } else {
        // уменьшаем счётчик попыток
        guessesRemaining -= 1;
        // обнуляем массив с символами текущей попытки
        currentGuess = [];
        // начинаем отсчёт букв заново
        nextLetter = 0;

        // если попытки закончились
        if (guessesRemaining === 0) {
            // выводим сообщение о проигрыше
            toastr.error("Sie haben keine Versuche mehr. Sie haben verloren!");
            // и выводим загаданное слово
            toastr.info(`Das gesuchte Wort: "${rightGuessString}"`)
            reloadPageAfterDelay();
        }
    }
}

// выводим букву в клетку
function insertLetter (pressedKey) {
    // если клетки закончились
    if (nextLetter === 5) {
        // выходим из функции
        return;
    }
    // получаем доступ к текущей строке
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    // и к текущей клетке, где будет появляться буква
    let box = row.children[nextLetter]
    // меняем текст в блоке с клеткой на нажатый символ
    box.textContent = pressedKey
    // добавляем к клетке жирную обводку
    box.classList.add("filled-box")
    // добавляем введённый символ к массиву, в которой хранится наша текущая попытка угадать слово
    currentGuess.push(pressedKey)
    // помечаем, что дальше будем работать со следующей клеткой
    nextLetter += 1
}

// обработчик нажатия на клавиши
document.addEventListener("keydown", (e) => {

    // если попыток не осталось
    if (guessesRemaining === 0) {
        // выходим из функции
        return;
    }

    // получаем код нажатой клавиши
    let pressedKey = String(e.key);

    // если нажат Backspace и в строке есть хоть один символ
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    // если нажат Enter
    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    // проверяем, есть ли введённый символ в немецком алфавите
    let found = pressedKey.match(/[a-zäöüß]/gi);

    if (!found || found.length > 1) {
        return;
    } else if (found[0] === "ß") {       
        let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
        let box = row.children[nextLetter];
        box.classList.add('letter-ß');
        insertLetter(pressedKey);
    } else {
        insertLetter(pressedKey);
    }

});





function initKeyboard() {
    const keys = [
        ['Q','W','E','R','T','Z','U','I','O','P','Ü','⌫'],
        ['A','S','D','F','G','H','J','K','L','Ö','Ä','ß'],
        ['🏳️','Y','X','C','V','B','N','M','Enter']
        
    ];

    const keyboard = document.getElementById("keyboard");
    keys.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(key => {
            const button = document.createElement('button');
            button.textContent = key;
            button.classList.add('keyboard-key');            
            button.setAttribute('data-key', key);
            if (key === 'Enter')      button.classList.add('enter-key');
            if (key === '⌫')         button.classList.add('backspace-key');
            if (key === '🏳️')         button.id = 'reveal-word-btn';
            button.addEventListener('click', () => handleVirtualKey(key));
            rowDiv.appendChild(button);
        });
        keyboard.appendChild(rowDiv);
    });
}

function handleVirtualKey(key) {
    if (guessesRemaining === 0) return;

    if (key === '⌫') {
        if (nextLetter !== 0) deleteLetter();
        return;
    }
    
    if (key === 'Enter') {
        checkGuess();
        return;
    }
    if (key === '🏳️') {
        // Показать слово и запустить отсчёт
        toastr.info(`Das gesuchte Wort: ${rightGuessString}`);
        reloadPageAfterDelay();
        return;
      }
    if (key === 'ß') {
        
        // Находим элемент, к которому нужно применить класс
        let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
        let box = row.children[nextLetter];
        box.classList.add('letter-ß');
        insertLetter('ß');
        
    } else if (key.length === 1 && key.match(/[a-zA-ZÄÖÜäöü]/)) {
        insertLetter(key.toLowerCase());
    }
}


// В самом конце (после initBoard())
document.addEventListener("DOMContentLoaded", function() {
    initBoard();
    initKeyboard();
    // При загрузке страницы показать текущий счётчик
    updateGuessedCountDisplay(getGuessedCount());

});

