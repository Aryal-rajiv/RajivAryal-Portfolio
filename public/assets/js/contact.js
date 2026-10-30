//Handle form submission with recaptcha (same behaviour as the original site)
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the default form submission

  const loading = document.querySelector('.loading');
  const errorMessage = document.querySelector('.error-message');
  const sentMessage = document.querySelector('.sent-message');
  const button = e.target.querySelector('button[type="submit"]');

  //Get recaptcha response
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Please complete the reCAPTCHA';
    return;
  }

  const formData = new FormData(e.target); // Get form data
  const data = Object.fromEntries(formData.entries()); // Convert to JSON
  //Add recaptcha response to form data
  data['g-recaptcha-response'] = recaptchaResponse;

  // Show loading message
  loading.style.display = 'block';
  errorMessage.style.display = 'none';
  sentMessage.style.display = 'none';
  button.disabled = true;

  try {
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Send JSON data
    });
    const result = await response.json(); //Parse the JSON response

    if (result.success) {
      // Show success message
      loading.style.display = 'none';
      sentMessage.style.display = 'block';
      sentMessage.textContent = result.message;
      e.target.reset(); // Reset the form
      grecaptcha.reset();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    // Show error message
    loading.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent = error.message;
    console.error('Error:', error);
    grecaptcha.reset(); // Reset reCAPTCHA
  } finally {
    button.disabled = false;
  }
});
