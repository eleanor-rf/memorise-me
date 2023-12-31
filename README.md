# memorise me 📚📝💡
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white) 

Flashcard web app. Live at [https://memorise-me.web.app/](https://memorise-me.web.app/)

Work in progress!

## Current features
* Simple and responsive web layout using Flexbox and media queries
* Sign up and sign in and out using Firebase Authentication
* Upload a .csv of flashcards which is parsed into JSON using [PapaParse](https://github.com/mholt/PapaParse)
* Flashcards are stored in Firestore attached to the user's unique ID
* The Practice page implements the [SuperMemo2](https://super-memory.com/english/ol/sm2.htm) algorithm and will display the calculated cards each day it is visited
* After practicing each question the user gives a rating, which calculates the next date that this item will be encountered

## Future additions
* Improve the user experience in general (e.g. tell users when they have signed up successfully)
* Add ability to edit card set through the web app interface
* Remove ability to upload a new set if a set already exists
* Add flip animation to flashcards
* Better navigation system e.g. navigation bar
