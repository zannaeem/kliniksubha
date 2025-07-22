import { supabase } from './supabase.js'

// Create appointment
async function createAppointment(appointmentData) {
    try {
        console.log('Creating appointment with data:', appointmentData);
        
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                ...appointmentData,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()

        console.log('Supabase response:', { data, error });
        
        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { data: null, error }
    }
}

// Get user's appointments
async function getUserAppointments(userId) {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching appointments:', error.message)
        return { data: null, error }
    }
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating appointment:', error.message)
        return { data: null, error }
    }
}

// Simple alert as fallback
function showAlert(message, type = 'success') {
    // Use simple alert for now
    alert(message);
    
    // Also try to create Bootstrap alert if available
    try {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    } catch (alertError) {
        console.log('Bootstrap alert failed, using simple alert');
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for appointment form...');
    
    const appointmentForm = document.getElementById('appointmentForm');
    
    if (appointmentForm) {
        console.log('Appointment form found!');
        
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get form data
            const formData = new FormData(e.target);
            const appointmentData = {
                service_type: formData.get('serviceType'),
                preferred_date: formData.get('preferredDate') || null,
                preferred_time: formData.get('preferredTime') || null,
                patient_name: formData.get('patientName'),
                patient_phone: formData.get('patientPhone'),
                patient_ic_email: formData.get('patientIC'),
                additional_notes: formData.get('additionalNotes') || '',
            };
            
            console.log('Form data collected:', appointmentData);
            
            // Validate required fields
            if (!appointmentData.service_type || !appointmentData.patient_name || 
                !appointmentData.patient_phone || !appointmentData.patient_ic_email) {
                showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            
            try {
                console.log('Calling createAppointment...');
                const { data, error } = await createAppointment(appointmentData);
                
                if (error) {
                    console.error('Appointment creation error:', error);
                    showAlert('Error submitting appointment: ' + error.message, 'error');
                } else {
                    console.log('Appointment created successfully:', data);
                    showAlert('Appointment request submitted successfully! We will contact you within 24 hours to confirm your appointment.');
                    e.target.reset();
                }
            } catch (error) {
                console.error('Caught error:', error);
                showAlert('Error submitting appointment. Please try again.', 'error');
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    } else {
        console.error('Appointment form not found! Make sure the form has id="appointmentForm"');
    }
});

export { createAppointment, getUserAppointments, updateAppointmentStatus } 