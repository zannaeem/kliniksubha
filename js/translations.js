const translations = {
    en: {
        // Navigation
        'nav-home': 'Home',
        'nav-about': 'About',
        'nav-service': 'Service',
        'nav-pages': 'Pages',
        'nav-contact': 'Contact',
        'nav-appointment': 'APPOINTMENT',

        // Hero Section
        'hero-welcome': 'WELCOME TO KLINIK SUBHA',
        'hero-title': 'Comprehensive Care. Affordable Excellence.',
        'hero-subtitle': 'Trusted Since 1990',
        'hero-description': 'Providing affordable, high-quality healthcare services, including general practice, pain management, physiotherapy, and diagnostic screenings. Trusted by families and corporate clients, Klinik Subha offers compassionate, patient-centered care in a modern and welcoming environment.',
        'hero-book-now': 'Book Now',
        'hero-services': 'Services',

        // About Section
        'about-title': 'ABOUT KLINIK SUBHA',
        'about-heading': 'Redefining Healthcare Excellence.',
        'about-read-more': 'READ MORE ABOUT US',

        // Services Section
        'services-title': 'Our Services',
        'services-heading': 'Comprehensive Healthcare Solutions',
        'services-description': 'Discover our wide range of medical services designed to meet all your healthcare needs',

        // Testimonial Section
        'testimonial-title': 'Testimonial',
        'testimonial-heading': 'What Our Patients Say',
        'write-review': 'Write a Google Review',

        // Team Section
        'team-title': 'Doctors',
        'team-heading': 'Our Experience Doctors',
        'department': 'Department',

        // Appointment Section
        'appointment-title': 'Appointment',
        'appointment-heading': 'Make An Appointment To Visit Our Doctor',
        'appointment-name': 'Your Name',
        'appointment-email': 'Your Email',
        'appointment-mobile': 'Your Mobile',
        'appointment-doctor': 'Choose Doctor',
        'appointment-date': 'Choose Date',
        'appointment-time': 'Choose Time',
        'appointment-problem': 'Describe your problem',
        'appointment-button': 'Book Appointment'
    },
    ms: {
        // Navigation
        'nav-home': 'Utama',
        'nav-about': 'Tentang Kami',
        'nav-service': 'Perkhidmatan',
        'nav-pages': 'Halaman',
        'nav-contact': 'Hubungi',
        'nav-appointment': 'TEMUJANJI',

        // Hero Section
        'hero-welcome': 'SELAMAT DATANG KE KLINIK SUBHA',
        'hero-title': 'Penjagaan Komprehensif. Kecemerlangan Berpatutan.',
        'hero-subtitle': 'Dipercayai Sejak 1990',
        'hero-description': 'Menyediakan perkhidmatan penjagaan kesihatan yang berpatutan dan berkualiti tinggi, termasuk amalan umum, pengurusan kesakitan, fisioterapi, dan pemeriksaan diagnostik. Dipercayai oleh keluarga dan pelanggan korporat, Klinik Subha menawarkan penjagaan berpusatkan pesakit yang penuh kasih sayang dalam persekitaran moden dan mesra.',
        'hero-book-now': 'Tempah Sekarang',
        'hero-services': 'Perkhidmatan',

        // About Section
        'about-title': 'TENTANG KLINIK SUBHA',
        'about-heading': 'Mendefinisi Semula Kecemerlangan Penjagaan Kesihatan.',
        'about-read-more': 'BACA LEBIH LANJUT TENTANG KAMI',

        // Services Section
        'services-title': 'Perkhidmatan Kami',
        'services-heading': 'Penyelesaian Penjagaan Kesihatan Komprehensif',
        'services-description': 'Terokai pelbagai perkhidmatan perubatan kami yang direka untuk memenuhi semua keperluan penjagaan kesihatan anda',

        // Testimonial Section
        'testimonial-title': 'Testimoni',
        'testimonial-heading': 'Apa Kata Pesakit Kami',
        'write-review': 'Tulis Ulasan Google',

        // Team Section
        'team-title': 'Doktor',
        'team-heading': 'Doktor Berpengalaman Kami',
        'department': 'Jabatan',

        // Appointment Section
        'appointment-title': 'Temujanji',
        'appointment-heading': 'Buat Temujanji Untuk Berjumpa Doktor Kami',
        'appointment-name': 'Nama Anda',
        'appointment-email': 'Emel Anda',
        'appointment-mobile': 'Nombor Telefon',
        'appointment-doctor': 'Pilih Doktor',
        'appointment-date': 'Pilih Tarikh',
        'appointment-time': 'Pilih Masa',
        'appointment-problem': 'Terangkan masalah anda',
        'appointment-button': 'Tempah Temujanji'
    }
};

// Function to set the language
function setLanguage(language) {
    localStorage.setItem('preferredLanguage', language);
    updateContent(language);
    updateToggleButton(language);
}

// Function to update content
function updateContent(language) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[language][key];
            } else {
                element.textContent = translations[language][key];
            }
        }
    });
}

// Function to update toggle button
function updateToggleButton(language) {
    const toggleBtn = document.getElementById('languageToggle');
    if (toggleBtn) {
        toggleBtn.textContent = language.toUpperCase();
    }
}

// Initialize language settings
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);
}); 