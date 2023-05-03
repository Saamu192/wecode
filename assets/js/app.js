import "../css/app.css"
import "flatpickr/dist/flatpickr.min.css"
import "./polyfills/closest"
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import "phoenix_html"
import 'alpinejs'

const triggers = document.querySelectorAll('[data-dropdown-trigger]')

for (const trigger of triggers) {
  trigger.addEventListener('click', function(e) {
    e.stopPropagation()
    e.currentTarget.nextElementSibling.classList.remove('hidden')
  })
}

if (triggers.length > 0) {
  document.addEventListener('click', function(e) {
    const dropdown = e.target.closest('[data-dropdown]')

    if (dropdown && e.target.tagName === 'A') {
      dropdown.classList.add('hidden')
    }
  })

  document.addEventListener('click', function(e) {
    const clickedInDropdown = e.target.closest('[data-dropdown]')

    if (!clickedInDropdown) {
      for (const dropdown of document.querySelectorAll('[data-dropdown]')) {
        dropdown.classList.add('hidden')
      }
    }
  })
}

const registerForm = document.getElementById('register-form')

if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    setTimeout(submitForm, 1000);
    var formSubmitted = false;

    function submitForm() {
      if (!formSubmitted) {
        formSubmitted = true;
        registerForm.submit();
      }
    }
    /* eslint-disable-next-line no-undef */
    plausible('Signup', {callback: submitForm});
  })
}

const embedButton = document.getElementById('generate-embed')

if (embedButton) {
  embedButton.addEventListener('click', function(_e) {
    const baseUrl = document.getElementById('base-url').value
    const embedCode = document.getElementById('embed-code')
    const theme = document.getElementById('theme').value.toLowerCase()
    const background = document.getElementById('background').value

    try {
      const embedLink = new URL(document.getElementById('embed-link').value)
      embedLink.searchParams.set('embed', 'true')
      embedLink.searchParams.set('theme', theme)
      if (background) {
        embedLink.searchParams.set('background', background)
      }

      embedCode.value = `<iframe plausible-embed src="${embedLink.toString()}" scrolling="no" frameborder="0" loading="lazy" style="width: 1px; min-width: 100%; height: 1600px;"></iframe>
<div style="font-size: 14px; padding-bottom: 14px;">Stats powered by <a target="_blank" style="color: #4F46E5; text-decoration: underline;" href="https://plausible.io">Plausible Analytics</a></div>
<script async src="${baseUrl}/js/embed.host.js"></script>`
    } catch (e) {
      console.error(e)
      embedCode.value = 'ERROR: Please enter a valid URL in the shared link field'
    }
  })
}
