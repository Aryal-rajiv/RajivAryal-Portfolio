      const form = document.getElementById('contact-form');
      form.addEventListener('submit', (e) =>{
        e.preventDefault;
        const captchaResponse = grecaptcha.getResponse();
        if(captchaResponse.length >0) {
            throw new Error('Please complete the reCAPTCHA');
        }
        
        const fd = new FormData(e.taget);
        const params = new URLSearchParams(fd);

        fetch('/submit-form', {
          method: "POST",
          body: params,

      })

      .then(response => res.json())
      .then(data => console.log(data))
      .catch(error => console.error(err))


      });