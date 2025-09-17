document.addEventListener('DOMContentLoaded', () => {
    const screeningForm = document.getElementById('screening-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const btnNext = document.getElementById('btn-next');
    
    // Step 1 fields
    const contactInfoInput = document.getElementById('contact-info');
    const patientAgeInput = document.getElementById('patient-age');
    const cancerDiagnosisSelect = document.getElementById('cancer-diagnosis');

    // Step 2 fields
    const recentChemoSelect = document.getElementById('recent-chemo');
    const canTravelSelect = document.getElementById('can-travel');

    let step1Data = {};

    btnNext.addEventListener('click', () => {
        // --- Step 1 Validation ---
        if (!contactInfoInput.value || !patientAgeInput.value || !cancerDiagnosisSelect.value) {
            alert('Please fill out all fields in Step 1.');
            return;
        }

        const patientAge = parseInt(patientAgeInput.value, 10);
        const cancerDiagnosis = cancerDiagnosisSelect.value;

        // --- Disqualification Logic for Step 1 ---
        // Rule 1: Must be 18 or older.
        // Rule 2: Diagnosis must be Non-Small Cell Lung Cancer (nsclc).
        if (patientAge < 18 || cancerDiagnosis !== 'nsclc') {
            console.log('Disqualified at Step 1.');
            window.location.href = 'sorry.html';
            return;
        }

        // --- Store Step 1 data and move to Step 2 ---
        step1Data = {
            contact: contactInfoInput.value,
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
        // Rule 1: Must not have had chemo in the last 30 days.
        // Rule 2: Must be able to travel.
        if (recentChemo === 'yes' || canTravel === 'no') {
            console.log('Disqualified at Step 2.');
            window.location.href = 'sorry.html';
            return;
        }
        
        // --- Gather Step 2 Data ---
        const step2Data = {
            diagnosisStage: document.getElementById('diagnosis-stage').value,
            recentChemo: recentChemo,
            canTravel: canTravel
        };

        const finalApplicationData = { ...step1Data, ...step2Data };

        // --- Segment Tracking for Final Submission ---
        analytics.track('Trial Application Submitted', finalApplicationData);
        
        console.log('Form Submitted. Final Data:', finalApplicationData);
        
        // Redirect to thank you page on success
        window.location.href = 'thank-you.html';
    });
});
