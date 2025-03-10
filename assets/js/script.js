'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
function setupNavigation() {
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      if (this.innerHTML.toLowerCase() === 'resume' && !isResumeUnlocked) {
        passwordModalFunc(); // Show password modal
        return;
      }

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
}

// Form input validation function
function setupFormValidation(form, formBtn) {
  const formInputs = form.querySelectorAll("[data-form-input]");

  formInputs.forEach(input => {
    input.addEventListener("input", function () {
      // Check form validity
      const allFieldsFilled = Array.from(formInputs).every(input => input.value.trim() !== '');

      if (allFieldsFilled) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  });
}

// Initial setup
document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();

  // Form submission handling
  const form = document.querySelector("[data-form]");
  const formBtn = document.querySelector("[data-form-btn]");

  if (form && formBtn) {
    // Setup form validation
    setupFormValidation(form, formBtn);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Explicitly get form values and trim whitespace
      const name = form.fullname.value.trim();
      const email = form.email.value.trim();
      const userComment = form.message.value.trim();

      // Validate form fields before submission
      if (!name || !email || !userComment) {
        console.error('Form validation failed');
        alert('Please fill out all required fields');
        return;
      }

      const formData = {
        name: name,
        email: email,
        userComment: userComment
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

        const result = await response.json();
        console.log('Response data:', result);

        if (result.data && result.data.createCommentSection) {
          console.log('Request successful');
          alert('Message sent successfully!');

          // Reset form
          form.reset();

          // Disable submit button
          formBtn.setAttribute("disabled", "");
        } else {
          console.error('GraphQL errors:', result.errors);
          const errorMessage = result.errors?.[0]?.message || 'Unknown GraphQL error';
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
  }

  // Password protection for resume
  const passwordModal = document.querySelector("[data-password-modal]");
  const passwordOverlay = document.querySelector("[data-password-overlay]");
  const passwordCloseBtn = document.querySelector("[data-password-close-btn]");
  const resumePassword = document.getElementById("resume-password");
  const submitPassword = document.getElementById("submit-password");
  const resumeSection = document.querySelector("[data-page='resume']");
  let isResumeUnlocked = false;

  // Hide resume section by default
  if (resumeSection) {
    resumeSection.classList.remove("active");
  }

  // Password modal toggle function
  const passwordModalFunc = function () {
    passwordModal.classList.add("active");
    passwordModal.style.display = "flex";
    if (resumePassword) {
      resumePassword.value = ''; // Clear any previous input
      resumePassword.focus();
    }
  }

  // Close password modal when clicking close button or overlay
  if (passwordCloseBtn) {
    passwordCloseBtn.addEventListener("click", function() {
      passwordModal.classList.remove("active");
      passwordModal.style.display = "none";
    });
  }
  
  if (passwordOverlay) {
    passwordOverlay.addEventListener("click", function() {
      passwordModal.classList.remove("active");
      passwordModal.style.display = "none";
    });
  }

  // Handle password submission
  if (submitPassword && resumePassword) {
    submitPassword.addEventListener("click", function() {
      const password = resumePassword.value;
      if (password === 'xulai') {
        isResumeUnlocked = true;
        passwordModal.classList.remove("active");
        passwordModal.style.display = "none";
        resumePassword.value = ''; // Clear the password field
        
        // Show the resume section
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].dataset.page === 'resume') {
            pages[i].classList.add("active");
            navigationLinks[i].classList.add("active");
            window.scrollTo(0, 0);
          } else {
            pages[i].classList.remove("active");
            navigationLinks[i].classList.remove("active");
          }
        }
      } else {
        alert('Incorrect password. Please try again.');
        resumePassword.value = ''; // Clear the password field
        resumePassword.focus();
      }
    });

    // Add enter key support
    resumePassword.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitPassword.click();
      }
    });
  }

  // Add event to all nav links
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      if (this.innerHTML.toLowerCase() === 'resume' && !isResumeUnlocked) {
        passwordModalFunc(); // Show password modal
        return;
      }

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
});

document.addEventListener('DOMContentLoaded', function () {
  // Get all filter buttons
  const filterButtons = document.querySelectorAll('[data-filter-btn]');
  const selectItems = document.querySelectorAll('[data-select-item]');
  const projectItems = document.querySelectorAll('.project-item');
  const selectValue = document.querySelector('.select-value');

  // Function to filter projects
  function filterProjects(category) {
    projectItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');

      if (category === 'all' || category === itemCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Add click event for filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Remove active class from all buttons and add to clicked one
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Get category from button's data attribute
      const category = this.getAttribute('data-filter-btn');
      filterProjects(category);
    });
  });

  // Add click event for select items in dropdown
  selectItems.forEach(item => {
    item.addEventListener('click', function () {
      const category = this.getAttribute('data-select-item');
      selectValue.textContent = this.textContent;
      filterProjects(category);

      // Also update the main filter buttons to show the active state
      filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter-btn') === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  });

  // Handle filter select dropdown toggle
  const filterSelect = document.querySelector('.filter-select');
  const selectList = document.querySelector('.select-list');

  filterSelect.addEventListener('click', function () {
    selectList.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.filter-select-box')) {
      selectList.classList.remove('show');
    }
  });
});