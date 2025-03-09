'use strict';

// Handle form submission
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
      form.reset();
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