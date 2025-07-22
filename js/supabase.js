// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase configuration
const SUPABASE_URL = 'https://fsubfiwlvogrrjouvoel.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWJmaXdsdm9ncnJqb3V2b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTI2NjcsImV4cCI6MjA2MTY2ODY2N30.292RlmCKCF6ow3bsvq5GrFIWKwKaB00mZAznN-WeugI';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection and create table if needed
async function initDatabase() {
    try {
        console.log('Testing Supabase connection...');
        
        // Check if appointments table exists by trying to select from it
        const { data, error } = await supabase
            .from('appointments')
            .select('count')
            .limit(1);
        
        if (error && error.message.includes('does not exist')) {
            console.log('Appointments table does not exist, creating it...');
            // We'll handle table creation in Supabase dashboard
            console.error('Please create the appointments table in Supabase dashboard');
        } else if (error) {
            console.error('Supabase connection error:', error);
        } else {
            console.log('Supabase connection successful!');
        }
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
    }
}

// Initialize on load
initDatabase();

// Database schema
const schema = {
  appointments: {
    table: 'appointments',
    columns: {
      id: 'uuid primary key default uuid_generate_v4()',
      created_at: 'timestamp with time zone default timezone(\'utc\'::text, now())',
      service_type: 'text not null',
      preferred_date: 'date',
      preferred_time: 'time',
      patient_name: 'text not null',
      patient_phone: 'text not null',
      patient_ic_email: 'text not null',
      additional_notes: 'text',
      status: 'text default \'pending\'',
      confirmed_at: 'timestamp with time zone',
      updated_at: 'timestamp with time zone'
    }
  },
  services: {
    table: 'services',
    columns: {
      id: 'uuid primary key default uuid_generate_v4()',
      created_at: 'timestamp with time zone default timezone(\'utc\'::text, now())',
      title: 'text not null',
      description: 'text',
      image_url: 'text',
      category: 'text',
      is_active: 'boolean default true'
    }
  },
  doctors: {
    table: 'doctors',
    columns: {
      id: 'uuid primary key default uuid_generate_v4()',
      created_at: 'timestamp with time zone default timezone(\'utc\'::text, now())',
      name: 'text not null',
      specialization: 'text',
      image_url: 'text',
      bio: 'text',
      is_active: 'boolean default true'
    }
  }
};

// Functions to interact with the database
const database = {
  // Appointment functions
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      // Validate required fields
      const requiredFields = ['service_type', 'patient_name', 'patient_phone', 'patient_ic_email'];
      for (const field of requiredFields) {
        if (!appointmentData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Insert appointment with upsert option
      const { data, error } = await supabase
        .from('appointments')
        .upsert([{
          service_type: appointmentData.service_type,
          preferred_date: appointmentData.preferred_date,
          preferred_time: appointmentData.preferred_time,
          patient_name: appointmentData.patient_name,
          patient_phone: appointmentData.patient_phone,
          patient_ic_email: appointmentData.patient_ic_email,
          additional_notes: appointmentData.additional_notes,
          status: 'pending',
          created_at: new Date().toISOString()
        }], {
          onConflict: 'patient_ic_email,preferred_date,preferred_time',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  },

  async getAppointments() {
    try {
      console.log('Fetching all appointments...');
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} appointments`);
      return data || [];
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  },

  // Service functions
  async getServices() {
    const { data, error } = await supabase
      .from(schema.services.table)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Doctor functions
  async getDoctors() {
    const { data, error } = await supabase
      .from(schema.doctors.table)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Export Supabase instance for direct access
  supabase
};

// Export the database object
export default database; 