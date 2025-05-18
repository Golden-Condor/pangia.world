document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const roleSelect = document.getElementById('role');
    const farmerFields = document.getElementById('farmer-fields');

    // Show/hide farmer-specific fields based on role selection
    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'farmer') {
            farmerFields.style.display = 'block';
        } else {
            farmerFields.style.display = 'none';
        }
    });

    // Handle form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const jsonData = {};

        // Convert form data to JSON
        formData.forEach((value, key) => jsonData[key] = value);

        // Remove empty farmer fields if the user is not a farmer
        if (jsonData.role !== 'farmer') {
            delete jsonData.farmName;
            delete jsonData.location;
            delete jsonData.certifications;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = '/pages/signin.html';
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred while signing up. Please try again.');
        }
    });
});