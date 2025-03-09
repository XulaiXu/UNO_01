'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// Handle form submission
form.addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const formData = {
    name: form.fullname.value,  // Change "fullname" to "name"
    email: form.email.value,
    userComment: form.message.value  // Change "message" to "userComment"
  };


  console.log('=== Form Submission Started ===');
  console.log('Form data:', formData);

  const GRAPHQL_ENDPOINT = 'https://wavafmnmhbdafdy5btcksaub34.appsync-api.us-west-1.amazonaws.com/graphql';
  const API_KEY = 'da2-ok6fd2sxtbfcxdd7tcea2podzi';

  // Simplified GraphQL mutation
  const mutation = `
    mutation CreateComment($name: String!, $email: String!, $userComment: String!) {
      createCommentSection(input: {name: $name, email: $email, userComment: $userComment, status: PENDING}) {
        id
        name
        email
        userComment
        status
      }
    }
  `;


  try {
    console.log('Making GraphQL request...');
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: mutation,
        variables: formData
      })
    });

    console.log('Response received');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (!result.errors) {
      console.log('Request successful');
      alert('Message sent successfully!');
      form.reset();
      formBtn.setAttribute("disabled", "");
    } else {
      console.error('GraphQL errors:', result.errors);
      const errorMessage = result.errors[0]?.message || 'Unknown GraphQL error';
      console.error('Detailed error:', errorMessage);
      alert('Error sending message: ' + errorMessage);
    }
  } catch (error) {
    console.error('=== Error Details ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    alert('Network error while sending message. Please check your internet connection and try again.');
  }
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}


document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed.");

  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");

  console.log("Form found:", form);
  console.log("Form inputs found:", formInputs);

  if (!form) {
    console.error("ERROR: Form with [data-form] not found. Check HTML.");
  }
  if (formInputs.length === 0) {
    console.error("ERROR: No inputs with [data-form-input] found. Check HTML.");
  }
});
