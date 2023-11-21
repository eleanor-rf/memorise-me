import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import firebaseConfig from './config.js';

document.addEventListener("DOMContentLoaded", function() {

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

//logged in already? bypass login page
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    if (window.location.pathname.includes("index.html")) {
    window.location.href = './access.html';
    }
    else { }
  } else {
    if (window.location.pathname.includes("index.html")) { }
    else { window.location.href = 'index.html'; }
  }
});

// sign up
if($('body').hasClass('logInPage')){
    const signUpBtn = document.getElementById('signUpBtn');
    const errorMessage = document.getElementById('errorMessage');

    signUpBtn.addEventListener('click', () => {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const auth = getAuth(); // Get the Auth object

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
    });
};

//sign in
if($('body').hasClass('logInPage')){
signInBtn.addEventListener('click', () => {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const auth = getAuth(); // Get the Auth object
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    window.location.href = './access.html';
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
});
};

// sign out - fix the hasclass later once every page has a sign out button!
if ($('body').hasClass('accessCards')) {
const signOutButton = document.getElementById('signOutButton');
signOutButton.addEventListener('click', () => {
const auth = getAuth();
signOut(auth).then(() => {
  window.location.href = './index.html';
}).catch((error) => {
  // An error happened.
});
});
};

//uploading and parsing a .csv
if ($('body').hasClass('manageCards')) {
  const uploadButton = document.getElementById('uploadButton');
  const fileInput = document.getElementById('csvFileInput');

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // get the user id for the document reference in firestore
      const uid = user.uid;
      
      uploadButton.addEventListener('click', function(event) {
        if (fileInput.files.length === 0) {
          alert('Please select a file before uploading.');
          return;
        } else { //parse the selected .csv
            const file = fileInput.files[0];
            Papa.parse(file, {
              header: true,
              complete: async function(results) {
                const parsedData = results.data.reduce((acc, item, index) => {
                  if (item && item['Question'] && item['Answer']) {
                  acc[`question${index}`] = item['Question'];
                  acc[`answer${index}`] = item['Answer'];
                  acc[`nextDate${index}`] = new Date();
                  acc[`eFactor${index}`] = 2.5;
                  acc[`interval${index}`] = 1;
                  acc[`repetition${index}`] = 0;
                  // acc[`lastRating${index}`] = null; //maybe not needed
                  }
                  return acc;
                  }, {});

                  console.log(parsedData);
                  await setDoc(doc(db, 'user-flashcards', uid), parsedData);
                  }
                });
              }
        });
    }
  });
};

//flashcard practice and spaced repetition
if ($('body').hasClass('flashcardPractice')) {

const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // get the user id for the document reference in firestore
      const uid = user.uid;

const docRef = doc(db, "user-flashcards", uid);
const docSnap = await getDoc(docRef);
const data = docSnap.data();
const today = new Date();

// select today's flashcards - compare the currentDate at 00:00:00 with today at 00:00:00
function isTodayOrBefore(a, b) {
let timestamp = new Date(a.seconds * 1000 + a.nanoseconds/1000000);
let currentDate = new Date(Date.UTC(timestamp.getFullYear(),timestamp.getMonth(), timestamp.getDate()));
let todaysDate = new Date(Date.UTC(b.getFullYear(),b.getMonth(), b.getDate()));
return currentDate <= todaysDate;
}

const dueQuestions = Object.keys(data)
  .filter(key => key.startsWith('nextDate') && isTodayOrBefore(data[key],today))
  .map(key => key.replace('nextDate', ''));

dueQuestions.sort((a, b) => a - b);
console.log(dueQuestions);

let isQuestionDisplayed = false;

//code for flashcard container - display correct Qs and toggle between Q and A on click
// TO DO - add flipping animation
document.getElementById('flashcardContainer').addEventListener("click", function() {
  if ((i >= dueQuestions.length - 1) || (dueQuestions.length === 0)) {
      document.getElementById('flashcardContainer').textContent = 'All done for today :) come back tomorrow!';
    }
      else if (isQuestionDisplayed === false){
      let questionField = "question" + dueQuestions[i];
      isQuestionDisplayed = true;
      document.getElementById('flashcardContainer').textContent = data[questionField];
        }
        else if (isQuestionDisplayed === true) {
          let answerField = "answer" + dueQuestions[i];
          document.getElementById('flashcardContainer').textContent = data[answerField];
          isQuestionDisplayed = false;
        }
    });

// implement supermemo2 algorithm
async function findNextDate(i,rating){
const interval = `interval${i}`;
const repetition = `repetition${i}`;
const eFactor = `eFactor${i}`;
const date = `nextDate${i}`;

let nextInterval = 0;
let nextRepetition = 0;

const nextEFactor = data[eFactor] + (0.1-(5-rating)*(0.08+(5-rating)*0.02));

if (rating >=3){
  if (data[repetition] === 0){
       nextInterval = 1;
       nextRepetition = 1;
  }
  else if (data[repetition] === 1){
       nextInterval = 6;
       nextRepetition = 2;
  }
  else {
       nextInterval = Math.ceil(data[interval]*data[eFactor]);
       nextRepetition = data[repetition] + 1;
  }
}
else {
    nextInterval = 1;
    nextRepetition = 0;
  }

let timestamp = new Date(data[date].seconds * 1000 + data[date].nanoseconds/1000000);
let incrementedDate = new Date();
incrementedDate.setDate(timestamp.getDate() + nextInterval);
console.log(incrementedDate);

await updateDoc(doc(db, 'user-flashcards', uid), {
  [eFactor]: nextEFactor,
  [repetition]: nextRepetition,
  [interval]: nextInterval,
  [date]: incrementedDate
  });
}

//when user clicks on one of the 6 rating containers, 0-5, update the next date for the current question from dueQuestions array
//and display the next question from dueQuestions
let i = 0;
for (let j = 0; j <= 5; j++) {
    document.getElementById(`rate${j}`).addEventListener("click", function() {
      if (dueQuestions.length >= 1) {
        findNextDate(dueQuestions[i], j); }
      if ((i >= dueQuestions.length - 1) || (dueQuestions.length === 0)){
      document.getElementById('flashcardContainer').textContent = 'All done for today :) come back tomorrow!';
      } else {
      i++;
      console.log(i);
      let questionField = "question" + dueQuestions[i];
      document.getElementById('flashcardContainer').textContent = data[questionField];
      isQuestionDisplayed = true;
      }
    });
}
}
});
};

});


