const API_BASE =
  window.__API_BASE__ ||
  (window.location.origin.includes("localhost:") ||
  window.location.origin.includes("127.0.0.1:")
    ? "http://localhost:5000"
    : window.location.origin.includes("pangia.world")
      ? "https://api.pangia.world"
      : window.location.origin);

document.addEventListener('DOMContentLoaded', () => {
  const quoteForm = document.querySelector('.quote-form');
  if (!quoteForm) return;

  const statusEl = quoteForm.querySelector('.quote-form-status');

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('error', 'success', 'info');
    if (type === 'error') {
      statusEl.classList.add('error');
    } else if (type === 'success') {
      statusEl.classList.add('success');
    } else {
      statusEl.classList.add('info');
    }
  };

  const setTier = (tierName) => {
    const notesField = quoteForm.querySelector('[name="notes"]');
    if (!notesField) return;
    if (!notesField.value.includes(`Preferred Plan:`)) {
      notesField.value = `${notesField.value ? notesField.value + '\n' : ''}Preferred Plan: ${tierName}`;
    } else {
      notesField.value = notesField.value.replace(/Preferred Plan:.*(\n|$)/, `Preferred Plan: ${tierName}\n`);
    }
  };

  document.querySelectorAll('[data-tier-select]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const tier = button.getAttribute('data-tier-select');
      setTier(tier);
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
      setStatus(`Pre-filling quote for ${tier}. Complete the form to submit.`, 'info');
    });
  });

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(quoteForm);
    const fullName = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const postalCode = formData.get('zip')?.trim();

    if (!fullName || !email || !phone || !postalCode) {
      setStatus('Please complete all required fields.', 'error');
      return;
    }

    const payload = {
      fullName,
      email,
      phone,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode,
      },
      postalCode,
      serviceArea: postalCode,
      waterSource: formData.get('water-source'),
      propertyType: formData.get('home-size'),
      concerns: formData.get('notes')?.trim() || '',
      notes: formData.get('notes')?.trim() || '',
      originType: 'quote',
      utm_source: localStorage.getItem('utm_source'),
      utm_medium: localStorage.getItem('utm_medium'),
      utm_campaign: localStorage.getItem('utm_campaign'),
    };

    setStatus('Sending your quote request...');

    try {
    const response = await fetch(`${API_BASE}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit quote request. Please try again.');
      }

      quoteForm.reset();
      setStatus('Thanks! Our Asheville team will email your quote shortly.', 'success');
    } catch (error) {
      console.error('Quote request failed', error);
      setStatus(error.message || 'Something went wrong. Please try again later.', 'error');
    }
  });
});
