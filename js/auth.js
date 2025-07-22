import { supabase } from './supabase.js'

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user)
        updateUIForAuthenticatedUser(session.user)
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        updateUIForUnauthenticatedUser()
    }
})

// Hide spinner after auth check
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    console.log('hideSpinner called, spinner:', spinner);
    if (spinner) spinner.style.display = 'none';
}

// Sign up function
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing up:', error.message);
        return { data: null, error };
    }
}

// Sign in function
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing in:', error.message);
        return { data: null, error };
    }
}

// Sign out function
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error signing out:', error.message)
        return { error }
    }
}

// Update UI based on auth state
function updateUIForAuthenticatedUser(user) {
    const authLinks = document.querySelectorAll('.auth-link')
    authLinks.forEach(link => {
        if (link.classList.contains('login-link')) {
            link.style.display = 'none'
        } else if (link.classList.contains('profile-link')) {
            link.style.display = 'block'
        }
    })
}

function updateUIForUnauthenticatedUser() {
    const authLinks = document.querySelectorAll('.auth-link')
    authLinks.forEach(link => {
        if (link.classList.contains('login-link')) {
            link.style.display = 'block'
        } else if (link.classList.contains('profile-link')) {
            link.style.display = 'none'
        }
    })
}

// Export functions
export { signUp, signIn, signOut }

// Sign In with Google
async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/login.html'
            }
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

// Check if user is admin
async function isAdmin(userId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        // Check both email and role in profiles table
        if (user.email === 'admin@kliniksubha.com') {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
                
            if (error) {
                console.error('Error fetching profile:', error);
                return false;
            }
            
            return profile?.role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Get current session
async function getCurrentSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        return { session: null, error };
    }
}

// Initialize auth
async function initAuth() {
    // No need to call createProfilesTable() as it's been removed
}

// Run initialization
document.addEventListener('DOMContentLoaded', () => {
    hideSpinner();
});

// Check if user is already logged in and redirect if so
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error checking auth status:', error.message);
        hideSpinner();
        return false;
    }
    if (session) {
        window.location.href = 'admin/dashboard.html';
        return true;
    }
    hideSpinner();
    return false;
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { data, error } = await signIn(email, password);
        if (error) {
            alert('Login failed: ' + error.message);
        } else {
            window.location.href = 'admin/dashboard.html';
        }
    });
}

// Handle signup form submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const { data, error } = await signUp(email, password, fullName);
        if (error) {
            alert('Signup failed: ' + error.message);
        } else {
            alert('Signup successful! Please check your email for verification.');
            document.getElementById('authTabs').querySelector('#login-tab').click();
        }
    });
}

// Handle logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.replace('/login.html'); // Force absolute redirect to root login.html
    } catch (error) {
        console.error('Error logging out:', error.message);
        window.location.replace('/login.html'); // Redirect even if error
    }
}

// Export functions for use in other files
window.auth = {
    checkAuth,
    logout,
    supabase
};

// SIGNUP
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullname').value;
        const errorDiv = document.getElementById('signupError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Password validation is already handled in the HTML page
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        
        if (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        } else {
            alert('Sign up successful! Please check your email to confirm your account.');
            window.location.href = 'login.html';
        }
    });
    
    // Google signup
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function() {
            await supabase.auth.signInWithOAuth({ provider: 'google' });
        });
    }
}

setTimeout(hideSpinner, 5000); 