// TODO(you): Write the JavaScript necessary to complete the assignment.

//Start the question
var listQuesion = [];
var studentID;
var listSubmitAns = {};
var listQuesion = [];
var questionElement = [];

document.querySelector('.result-box').style.display = 'none';

document.querySelector('.start-btn').addEventListener('click', async() => {
    
    await axios.post('https://wpr-quiz-api.herokuapp.com/attempts', {})
        .then(function(response) {
            listQuesion = response.data.questions;
            studentID = response.data._id;
        })
        .catch(function(error) {
            console.log(error);
        });
    document.querySelector('#attempt-quiz').style.display = 'block';

    //Select all the div question
    questionElement = Array.prototype.slice.call(document.querySelectorAll('#attempt-quiz .question-container'));

    //Add question from API data to web
    questionElement.forEach((question, index) => {
        //All the element inside a div question (an input, a label)
        var child = question.children; 
        //Question text
        child[1].textContent = listQuesion[index].text; 
        //Question ID
        var id = listQuesion[index]._id 
        question.id = id;
        //Init the object hold answer from user
        listSubmitAns[id] = -1; 
        listQuesion[index].answers.forEach(a => {
            var b = "";
            for (var i = 0; i < a.length; i++) {
                if (a[i] == '<') b += "&lt;";
                else if (a[i] == '>') b += "&gt;";
                else b += a[i];
            } // convert HTML code to plain text to display on Web

            //HTML save template of an answer
            var ansTemplate = `<div class="answer">
            <input type="radio" name="quiz${index}">
            <label>${b}</label>
            </div>`;
            //Add answer to question
            child[2].insertAdjacentHTML("beforeend", ansTemplate); 
        })
    });
    document.querySelector('.submit').style.display = 'flex';

    //Scroll the question part to the top of page
    document.querySelector('.start-btn').parentElement.style.display = 'none';
    questionElement[0].scrollIntoView();

    var clickable = true;
    //Handle all the answer button
    var listCheckbox = document.querySelectorAll('input[type="radio"]');
    listCheckbox.forEach(e => {
        e.parentElement.addEventListener('click', () => {
            if (clickable) {
                e.checked = true;
                listCheckbox.forEach(f => {
                    if (f.checked) f.parentElement.classList.add("selected");
                    else f.parentElement.classList.remove("selected")
                })
            }
        })
    });
})


//Handle the submit button
document.querySelector('.submit').addEventListener('click', async() => {
    //Read the ans from user
    if (confirm('Do you want to finish?')) {
        var correctAns, responseData;
        questionElement.forEach((question) => {
            var child = question.children;
            var listAns = child[2].children;
            Array.from(listAns).forEach((a, i) => {
                choices = a.children;
                if (choices[0].checked) listSubmitAns[question.id] = i;
            })
        })

        await axios.post(`https://wpr-quiz-api.herokuapp.com/attempts/${studentID}/submit`, {
                "answers": listSubmitAns
            })
            .then(function(response) {
                // console.log(response)
                correctAns = response.data.correctAnswers;
                responseData = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });

        //check the answer and show correct/incorrexct ans
        questionElement.forEach((question) => {
                var child = question.children;
                var __id = question.id;
                var listAns = child[2].children;
                var markupCorrect = `<div class="answer-type">Correct answer</div>`
                var markupYourAns = `<div class="answer-type">Your answer</div>`
                console.log
                if (listSubmitAns[__id] === correctAns[__id]) { //Correct Ans
                    console.log(correctAns)
                    listAns[correctAns[__id]].classList.add('correct'); //Green color
                    listAns[correctAns[__id]].insertAdjacentHTML('beforeend', markupCorrect);
                } else { //Wrong Ans
                    listAns[correctAns[__id]].classList.add('almost-correct'); //Grey
                    listAns[correctAns[__id]].insertAdjacentHTML('beforeend', markupCorrect);
                    if (listSubmitAns[__id] !== -1) {
                        listAns[listSubmitAns[__id]].classList.add('incorrect'); //Pinkuuuuuuuuuu
                        listAns[listSubmitAns[__id]].insertAdjacentHTML('beforeend', markupYourAns);
                    }
                }

                //Show the result
                document.querySelector('.submit').style.display = 'none';
                document.querySelector('.score').textContent = `${responseData.score}/10`;
                document.querySelector('.percent').textContent = responseData.score * 10 + "%";
                document.querySelector('.feedback').textContent = responseData.scoreText;
                document.querySelector('.result-box').style.display = 'block';
                document.querySelector('.result-box').scrollIntoView();

                //Answer no longer clickable
                clickable = false;
                Array.from(listAns).forEach(ans => {
                    ans.children[0].disabled = true;
                })

                document.querySelector('.try').addEventListener('click', () => { //Reset 
                    //Delete all question
                    document.querySelector('#attempt-quiz').style.display = 'none';
                    Array.from(document.querySelectorAll('.question-container')).forEach(a => {
                        elements = a.children;
                        childs = elements[2].children;
                        Array.from(childs).forEach(c => {
                            c.parentElement.removeChild(c);
                        })
                    })
                    document.querySelector('.start-btn').parentElement.style.display = 'flex';
                    document.querySelector('.result-box').style.display = 'none';
                    document.querySelector('header').scrollIntoView();
                })

            })
            //show try again box
    }

})