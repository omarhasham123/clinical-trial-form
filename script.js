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

    // --- INDIVIDUAL VALIDATION FUNCTIONS (FOR REAL-TIME FEEDBACK) ---
    const validateContactField = () => {
        const contactValue = contactInfoInput.value.trim();
        const emailRegex = /^\S+@\S+\.\S+$/;
        const phoneDigits = contactValue.replace(/\D/g, '');
        const isPhone = phoneDigits.length === 10 || phoneDigits.length === 11;

        if (contactValue === '') {
            showError(contactInfoInput, contactError, 'Contact information is required.');
            return false;
        } else if (!emailRegex.test(contactValue) && !isPhone) {
            showError(contactInfoInput, contactError, 'Please enter a valid email or a 10-digit phone number.');
            return false;
        } else {
            clearError(contactInfoInput, contactError);
            return true;
        }
    };

    const validateAgeField = () => {
        const ageValue = patientAgeInput.value;
        const age = Number(ageValue);

        if (ageValue === '') {
            showError(patientAgeInput, ageError, 'Age is required.');
            return false;
        } else if (!Number.isInteger(age) || age < 1 || age > 120) {
            showError(patientAgeInput, ageError, 'Please enter a valid age (e.g., a whole number between 1 and 120).');
            return false;
        } else {
            clearError(patientAgeInput, ageError);
            return true;
        }
    };

    // --- OVERALL VALIDATION FOR THE 'NEXT' BUTTON ---
    const validateStep1 = () => {
        const isContactValid = validateContactField();
        const isAgeValid = validateAgeField();
        let isDiagnosisValid = true;

        if (cancerDiagnosisSelect.value === '') {
            alert('Please select a primary cancer diagnosis.');
            isDiagnosisValid = false;
        }
        
        return isContactValid && isAgeValid && isDiagnosisValid;
    };

    // --- EVENT LISTENERS ---
    // Add 'input' listeners for real-time validation
    contactInfoInput.addEventListener('input', validateContactField);
    patientAgeInput.addEventListener('input', validateAgeField);

    btnNext.addEventListener('click', () => {
        if (!validateStep1()) {
            return; // Stop if validation fails
        }

        const patientAge = parseInt(patientAgeInput.value, 10);
        const cancerDiagnosis = cancerDiagnosisSelect.value;

        // Disqualification Logic
        if (patientAge < 18 || cancerDiagnosis !== 'nsclc') {
            window.location.href = 'sorry.html';
            return;
        }

        // Store data and move to Step 2
        step1Data = {
            contact: contactInfoInput.value.trim(),
            age: patientAge,
            diagnosis: cancerDiagnosis
        };
        
        // Segment Tracking
        analytics.identify(step1Data.contact, {
            age: step1Data.age,
            initialDiagnosis: step1Data.diagnosis
        });
        analytics.track('Trial Screening Step 1 Completed', step1Data);
        
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    });

    screeningForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const recentChemo = recentChemoSelect.value;
        const canTravel = canTravelSelect.value;

        // Disqualification Logic
        if (recentChemo === 'yes' || canTravel === 'no') {
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
        
        window.location.href = 'thank-you.html';
    });
});
