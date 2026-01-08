document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('application-form');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    const progressFill = document.querySelector('.progress-fill');
    const redirectUrl = form.dataset.redirect;

    let currentStep = 0;

    function updateForm() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update progress bar
        const progress = ((currentStep + 1) / steps.length) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep()) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    updateForm();
                } else {
                    submitForm();
                }
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateForm();
            }
        });
    });

    function validateStep() {
        const activeStep = steps[currentStep];
        const inputs = activeStep.querySelectorAll('input[required], textarea[required]');
        const radioGroups = activeStep.querySelectorAll('.choices-grid');

        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        radioGroups.forEach(group => {
            const checked = group.querySelector('input:checked');
            if (!checked) {
                isValid = false;
                group.style.border = '1px solid #ef4444';
                group.style.borderRadius = '12px';
                group.style.padding = '5px';
            } else {
                group.style.border = 'none';
                group.style.padding = '0';
            }
        });

        return isValid;
    }

    function submitForm() {
        const submitBtn = document.querySelector('.form-step.active .next-step');
        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        // Collect all form data
        const formData = new FormData(form);

        // Add Web3Forms access key
        formData.append('access_key', '291fef98-1459-40a5-90fb-c7471125c1e5');

        // Add form name for email subject
        const formTitle = document.querySelector('.form-title');
        formData.append('subject', `New Application: ${formTitle ? formTitle.textContent : 'Form Submission'}`);

        // Add sender info to help avoid spam
        formData.append('from_name', 'BuzzSavvy Website');

        // Get applicant's name for reply-to (if available)
        const nameInput = form.querySelector('input[name="name"]');
        if (nameInput && nameInput.value) {
            formData.append('replyto', nameInput.value);
        }

        // Send to Web3Forms
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Form submitted successfully');
                    // Open Calendly in new tab and redirect
                    window.open(redirectUrl, '_blank');
                    // Show success message or redirect to thank you page
                    if (submitBtn) {
                        submitBtn.textContent = 'Submitted! ✓';
                    }
                } else {
                    console.error('Form submission failed:', data);
                    if (submitBtn) {
                        submitBtn.textContent = 'Error - Try Again';
                        submitBtn.disabled = false;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (submitBtn) {
                    submitBtn.textContent = 'Error - Try Again';
                    submitBtn.disabled = false;
                }
            });
    }

    // Initialize
    updateForm();
});
