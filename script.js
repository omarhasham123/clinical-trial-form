document.addEventListener('DOMContentLoaded', () => {
    const screeningForm = document.getElementById('screening-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const btnNext = document.getElementById('btn-next');
    
    // Step 1 fields
    const contactInfoInput = document.getElementById('contact-info');
    const patientAgeInput = document.getElementById('patient-age');
    const cancerDiagnosisSelect = document.getElementById('cancer-diagnosis');

    // Step 1 error message elements
    const contactError = document.getElementById('contact-error');
    const ageError = document.getElementById('age-error');

    // Step 2 fields
    const recentChemoSelect = document.getElementById('recent-chemo');
    const canTravelSelect = document.getElementById('can-travel');

    let step1Data = {};

    // --- HELPER FUNCTIONS FOR ERROR HANDLING ---
    const showError = (inputElement, messageElement, message) => {
        inputElement.classList.add('input-error');
        messageElement.textContent = message;
    };

    const clearError = (inputElement, messageElement) => {
        inputElement.classList.remove('input-error');
        messageElement.textContent = '';
    };

    // --- VALIDATION LOGIC ---
    const validateStep1 = () => {
        let isValid = true;
        // Clear previous errors first
        clearError(contactInfoInput, contactError);
        clearError(patientAgeInput, ageError);

        // 1. Validate Contact Info (Email or Phone)
        const contactValue = contactInfoInput.value.trim();
        const emailRegex = /^\S+@\S+\.\S+$/;
        // Basic phone regex: checks for 10 or 11 digits after stripping non-digits
        const phoneDigits = contactValue.replace(/\D/g, '');
        const isPhone = phoneDigits.length === 10 || phoneDigits.length === 11;

        if (contactValue === '') {
            showError(contactInfoInput, contactError, 'Contact information is required.');
            isValid = false;
        } else if (!emailRegex.test(contactValue) && !isPhone) {
            showError(contactInfoInput, contactError, 'Please enter a valid email or a 10-digit phone number.');
            isValid = false;
        }

        // 2. Validate Age
        const ageValue = patientAgeInput.value;
        const age = Number(ageValue);
        if (ageValue === '') {
            showError(patientAgeInput, ageError, 'Age is required.');
            isValid = false;
        } else if (!Number.isInteger(age) || age < 1 || age > 120) {
            showError(patientAgeInput, ageError, 'Please enter a valid age (e.g., a whole number between 1 and 120).');
            isValid = false;
        }

        // 3. Validate Diagnosis Selection
        if (cancerDiagnosisSelect.value === '') {
            // This is a select, so we can just use the default alert or add another error P tag if desired.
            alert('Please select a primary cancer diagnosis.');
            isValid = false;
        }
        
        return isValid;
    };


    btnNext.addEventListener('click', () => {
        if (!validateStep1()) {
            return; // Stop if validation fails
        }

        const patientAge = parseInt(patientAgeInput.value, 10);
        const cancerDiagnosis = cancerDiagnosisSelect.value;

        // --- Disqualification Logic for Step 1 ---
        if (patientAge < 18 || cancerDiagnosis !== 'nsclc') {
            console.log('Disqualified at Step 1.');
            window.location.href = 'sorry.html';
            return;
        }

        // --- Store Step 1 data and move to Step 2 ---
        step1Data = {
            contact: contactInfoInput.value.trim(),
            age: patientAge,
            diagnosis: cancerDiagnosis
        };
        
        // --- Segment Tracking for Step 1 Completion ---
        analytics.identify(step1Data.contact, {
            age: step1Data.age,
            initialDiagnosis: step1Data.diagnosis
        });
        analytics.track('Trial Screening Step 1 Completed', step1Data);
        
        console.log('Step 1 Completed. Data:', step1Data);

        // Hide Step 1, Show Step 2
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    });

    screeningForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const recentChemo = recentChemoSelect.value;
        const canTravel = canTravelSelect.value;

        // --- Disqualification Logic for Step 2 ---
        if (recentChemo === 'yes' || canTravel === 'no') {
            console.log('Disqualified at Step 2.');
            window.location.href = 'sorry.html';
            return;
        }
        
        const step2Data = {
            diagnosisStage: document.getElementById('diagnosis-stage').value,
            recentChemo: recentChemo,
            canTravel: canTravel
        };

        const finalApplicationData = { ...step1Data, ...step2Data };

        analytics.track('Trial Application Submitted', finalApplicationData);
        
        console.log('Form Submitted. Final Data:', finalApplicationData);
        
        window.location.href = 'thank-you.html';
    });
});
