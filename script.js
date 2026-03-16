// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBGjaxrO0-EtiFZ-NltD6ZWYvl4b6a3gG4",
    authDomain: "mrselim-88923.firebaseapp.com",
    databaseURL: "https://mrselim-88923-default-rtdb.firebaseio.com",
    projectId: "mrselim-88923",
    storageBucket: "mrselim-88923.firebasestorage.app",
    messagingSenderId: "344676725750",
    appId: "1:344676725750:web:5bb4229589203ca9b40dd7",
    measurementId: "G-Z8L6E657J0"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// =============================================
// هيكل قاعدة البيانات العلائقية (Relational Database Structure)
// =============================================
const DB = {
    // الجداول الرئيسية
    users: 'users',              // المستخدمين
    admins: 'admins',            // المشرفين
    profiles: 'user_profiles',    // ملفات المستخدمين (بيانات إضافية)
    sessions: 'user_sessions',    // جلسات المستخدمين
    results: 'user_results',      // نتائج المستخدمين (ربط مع الاختبارات)
    favorites: 'user_favorites',  // الأسئلة المفضلة
    notes: 'user_notes',         // ملاحظات المستخدم
    activities: 'user_activities', // سجل النشاطات
    
    // الجداول التعليمية
    grades: 'grades',            // الصفوف الدراسية
    sections: 'sections',         // الأقسام
    subjects: 'subjects',         // المواد
    lessons: 'lessons',           // الدروس
    sublessons: 'sublessons',     // الأقسام الفرعية
    questions: 'questions',       // الأسئلة
    quizResults: 'quiz_results',  // نتائج الاختبارات
    ads: 'ads'                    // الإعلانات
};

// =============================================
// متغيرات التطبيق
// =============================================
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let userAnswers = [];
let clickCount = 0;
let categories = new Set();
let quizStartTime;
let timerInterval;
let selectedGrade = '';
let selectedSection = '';
let selectedSubject = '';
let selectedLesson = '';
let selectedSublesson = '';
let grades = [];
let sections = [];
let subjects = [];
let lessons = [];
let sublessons = [];
let examActive = true;
let defaultExamTime = 10;
let currentUser = null;
let currentUserProfile = null;
let savedState = JSON.parse(localStorage.getItem('quizState')) || {};
let currentEditingQuestionId = null;
let currentAd = JSON.parse(localStorage.getItem('currentAd')) || null;
let autoBackupEnabled = localStorage.getItem('autoBackupEnabled') !== 'false';
let users = [];
let admins = [];

// إحصائيات الموقع
let siteStats = JSON.parse(localStorage.getItem('siteStats')) || {
    totalVisits: 0,
    uniqueUsers: [],
    dailyActiveUsers: [],
    userSessions: [],
    userActivities: [],
    quizResults: []
};

// متغير Dark Mode
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// المشرف الافتراضي
const defaultAdmin = {
    id: 'default_admin',
    name: 'مدير النظام',
    email: 'admin@system.com',
    password: 'admin123',
    role: 'super_admin',
    createdAt: new Date().toISOString()
};

// =============================================
// عناصر DOM
// =============================================
const elements = {
    quizContainer: document.getElementById('quiz-container'),
    questionContainer: document.getElementById('question-container'),
    resultsContainer: document.getElementById('results-container'),
    progressBar: document.getElementById('progress-bar'),
    nextBtn: document.getElementById('next-btn'),
    prevBtn: document.getElementById('prev-btn'),
    submitBtn: document.getElementById('submit-btn'),
    restartBtn: document.getElementById('restart-btn'),
    quizTitle: document.getElementById('quiz-title'),
    scoreDisplay: document.getElementById('score-value'),
    percentageDisplay: document.getElementById('percentage'),
    timeTakenDisplay: document.getElementById('time-taken'),
    feedbackDisplay: document.getElementById('feedback'),
    logoContainer: document.getElementById('logo-container'),
    adminPanel: document.getElementById('admin-panel'),
    closeAdmin: document.getElementById('close-admin'),
    overlay: document.getElementById('overlay'),
    quizLoading: document.getElementById('quiz-loading'),
    categoryFilter: document.getElementById('category-filter'),
    categorySelect: document.getElementById('category-select'),
    timerDisplay: document.getElementById('timer'),
    gradeSelectionContainer: document.getElementById('grade-selection-container'),
    sectionSelectionContainer: document.getElementById('section-selection-container'),
    subjectSelectionContainer: document.getElementById('subject-selection-container'),
    lessonSelectionContainer: document.getElementById('lesson-selection-container'),
    sublessonSelectionContainer: document.getElementById('sublesson-selection-container'),
    backBtn: document.getElementById('back-btn'),
    adminNavItems: document.querySelectorAll('.admin-nav-item'),
    adminTabContents: document.querySelectorAll('.admin-tab-content'),
    adContainer: document.getElementById('ad-container'),
    gradeContainer: document.getElementById('grade-container'),
    sectionContainer: document.getElementById('section-container'),
    subjectContainer: document.getElementById('subject-container'),
    lessonContainer: document.getElementById('lesson-container'),
    sublessonContainer: document.getElementById('sublesson-container'),
    adminToggle: document.getElementById('admin-toggle'),
    adClose: document.getElementById('ad-close'),
    adTitle: document.getElementById('ad-title'),
    adDescription: document.getElementById('ad-description'),
    adAction: document.getElementById('ad-action'),
    themeToggle: document.getElementById('theme-toggle'),
    headerBackBtn: document.getElementById('header-back-btn'),
    loginToggle: document.getElementById('login-toggle'),
    loginModal: document.getElementById('login-modal'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginTabs: document.querySelectorAll('.login-tab'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginBtn: document.getElementById('login-btn'),
    loginError: document.getElementById('login-error'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerConfirm: document.getElementById('register-confirm-password'),
    registerBtn: document.getElementById('register-btn'),
    registerError: document.getElementById('register-error'),
    rememberMe: document.getElementById('remember-me'),
    userMenu: document.getElementById('user-menu'),
    userAvatar: document.getElementById('user-avatar'),
    userNameDisplay: document.getElementById('user-name-display'),
    userEmailDisplay: document.getElementById('user-email-display'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // عناصر لوحة الإدارة
    questionType: document.getElementById('question-type'),
    mcqOptions: document.getElementById('mcq-options'),
    truefalseOptions: document.getElementById('truefalse-options'),
    addQuestionBtn: document.getElementById('add-question-btn'),
    allQuestionsList: document.getElementById('all-questions-list'),
    filterGrade: document.getElementById('filter-grade'),
    filterSection: document.getElementById('filter-section'),
    filterSubject: document.getElementById('filter-subject'),
    filterType: document.getElementById('filter-type'),
    examTime: document.getElementById('exam-time'),
    examStatus: document.getElementById('exam-status'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    newSectionName: document.getElementById('new-section-name'),
    newSectionDescription: document.getElementById('new-section-description'),
    newSectionOrder: document.getElementById('new-section-order'),
    addSectionBtn: document.getElementById('add-section-btn'),
    sectionsList: document.getElementById('sections-list'),
    newSubjectName: document.getElementById('new-subject-name'),
    newSubjectDescription: document.getElementById('new-subject-description'),
    newSubjectSection: document.getElementById('new-subject-section'),
    newSubjectOrder: document.getElementById('new-subject-order'),
    addSubjectBtn: document.getElementById('add-subject-btn'),
    subjectsList: document.getElementById('subjects-list'),
    questionSection: document.getElementById('question-section'),
    questionSubject: document.getElementById('question-subject'),
    questionLesson: document.getElementById('question-lesson'),
    questionSublesson: document.getElementById('question-sublesson'),
    newLessonName: document.getElementById('new-lesson-name'),
    newLessonDescription: document.getElementById('new-lesson-description'),
    newLessonSubject: document.getElementById('new-lesson-subject'),
    newLessonOrder: document.getElementById('new-lesson-order'),
    addLessonBtn: document.getElementById('add-lesson-btn'),
    lessonsList: document.getElementById('lessons-list'),
    newSublessonName: document.getElementById('new-sublesson-name'),
    newSublessonDescription: document.getElementById('new-sublesson-description'),
    newSublessonLesson: document.getElementById('new-sublesson-lesson'),
    newSublessonOrder: document.getElementById('new-sublesson-order'),
    addSublessonBtn: document.getElementById('add-sublesson-btn'),
    sublessonsList: document.getElementById('sublessons-list'),
    adTitleInput: document.getElementById('ad-title-input'),
    adDescriptionInput: document.getElementById('ad-description-input'),
    adUrlInput: document.getElementById('ad-url-input'),
    adStatusInput: document.getElementById('ad-status-input'),
    saveAdBtn: document.getElementById('save-ad-btn'),
    previewAdTitle: document.getElementById('preview-ad-title'),
    previewAdDescription: document.getElementById('preview-ad-description'),
    autoBackup: document.getElementById('auto-backup'),
    manualBackupBtn: document.getElementById('manual-backup-btn'),
    backupStatus: document.getElementById('backup-status'),
    backupFile: document.getElementById('backup-file'),
    restoreBackupBtn: document.getElementById('restore-backup-btn'),
    lastBackupInfo: document.getElementById('last-backup-info'),
    questionGrade: document.getElementById('question-grade'),
    
    // عناصر إدارة المشرفين
    newAdminName: document.getElementById('new-admin-name'),
    newAdminEmail: document.getElementById('new-admin-email'),
    newAdminPassword: document.getElementById('new-admin-password'),
    newAdminRole: document.getElementById('new-admin-role'),
    addAdminBtn: document.getElementById('add-admin-btn'),
    adminsList: document.getElementById('admins-list'),
    
    // عناصر إدارة الصفوف
    newGradeName: document.getElementById('new-grade-name'),
    newGradeDescription: document.getElementById('new-grade-description'),
    newGradeIcon: document.getElementById('new-grade-icon'),
    newGradeBgStyle: document.getElementById('new-grade-bg-style'),
    newGradeBorderRadius: document.getElementById('new-grade-border-radius'),
    newGradeShadow: document.getElementById('new-grade-shadow'),
    newGradeBorder: document.getElementById('new-grade-border'),
    newGradeHoverEffect: document.getElementById('new-grade-hover-effect'),
    newGradePadding: document.getElementById('new-grade-padding'),
    newGradeAnimation: document.getElementById('new-grade-animation'),
    newGradeTextColor: document.getElementById('new-grade-text-color'),
    newGradeIconColor: document.getElementById('new-grade-icon-color'),
    newGradeOrder: document.getElementById('new-grade-order'),
    addGradeBtn: document.getElementById('add-grade-btn'),
    gradesList: document.getElementById('grades-list'),
    
    // عناصر إحصائيات الموقع
    totalVisits: document.getElementById('total-visits'),
    uniqueUsers: document.getElementById('unique-users'),
    dailyActive: document.getElementById('daily-active'),
    avgSession: document.getElementById('avg-session'),
    totalQuestionsStats: document.getElementById('total-questions-stats'),
    totalQuizzesStats: document.getElementById('total-quizzes-stats'),
    avgScorePercent: document.getElementById('avg-score-percent'),
    maxScore: document.getElementById('max-score'),
    minScore: document.getElementById('min-score'),
    activitiesList: document.getElementById('activities-list'),
    topUsersList: document.getElementById('top-users-list'),
    visitsChart: document.getElementById('visits-chart'),
    gradesChart: document.getElementById('grades-chart'),
    subjectsChart: document.getElementById('subjects-chart'),
    resultsChart: document.getElementById('results-chart')
};

// =============================================
// دوال التهيئة الأساسية
// =============================================

// تهيئة التطبيق
function initApp() {
    try {
        trackUserVisit();
        
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (elements.themeToggle) {
                elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
        
        // تحميل البيانات أولاً
        Promise.all([loadAdmins(), loadUsers()]).then(() => {
            // ثم التحقق من المستخدم
            checkLoggedInUser();
        }).catch(error => {
            console.error('خطأ في تحميل البيانات:', error);
            checkLoggedInUser();
        });
        
        setupEventListeners();
        loadInitialData();
        checkExamStatus();
        restoreSavedState();
        loadAd();
        
        elements.gradeSelectionContainer.style.display = 'block';
        
        window.addEventListener('beforeunload', saveCurrentState);
        window.addEventListener('popstate', handleBrowserBack);
        
        console.log('التطبيق تم تهيئته بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showError('حدث خطأ في تهيئة التطبيق. الرجاء تحديث الصفحة.');
    }
}

// تتبع دخول المستخدم
function trackUserVisit() {
    try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        
        const session = {
            userId: userId,
            timestamp: new Date().toISOString(),
            action: 'visit',
            page: window.location.href
        };
        
        siteStats.totalVisits = (siteStats.totalVisits || 0) + 1;
        
        if (!siteStats.uniqueUsers) siteStats.uniqueUsers = [];
        if (!siteStats.uniqueUsers.includes(userId)) {
            siteStats.uniqueUsers.push(userId);
        }
        
        const today = new Date().toDateString();
        const userKey = `${userId}_${today}`;
        
        if (!siteStats.dailyActiveUsers) siteStats.dailyActiveUsers = [];
        if (!siteStats.dailyActiveUsers.includes(userKey)) {
            siteStats.dailyActiveUsers.push(userKey);
        }
        
        if (!siteStats.userActivities) siteStats.userActivities = [];
        siteStats.userActivities.push(session);
        
        if (siteStats.userActivities.length > 100) {
            siteStats.userActivities = siteStats.userActivities.slice(-100);
        }
        
        const userSessions = siteStats.userSessions?.find(s => s.userId === userId);
        if (userSessions) {
            userSessions.count++;
            userSessions.lastVisit = new Date().toISOString();
        } else {
            if (!siteStats.userSessions) siteStats.userSessions = [];
            siteStats.userSessions.push({
                userId: userId,
                count: 1,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            });
        }
        
        saveSiteStats();
        saveUserActivityToFirebase(session);
    } catch (error) {
        console.error('خطأ في تتبع دخول المستخدم:', error);
    }
}

// حفظ إحصائيات الموقع
function saveSiteStats() {
    try {
        localStorage.setItem('siteStats', JSON.stringify(siteStats));
    } catch (error) {
        console.error('خطأ في حفظ إحصائيات الموقع:', error);
    }
}

// تحميل إحصائيات الموقع
function loadSiteStats() {
    try {
        const savedStats = JSON.parse(localStorage.getItem('siteStats'));
        if (savedStats) {
            siteStats = savedStats;
        }
    } catch (error) {
        console.error('خطأ في تحميل إحصائيات الموقع:', error);
    }
}

// حفظ نشاط المستخدم في Firebase
function saveUserActivityToFirebase(session) {
    try {
        const userActivityRef = database.ref(DB.activities);
        userActivityRef.push(session)
            .catch(error => {
                console.error('Error saving user activity:', error);
            });
    } catch (error) {
        console.error('خطأ في حفظ نشاط المستخدم:', error);
    }
}

// تحميل المستخدمين من Firebase مع العلاقات
function loadUsers() {
    return new Promise((resolve) => {
        try {
            const usersRef = database.ref(DB.users);
            usersRef.once('value', (snapshot) => {
                users = [];
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const user = childSnapshot.val();
                        user.id = childSnapshot.key;
                        users.push(user);
                    });
                }
                console.log('تم تحميل المستخدمين:', users.length);
                resolve(users);
            }, (error) => {
                console.error('خطأ في تحميل المستخدمين:', error);
                resolve([]);
            });
        } catch (error) {
            console.error('خطأ في دالة تحميل المستخدمين:', error);
            resolve([]);
        }
    });
}

// تحميل المشرفين من Firebase
function loadAdmins() {
    return new Promise((resolve) => {
        try {
            const adminsRef = database.ref(DB.admins);
            adminsRef.once('value', (snapshot) => {
                admins = [];
                
                if (!snapshot.exists() || snapshot.numChildren() === 0) {
                    // إضافة المشرف الافتراضي
                    console.log('لا يوجد مشرفين، جاري إضافة المشرف الافتراضي');
                    const defaultAdminData = {
                        name: defaultAdmin.name,
                        email: defaultAdmin.email,
                        password: defaultAdmin.password,
                        role: defaultAdmin.role,
                        createdAt: defaultAdmin.createdAt
                    };
                    
                    adminsRef.child('default_admin').set(defaultAdminData)
                        .then(() => {
                            admins.push({
                                id: 'default_admin',
                                ...defaultAdminData
                            });
                            console.log('تم إضافة المشرف الافتراضي بنجاح');
                            resolve(admins);
                        })
                        .catch(error => {
                            console.error('خطأ في إضافة المشرف الافتراضي:', error);
                            // في حالة الخطأ، نضيفه محلياً
                            admins.push(defaultAdmin);
                            resolve(admins);
                        });
                } else {
                    snapshot.forEach((childSnapshot) => {
                        const admin = childSnapshot.val();
                        admin.id = childSnapshot.key;
                        admins.push(admin);
                    });
                    console.log('تم تحميل المشرفين:', admins.length);
                    resolve(admins);
                }
            }, (error) => {
                console.error('خطأ في تحميل المشرفين:', error);
                // في حالة الخطأ، نضيف المشرف الافتراضي محلياً
                admins = [defaultAdmin];
                resolve(admins);
            });
        } catch (error) {
            console.error('خطأ في دالة تحميل المشرفين:', error);
            admins = [defaultAdmin];
            resolve(admins);
        }
    });
}

// تحميل ملف المستخدم (البيانات الإضافية)
function loadUserProfile(userId) {
    return new Promise((resolve) => {
        try {
            const profileRef = database.ref(`${DB.profiles}/${userId}`);
            profileRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    resolve(snapshot.val());
                } else {
                    resolve(null);
                }
            }, (error) => {
                console.error('خطأ في تحميل ملف المستخدم:', error);
                resolve(null);
            });
        } catch (error) {
            console.error('خطأ في دالة تحميل ملف المستخدم:', error);
            resolve(null);
        }
    });
}

// التحقق من المستخدم المسجل دخوله
function checkLoggedInUser() {
    try {
        // التحقق من localStorage أولاً
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('تم استعادة المستخدم من localStorage:', currentUser);
            
            // تحميل ملف المستخدم الإضافي
            loadUserProfile(currentUser.id).then(profile => {
                currentUserProfile = profile;
                updateUIForLoggedInUser();
            });
            
            return;
        }
        
        // التحقق من sessionStorage
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            currentUser = JSON.parse(sessionUser);
            console.log('تم استعادة المستخدم من sessionStorage:', currentUser);
            
            // تحميل ملف المستخدم الإضافي
            loadUserProfile(currentUser.id).then(profile => {
                currentUserProfile = profile;
                updateUIForLoggedInUser();
            });
            
            return;
        }
        
        console.log('لا يوجد مستخدم مسجل دخوله');
    } catch (error) {
        console.error('خطأ في التحقق من المستخدم:', error);
    }
}

// دالة التحقق من كون المستخدم مشرفاً
function checkIfUserIsAdmin(email) {
    if (!email) return false;
    
    // تحقق من المشرفين المحملين
    const isAdmin = admins.some(admin => admin.email === email);
    console.log('التحقق من المشرف:', email, isAdmin, admins);
    return isAdmin;
}

// تحديث الواجهة للمستخدم المسجل
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    try {
        elements.loginToggle.style.display = 'none';
        elements.userMenu.style.display = 'block';
        
        if (elements.userNameDisplay) {
            elements.userNameDisplay.textContent = currentUser.name || 'مستخدم';
        }
        if (elements.userEmailDisplay) {
            elements.userEmailDisplay.textContent = currentUser.email || '';
        }
        
        // التحقق إذا كان المستخدم مشرفاً
        const isAdmin = checkIfUserIsAdmin(currentUser.email);
        console.log('نتيجة التحقق من المشرف:', isAdmin);
        
        if (isAdmin) {
            // إظهار زر الإدارة
            if (elements.adminToggle) {
                elements.adminToggle.style.display = 'flex';
                console.log('تم إظهار زر الإدارة');
            }
            
            // إضافة شارة المشرف
            if (elements.userAvatar) {
                // إزالة أي شارة موجودة أولاً
                const oldBadge = elements.userAvatar.querySelector('.admin-badge');
                if (oldBadge) oldBadge.remove();
                
                const adminBadge = document.createElement('span');
                adminBadge.className = 'admin-badge';
                adminBadge.innerHTML = '<i class="fas fa-crown"></i> مشرف';
                elements.userAvatar.appendChild(adminBadge);
                console.log('تم إضافة شارة المشرف');
            }
        } else {
            // إخفاء زر الإدارة
            if (elements.adminToggle) {
                elements.adminToggle.style.display = 'none';
            }
            
            // إزالة شارة المشرف إذا كانت موجودة
            if (elements.userAvatar) {
                const oldBadge = elements.userAvatar.querySelector('.admin-badge');
                if (oldBadge) oldBadge.remove();
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث الواجهة:', error);
    }
}

// =============================================
// دوال تسجيل الدخول والتسجيل المتكاملة مع العلاقات
// =============================================

// تسجيل الدخول
function login(email, password, remember) {
    try {
        console.log('محاولة تسجيل الدخول:', email);
        
        // البحث في المشرفين أولاً
        const admin = admins.find(a => a.email === email && a.password === password);
        
        if (admin) {
            console.log('تم العثور على مشرف:', admin);
            // مشرف
            currentUser = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isAdmin: true,
                loginTime: new Date().toISOString()
            };
            
            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            // تسجيل جلسة المستخدم
            logUserSession(currentUser.id, 'login');
            
            elements.loginModal.style.display = 'none';
            elements.overlay.classList.remove('active');
            
            // تحديث الواجهة
            updateUIForLoggedInUser();
            
            showMessage(`مرحباً بك يا ${admin.name}`);
            return true;
        }
        
        // البحث في المستخدمين العاديين
        const usersRef = database.ref(DB.users);
        usersRef.once('value', (snapshot) => {
            let userFound = false;
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const user = childSnapshot.val();
                    if (user.email === email && user.password === password) {
                        userFound = true;
                        currentUser = {
                            id: childSnapshot.key,
                            name: user.name,
                            email: user.email,
                            isAdmin: false,
                            loginTime: new Date().toISOString()
                        };
                        
                        if (remember) {
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        } else {
                            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                        
                        // تسجيل جلسة المستخدم
                        logUserSession(currentUser.id, 'login');
                        
                        // تحميل ملف المستخدم
                        loadUserProfile(currentUser.id).then(profile => {
                            currentUserProfile = profile;
                        });
                        
                        elements.loginModal.style.display = 'none';
                        elements.overlay.classList.remove('active');
                        
                        updateUIForLoggedInUser();
                        showMessage(`مرحباً بك يا ${user.name}`);
                    }
                });
            }
            
            if (!userFound) {
                if (elements.loginError) {
                    elements.loginError.style.display = 'block';
                    elements.loginError.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                }
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        if (elements.loginError) {
            elements.loginError.style.display = 'block';
            elements.loginError.textContent = 'حدث خطأ في تسجيل الدخول';
        }
    }
}

// تسجيل مستخدم جديد مع العلاقات الكاملة
function register(name, email, password, confirmPassword) {
    try {
        if (password !== confirmPassword) {
            if (elements.registerError) {
                elements.registerError.style.display = 'block';
                elements.registerError.textContent = 'كلمة المرور غير متطابقة';
            }
            return;
        }
        
        if (password.length < 6) {
            if (elements.registerError) {
                elements.registerError.style.display = 'block';
                elements.registerError.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            }
            return;
        }
        
        // التحقق من عدم وجود البريد الإلكتروني مسبقاً
        const usersRef = database.ref(DB.users);
        usersRef.once('value', (snapshot) => {
            let emailExists = false;
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const user = childSnapshot.val();
                    if (user.email === email) {
                        emailExists = true;
                    }
                });
            }
            
            // التحقق من المشرفين
            const adminExists = admins.some(a => a.email === email);
            
            if (emailExists || adminExists) {
                if (elements.registerError) {
                    elements.registerError.style.display = 'block';
                    elements.registerError.textContent = 'البريد الإلكتروني مستخدم بالفعل';
                }
                return;
            }
            
            // إنشاء معرف المستخدم الجديد
            const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // 1. إضافة المستخدم في جدول users (البيانات الأساسية)
            const newUser = {
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString(),
                status: 'active',
                lastLogin: null
            };
            
            usersRef.child(newUserId).set(newUser)
                .then(() => {
                    console.log('تم إضافة المستخدم في جدول users');
                    
                    // 2. إنشاء ملف المستخدم (user_profile) - بيانات إضافية
                    const userProfile = {
                        userId: newUserId,
                        fullName: name,
                        email: email,
                        bio: '',
                        avatar: '',
                        phone: '',
                        birthDate: '',
                        country: '',
                        education: '',
                        interests: [],
                        stats: {
                            totalQuizzes: 0,
                            averageScore: 0,
                            totalTime: 0,
                            bestScore: 0,
                            lastQuizDate: null
                        },
                        settings: {
                            emailNotifications: true,
                            darkMode: isDarkMode,
                            language: 'ar',
                            fontSize: 'medium'
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    const profileRef = database.ref(`${DB.profiles}/${newUserId}`);
                    
                    // 3. إنشاء إحصائيات المستخدم
                    const userStats = {
                        userId: newUserId,
                        totalVisits: 1,
                        totalQuizzes: 0,
                        totalCorrect: 0,
                        totalWrong: 0,
                        totalTime: 0,
                        achievements: [],
                        rank: 'newbie',
                        points: 0,
                        level: 1,
                        lastActive: new Date().toISOString()
                    };
                    
                    const statsRef = database.ref(`${DB.sessions}/${newUserId}/stats`);
                    
                    // تنفيذ جميع العمليات معاً
                    Promise.all([
                        profileRef.set(userProfile),
                        statsRef.set(userStats),
                        logUserSession(newUserId, 'register')
                    ]).then(() => {
                        console.log('تم إنشاء جميع بيانات المستخدم بنجاح');
                        
                        // تسجيل الدخول تلقائياً بعد التسجيل
                        currentUser = {
                            id: newUserId,
                            name: name,
                            email: email,
                            isAdmin: false,
                            registerDate: new Date().toISOString()
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        currentUserProfile = userProfile;
                        
                        elements.loginModal.style.display = 'none';
                        elements.overlay.classList.remove('active');
                        
                        updateUIForLoggedInUser();
                        showMessage('تم التسجيل بنجاح! مرحباً بك في المنصة');
                        
                        // إعادة تحميل المستخدمين
                        loadUsers();
                        
                        // إضافة نشاط التسجيل
                        addUserActivity(newUserId, 'register', 'قام بتسجيل حساب جديد');
                        
                    }).catch(error => {
                        console.error('خطأ في إنشاء بيانات المستخدم الإضافية:', error);
                        // في حالة فشل إنشاء البيانات الإضافية، نحذف المستخدم الأساسي
                        usersRef.child(newUserId).remove();
                        
                        if (elements.registerError) {
                            elements.registerError.style.display = 'block';
                            elements.registerError.textContent = 'حدث خطأ في إنشاء الحساب';
                        }
                    });
                    
                })
                .catch(error => {
                    console.error('خطأ في إضافة المستخدم:', error);
                    if (elements.registerError) {
                        elements.registerError.style.display = 'block';
                        elements.registerError.textContent = 'حدث خطأ في التسجيل';
                    }
                });
        });
    } catch (error) {
        console.error('خطأ في تسجيل مستخدم جديد:', error);
        if (elements.registerError) {
            elements.registerError.style.display = 'block';
            elements.registerError.textContent = 'حدث خطأ في التسجيل';
        }
    }
}

// تسجيل جلسة المستخدم
function logUserSession(userId, action) {
    try {
        const sessionRef = database.ref(`${DB.sessions}/${userId}`);
        const sessionId = sessionRef.push().key;
        
        const sessionData = {
            sessionId: sessionId,
            userId: userId,
            action: action,
            timestamp: new Date().toISOString(),
            ip: '', // يمكن إضافة IP إذا كان متاحاً
            userAgent: navigator.userAgent
        };
        
        sessionRef.child(sessionId).set(sessionData);
        
        // تحديث آخر نشاط للمستخدم
        const profileRef = database.ref(`${DB.profiles}/${userId}`);
        profileRef.child('lastActive').set(new Date().toISOString());
        
        // تحديث إحصائيات الزيارات
        const statsRef = database.ref(`${DB.sessions}/${userId}/stats`);
        statsRef.child('lastVisit').set(new Date().toISOString());
        statsRef.child('visitCount').transaction(current => (current || 0) + 1);
        
    } catch (error) {
        console.error('خطأ في تسجيل جلسة المستخدم:', error);
    }
}

// إضافة نشاط للمستخدم
function addUserActivity(userId, type, description, data = {}) {
    try {
        const activityRef = database.ref(`${DB.activities}/${userId}`);
        const activityId = activityRef.push().key;
        
        const activityData = {
            activityId: activityId,
            userId: userId,
            type: type,
            description: description,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        activityRef.child(activityId).set(activityData);
        
        // الاحتفاظ بآخر 50 نشاط فقط
        activityRef.limitToLast(50).once('value', (snapshot) => {
            if (snapshot.numChildren() > 50) {
                const firstChild = Object.keys(snapshot.val())[0];
                activityRef.child(firstChild).remove();
            }
        });
        
    } catch (error) {
        console.error('خطأ في إضافة نشاط المستخدم:', error);
    }
}

// تسجيل الخروج
function logout() {
    try {
        if (currentUser) {
            // تسجيل جلسة الخروج
            logUserSession(currentUser.id, 'logout');
        }
        
        currentUser = null;
        currentUserProfile = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        elements.loginToggle.style.display = 'flex';
        elements.userMenu.style.display = 'none';
        
        if (elements.adminToggle) {
            elements.adminToggle.style.display = 'none';
        }
        
        // إزالة شارة المشرف
        if (elements.userAvatar) {
            const adminBadge = elements.userAvatar.querySelector('.admin-badge');
            if (adminBadge) {
                adminBadge.remove();
            }
        }
        
        // إغلاق لوحة الإدارة إذا كانت مفتوحة
        if (elements.adminPanel.classList.contains('active')) {
            elements.adminPanel.classList.remove('active');
            elements.overlay.classList.remove('active');
        }
        
        showMessage('تم تسجيل الخروج بنجاح');
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
}

// عرض رسالة نجاح
function showMessage(message) {
    try {
        // يمكنك تخصيص هذه الدالة لعرض رسالة جميلة
        alert(message);
    } catch (error) {
        console.error('خطأ في عرض الرسالة:', error);
    }
}

// =============================================
// دوال إدارة المشرفين
// =============================================

// إضافة مشرف جديد
function addNewAdmin() {
    try {
        const name = elements.newAdminName?.value.trim();
        const email = elements.newAdminEmail?.value.trim();
        const password = elements.newAdminPassword?.value.trim();
        const role = elements.newAdminRole?.value;
        
        if (!name || !email || !password) {
            alert('الرجاء إدخال جميع البيانات');
            return;
        }
        
        // التحقق من عدم وجود البريد الإلكتروني مسبقاً
        const emailExists = admins.some(a => a.email === email) || 
                           users.some(u => u.email === email);
        
        if (emailExists) {
            alert('البريد الإلكتروني مستخدم بالفعل');
            return;
        }
        
        const adminsRef = database.ref(DB.admins);
        const newAdminRef = adminsRef.push();
        
        const adminData = {
            name: name,
            email: email,
            password: password,
            role: role,
            createdAt: new Date().toISOString()
        };
        
        newAdminRef.set(adminData)
            .then(() => {
                alert('تم إضافة المشرف بنجاح');
                
                elements.newAdminName.value = '';
                elements.newAdminEmail.value = '';
                elements.newAdminPassword.value = '';
                
                loadAdmins().then(() => {
                    loadAdminsForAdmin();
                });
            })
            .catch(error => {
                alert('حدث خطأ في إضافة المشرف: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة مشرف:', error);
        alert('حدث خطأ في إضافة المشرف');
    }
}

// تحميل قائمة المشرفين في لوحة الإدارة
function loadAdminsForAdmin() {
    try {
        const adminsList = elements.adminsList;
        if (!adminsList) return;
        
        adminsList.innerHTML = '';
        
        if (admins.length > 0) {
            admins.sort((a, b) => a.createdAt?.localeCompare(b.createdAt) || 0);
            
            admins.forEach(admin => {
                const adminItem = document.createElement('div');
                adminItem.className = 'item-card';
                
                const roleText = 
                    admin.role === 'super_admin' ? 'مدير عام' :
                    admin.role === 'admin' ? 'مشرف' : 'محرر';
                
                const roleClass = 
                    admin.role === 'super_admin' ? 'gradient-danger' :
                    admin.role === 'admin' ? 'gradient-warning' : 'gradient-info';
                
                adminItem.innerHTML = `
                    <h4>
                        <i class="fas fa-user-shield ${roleClass}"></i>
                        ${admin.name}
                        ${admin.id === 'default_admin' ? '<span class="admin-badge" style="position: relative; top: 0; right: 0; margin-right: 10px;">افتراضي</span>' : ''}
                    </h4>
                    <div class="item-meta">
                        <span><i class="fas fa-envelope"></i> ${admin.email}</span>
                        <span><i class="fas fa-tag"></i> ${roleText}</span>
                    </div>
                    <div class="item-actions">
                        ${admin.id !== 'default_admin' ? `
                            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteAdmin('${admin.id}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        ` : ''}
                    </div>
                `;
                
                adminsList.appendChild(adminItem);
            });
        } else {
            adminsList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا يوجد مشرفين</h3>
                    <p>أضف مشرفين جدد من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل المشرفين:', error);
    }
}

// حذف مشرف
function deleteAdmin(adminId) {
    try {
        if (adminId === 'default_admin') {
            alert('لا يمكن حذف المشرف الافتراضي');
            return;
        }
        
        if (confirm('هل أنت متأكد من حذف هذا المشرف؟')) {
            database.ref(DB.admins + '/' + adminId).remove()
                .then(() => {
                    alert('تم حذف المشرف بنجاح');
                    loadAdmins().then(() => {
                        loadAdminsForAdmin();
                        // تحديث واجهة المستخدم الحالي إذا كان هو المحذوف
                        if (currentUser && admins.some(a => a.email === currentUser.email)) {
                            // المستخدم الحالي لا يزال مشرفاً
                        } else if (currentUser && currentUser.email) {
                            // المستخدم الحالي لم يعد مشرفاً
                            updateUIForLoggedInUser();
                        }
                    });
                })
                .catch(error => {
                    alert('حدث خطأ في حذف المشرف: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف المشرف:', error);
        alert('حدث خطأ في حذف المشرف');
    }
}

// =============================================
// دوال التنقل والرجوع
// =============================================

// دالة التعامل مع زر الرجوع في المتصفح
function handleBrowserBack(event) {
    try {
        event.preventDefault();
        goBack();
    } catch (error) {
        console.error('خطأ في التعامل مع زر الرجوع في المتصفح:', error);
    }
}

// دالة الرجوع الموحدة
function goBack() {
    try {
        if (elements.quizContainer.style.display === 'block') {
            elements.quizContainer.style.display = 'none';
            if (selectedSublesson) {
                elements.sublessonSelectionContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
            } else if (selectedLesson) {
                elements.sublessonSelectionContainer.style.display = 'none';
                elements.lessonSelectionContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
                selectedSublesson = '';
            } else if (selectedSubject) {
                elements.lessonSelectionContainer.style.display = 'none';
                elements.subjectSelectionContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
                selectedLesson = '';
            } else if (selectedSection) {
                elements.subjectSelectionContainer.style.display = 'none';
                elements.sectionSelectionContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
                selectedSubject = '';
            } else if (selectedGrade) {
                elements.sectionSelectionContainer.style.display = 'none';
                elements.gradeSelectionContainer.style.display = 'block';
                elements.backBtn.style.display = 'none';
                elements.headerBackBtn.style.display = 'none';
                selectedSection = '';
            } else {
                elements.gradeSelectionContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'none';
            }
        } else if (elements.sublessonSelectionContainer.style.display === 'block') {
            elements.sublessonSelectionContainer.style.display = 'none';
            elements.lessonSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
            selectedSublesson = '';
        } else if (elements.lessonSelectionContainer.style.display === 'block') {
            elements.lessonSelectionContainer.style.display = 'none';
            elements.subjectSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
            selectedLesson = '';
        } else if (elements.subjectSelectionContainer.style.display === 'block') {
            elements.subjectSelectionContainer.style.display = 'none';
            elements.sectionSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
            selectedSubject = '';
        } else if (elements.sectionSelectionContainer.style.display === 'block') {
            elements.sectionSelectionContainer.style.display = 'none';
            elements.gradeSelectionContainer.style.display = 'block';
            elements.backBtn.style.display = 'none';
            elements.headerBackBtn.style.display = 'none';
            selectedSection = '';
        }
        
        saveCurrentState();
    } catch (error) {
        console.error('خطأ في دالة الرجوع:', error);
        showError('حدث خطأ في عملية الرجوع');
    }
}

// =============================================
// دوال تحميل البيانات
// =============================================

// تحميل البيانات الأولية
function loadInitialData() {
    try {
        loadGrades();
        loadSections();
        loadSubjects();
        loadLessons();
        loadSublessons();
        loadSiteStats();
        updateLastBackupInfo();
        loadAutoBackupSetting();
    } catch (error) {
        console.error('خطأ في تحميل البيانات الأولية:', error);
    }
}

// تحميل الصفوف من قاعدة البيانات
function loadGrades() {
    try {
        const gradesRef = database.ref(DB.grades);
        gradesRef.on('value', (snapshot) => {
            grades = [];
            snapshot.forEach((childSnapshot) => {
                const grade = childSnapshot.val();
                grade.id = childSnapshot.key;
                grades.push(grade);
            });
            
            grades.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            updateGradeDropdowns();
            loadGradesForDisplay();
            loadGradesForAdmin();
        }, (error) => {
            console.error('خطأ في تحميل الصفوف:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الصفوف:', error);
    }
}

// عرض الصفوف في الواجهة الرئيسية مع تطبيق التصميم
function loadGradesForDisplay() {
    try {
        const gradeContainer = document.getElementById('grade-container');
        if (!gradeContainer) return;
        
        gradeContainer.innerHTML = '';
        
        if (grades.length > 0) {
            grades.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            grades.forEach(grade => {
                const gradeCard = document.createElement('div');
                
                // تجميع كلاسات التصميم
                const designClasses = [
                    'grade-card',
                    grade.borderRadius || 'radius-soft',
                    grade.shadow || 'shadow-soft',
                    grade.border || 'border-light',
                    grade.hoverEffect || 'hover-scale',
                    grade.padding || 'normal',
                    grade.animation || 'anim-fade',
                    grade.bgStyle || 'gradient-primary'
                ].join(' ');
                
                gradeCard.className = designClasses;
                gradeCard.dataset.grade = grade.id;
                
                // لون النص والأيقونة
                const textColorClass = grade.textColor || 'text-white';
                const iconColorClass = grade.iconColor || 'icon-white';
                
                gradeCard.innerHTML = `
                    <i class="fas ${grade.icon || 'fa-graduation-cap'} ${iconColorClass}"></i>
                    <h3 class="${textColorClass}">${grade.name}</h3>
                    <p class="${textColorClass}">${grade.description || ''}</p>
                `;
                
                gradeCard.addEventListener('click', function() {
                    try {
                        document.querySelectorAll('.grade-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedGrade = this.dataset.grade;
                        
                        const gradeName = grades.find(g => g.id === selectedGrade)?.name || '';
                        elements.quizTitle.textContent = `اختبار - ${gradeName}`;
                        
                        elements.gradeSelectionContainer.style.display = 'none';
                        elements.sectionSelectionContainer.style.display = 'block';
                        elements.backBtn.style.display = 'flex';
                        elements.headerBackBtn.style.display = 'flex';
                        
                        loadSectionsForGrade(selectedGrade);
                        saveCurrentState();
                    } catch (error) {
                        console.error('خطأ في اختيار الصف:', error);
                        showError('حدث خطأ في اختيار الصف');
                    }
                });
                
                gradeContainer.appendChild(gradeCard);
            });
        } else {
            gradeContainer.innerHTML = `
                <div class="no-questions" style="grid-column: 1 / -1;">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد صفوف دراسية متاحة</h3>
                    <p>سيتم إضافة الصفوف قريباً من قبل الإدارة.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في عرض الصفوف:', error);
    }
}

// تحميل الأقسام
function loadSections() {
    try {
        const sectionsRef = database.ref(DB.sections);
        sectionsRef.on('value', (snapshot) => {
            sections = [];
            snapshot.forEach((childSnapshot) => {
                const section = childSnapshot.val();
                section.id = childSnapshot.key;
                sections.push(section);
            });
            
            sections.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            updateSectionDropdowns();
            loadSectionsForAdmin();
        }, (error) => {
            console.error('خطأ في تحميل الأقسام:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأقسام:', error);
    }
}

// تحميل المواد
function loadSubjects() {
    try {
        const subjectsRef = database.ref(DB.subjects);
        subjectsRef.on('value', (snapshot) => {
            subjects = [];
            snapshot.forEach((childSnapshot) => {
                const subject = childSnapshot.val();
                subject.id = childSnapshot.key;
                subjects.push(subject);
            });
            
            subjects.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            updateSubjectDropdowns();
            loadSubjectsForAdmin();
        }, (error) => {
            console.error('خطأ في تحميل المواد:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل المواد:', error);
    }
}

// تحميل الدروس
function loadLessons() {
    try {
        const lessonsRef = database.ref(DB.lessons);
        lessonsRef.on('value', (snapshot) => {
            lessons = [];
            snapshot.forEach((childSnapshot) => {
                const lesson = childSnapshot.val();
                lesson.id = childSnapshot.key;
                lessons.push(lesson);
            });
            
            lessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            updateLessonDropdowns();
            updateLessonDropdownsForSublessons();
            loadLessonsForAdmin();
        }, (error) => {
            console.error('خطأ في تحميل الدروس:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الدروس:', error);
    }
}

// تحميل الأقسام الفرعية
function loadSublessons() {
    try {
        const sublessonsRef = database.ref(DB.sublessons);
        sublessonsRef.on('value', (snapshot) => {
            sublessons = [];
            snapshot.forEach((childSnapshot) => {
                const sublesson = childSnapshot.val();
                sublesson.id = childSnapshot.key;
                sublessons.push(sublesson);
            });
            
            sublessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            updateSublessonDropdowns();
            loadSublessonsForAdmin();
        }, (error) => {
            console.error('خطأ في تحميل الأقسام الفرعية:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأقسام الفرعية:', error);
    }
}

// =============================================
// دوال تحديث القوائم المنسدلة
// =============================================

// تحديث قوائم الصفوف المنسدلة
function updateGradeDropdowns() {
    try {
        const questionGrade = document.getElementById('question-grade');
        if (questionGrade) {
            questionGrade.innerHTML = '<option value="">اختر الصف</option>';
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.id;
                option.textContent = grade.name;
                questionGrade.appendChild(option);
            });
        }
        
        const filterGrade = document.getElementById('filter-grade');
        if (filterGrade) {
            filterGrade.innerHTML = '<option value="">جميع الصفوف</option>';
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.id;
                option.textContent = grade.name;
                filterGrade.appendChild(option);
            });
        }
        
        const sectionGradesCheckboxes = document.getElementById('section-grades-checkboxes');
        if (sectionGradesCheckboxes) {
            sectionGradesCheckboxes.innerHTML = '';
            grades.forEach(grade => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" name="section-grades" value="${grade.id}"> ${grade.name}
                `;
                sectionGradesCheckboxes.appendChild(label);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم الصفوف:', error);
    }
}

// تحديث قوائم الأقسام المنسدلة
function updateSectionDropdowns(selectedGrade = '') {
    try {
        if (elements.questionSection) {
            elements.questionSection.innerHTML = '<option value="">اختر القسم</option>';
            
            let filteredSections = sections;
            if (selectedGrade) {
                filteredSections = sections.filter(section => 
                    section.grades && section.grades.includes(selectedGrade)
                );
            }
            
            filteredSections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.id;
                option.textContent = section.name;
                elements.questionSection.appendChild(option);
            });
        }
        
        if (elements.newSubjectSection) {
            elements.newSubjectSection.innerHTML = '<option value="">اختر القسم</option>';
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.id;
                option.textContent = section.name;
                elements.newSubjectSection.appendChild(option);
            });
        }
        
        if (elements.filterSection) {
            elements.filterSection.innerHTML = '<option value="">جميع الأقسام</option>';
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.id;
                option.textContent = section.name;
                elements.filterSection.appendChild(option);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم الأقسام:', error);
    }
}

// تحديث قوائم المواد المنسدلة
function updateSubjectDropdowns(selectedSection = '') {
    try {
        if (elements.questionSubject) {
            elements.questionSubject.innerHTML = '<option value="">اختر المادة</option>';
            
            let filteredSubjects = subjects;
            if (selectedSection) {
                filteredSubjects = subjects.filter(subject => 
                    subject.sectionId === selectedSection
                );
            }
            
            filteredSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                elements.questionSubject.appendChild(option);
            });
        }
        
        if (elements.newLessonSubject) {
            elements.newLessonSubject.innerHTML = '<option value="">اختر المادة</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                elements.newLessonSubject.appendChild(option);
            });
        }
        
        if (elements.filterSubject) {
            elements.filterSubject.innerHTML = '<option value="">جميع المواد</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                elements.filterSubject.appendChild(option);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم المواد:', error);
    }
}

// تحديث قوائم الدروس المنسدلة
function updateLessonDropdowns(selectedSubject = '') {
    try {
        if (elements.questionLesson) {
            elements.questionLesson.innerHTML = '<option value="">اختر الدرس (اختياري)</option>';
            
            let filteredLessons = lessons;
            if (selectedSubject) {
                filteredLessons = lessons.filter(lesson => 
                    lesson.subjectId === selectedSubject
                );
            }
            
            filteredLessons.forEach(lesson => {
                const option = document.createElement('option');
                option.value = lesson.id;
                option.textContent = lesson.name;
                elements.questionLesson.appendChild(option);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم الدروس:', error);
    }
}

// تحديث قوائم الدروس المنسدلة للأقسام الفرعية
function updateLessonDropdownsForSublessons() {
    try {
        if (elements.newSublessonLesson) {
            elements.newSublessonLesson.innerHTML = '<option value="">اختر الدرس</option>';
            lessons.forEach(lesson => {
                const option = document.createElement('option');
                option.value = lesson.id;
                option.textContent = lesson.name;
                elements.newSublessonLesson.appendChild(option);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم الدروس للأقسام الفرعية:', error);
    }
}

// تحديث قوائم الأقسام الفرعية المنسدلة
function updateSublessonDropdowns(selectedLesson = '') {
    try {
        if (elements.questionSublesson) {
            elements.questionSublesson.innerHTML = '<option value="">اختر القسم الفرعي (اختياري)</option>';
            
            let filteredSublessons = sublessons;
            if (selectedLesson) {
                filteredSublessons = sublessons.filter(sublesson => 
                    sublesson.lessonId === selectedLesson
                );
            }
            
            filteredSublessons.forEach(sublesson => {
                const option = document.createElement('option');
                option.value = sublesson.id;
                option.textContent = sublesson.name;
                elements.questionSublesson.appendChild(option);
            });
        }
    } catch (error) {
        console.error('خطأ في تحديث قوائم الأقسام الفرعية:', error);
    }
}

// =============================================
// دوال عرض الأقسام والمواد
// =============================================

// عرض الأقسام للصف المختار مع تطبيق التصميم
function loadSectionsForGrade(gradeId) {
    try {
        elements.sectionContainer.innerHTML = '';
        
        const gradeSections = sections.filter(section => 
            section.grades && section.grades.includes(gradeId)
        );
        
        if (gradeSections.length > 0) {
            gradeSections.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            gradeSections.forEach(section => {
                const sectionCard = document.createElement('div');
                
                // تجميع كلاسات التصميم
                const designClasses = [
                    'section-card',
                    section.borderRadius || 'radius-soft',
                    section.shadow || 'shadow-soft',
                    section.border || 'border-light',
                    section.hoverEffect || 'hover-scale',
                    section.padding || 'normal',
                    section.animation || 'anim-fade',
                    section.bgStyle || 'gradient-secondary'
                ].join(' ');
                
                sectionCard.className = designClasses;
                sectionCard.dataset.section = section.id;
                
                // لون النص والأيقونة
                const textColorClass = section.textColor || 'text-white';
                const iconColorClass = section.iconColor || 'icon-white';
                
                sectionCard.innerHTML = `
                    <i class="fas ${section.icon || 'fa-layer-group'} ${iconColorClass}"></i>
                    <h3 class="${textColorClass}">${section.name}</h3>
                    <p class="${textColorClass}">${section.description || ''}</p>
                `;
                
                sectionCard.addEventListener('click', function() {
                    try {
                        document.querySelectorAll('.section-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedSection = this.dataset.section;
                        
                        const sectionName = sections.find(s => s.id === selectedSection)?.name || '';
                        elements.quizTitle.textContent += ` - ${sectionName}`;
                        
                        loadSubjectsForSection(selectedSection);
                        saveCurrentState();
                    } catch (error) {
                        console.error('خطأ في اختيار القسم:', error);
                        showError('حدث خطأ في اختيار القسم');
                    }
                });
                
                elements.sectionContainer.appendChild(sectionCard);
            });
            
            elements.gradeSelectionContainer.style.display = 'none';
            elements.sectionSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
        } else {
            elements.sectionContainer.innerHTML = `
                <div class="no-questions" style="grid-column: 1 / -1;">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد أقسام متاحة</h3>
                    <p>لم يتم إضافة أقسام لهذا الصف بعد.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الأقسام للصف:', error);
        showError('حدث خطأ في تحميل الأقسام');
    }
}

// عرض المواد للقسم المختار مع تطبيق التصميم
function loadSubjectsForSection(sectionId) {
    try {
        elements.subjectContainer.innerHTML = '';
        
        const sectionSubjects = subjects.filter(subject => 
            subject.sectionId === sectionId
        );
        
        if (sectionSubjects.length > 0) {
            sectionSubjects.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            sectionSubjects.forEach(subject => {
                const subjectCard = document.createElement('div');
                
                // تجميع كلاسات التصميم
                const designClasses = [
                    'subject-card',
                    subject.borderRadius || 'radius-soft',
                    subject.shadow || 'shadow-soft',
                    subject.border || 'border-light',
                    subject.hoverEffect || 'hover-scale',
                    subject.padding || 'normal',
                    subject.animation || 'anim-fade',
                    subject.bgStyle || 'gradient-success'
                ].join(' ');
                
                subjectCard.className = designClasses;
                subjectCard.dataset.subject = subject.id;
                
                // لون النص والأيقونة
                const textColorClass = subject.textColor || 'text-white';
                const iconColorClass = subject.iconColor || 'icon-white';
                
                subjectCard.innerHTML = `
                    <i class="fas ${subject.icon || 'fa-book'} ${iconColorClass}"></i>
                    <h3 class="${textColorClass}">${subject.name}</h3>
                    <p class="${textColorClass}">${subject.description || ''}</p>
                `;
                
                subjectCard.addEventListener('click', function() {
                    try {
                        document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedSubject = this.dataset.subject;
                        
                        const subjectName = subjects.find(s => s.id === selectedSubject)?.name || '';
                        elements.quizTitle.textContent += ` - ${subjectName}`;
                        
                        loadLessonsForSubject(selectedSubject);
                        saveCurrentState();
                    } catch (error) {
                        console.error('خطأ في اختيار المادة:', error);
                        showError('حدث خطأ في اختيار المادة');
                    }
                });
                
                elements.subjectContainer.appendChild(subjectCard);
            });
            
            elements.sectionSelectionContainer.style.display = 'none';
            elements.subjectSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
        } else {
            elements.subjectContainer.innerHTML = `
                <div class="no-questions" style="grid-column: 1 / -1;">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد مواد متاحة</h3>
                    <p>لم يتم إضافة مواد لهذا القسم بعد.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل المواد للقسم:', error);
        showError('حدث خطأ في تحميل المواد');
    }
}

// عرض الدروس للمادة المختارة مع تطبيق التصميم
function loadLessonsForSubject(subjectId) {
    try {
        elements.lessonContainer.innerHTML = '';
        
        const subjectLessons = lessons.filter(lesson => 
            lesson.subjectId === subjectId
        );
        
        if (subjectLessons.length > 0) {
            subjectLessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            subjectLessons.forEach(lesson => {
                const lessonCard = document.createElement('div');
                
                // تجميع كلاسات التصميم
                const designClasses = [
                    'lesson-card',
                    lesson.borderRadius || 'radius-soft',
                    lesson.shadow || 'shadow-soft',
                    lesson.border || 'border-light',
                    lesson.hoverEffect || 'hover-scale',
                    lesson.padding || 'normal',
                    lesson.animation || 'anim-fade',
                    lesson.bgStyle || 'gradient-warning'
                ].join(' ');
                
                lessonCard.className = designClasses;
                lessonCard.dataset.lesson = lesson.id;
                
                // لون النص والأيقونة
                const textColorClass = lesson.textColor || 'text-white';
                const iconColorClass = lesson.iconColor || 'icon-white';
                
                lessonCard.innerHTML = `
                    <i class="fas ${lesson.icon || 'fa-book-open'} ${iconColorClass}"></i>
                    <h3 class="${textColorClass}">${lesson.name}</h3>
                    <p class="${textColorClass}">${lesson.description || ''}</p>
                `;
                
                lessonCard.addEventListener('click', function() {
                    try {
                        document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedLesson = this.dataset.lesson;
                        
                        const lessonName = lessons.find(l => l.id === selectedLesson)?.name || '';
                        elements.quizTitle.textContent += ` - ${lessonName}`;
                        
                        loadSublessonsForLesson(selectedLesson);
                        saveCurrentState();
                    } catch (error) {
                        console.error('خطأ في اختيار الدرس:', error);
                        showError('حدث خطأ في اختيار الدرس');
                    }
                });
                
                elements.lessonContainer.appendChild(lessonCard);
            });
            
            elements.subjectSelectionContainer.style.display = 'none';
            elements.lessonSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
        } else {
            setTimeout(() => {
                elements.subjectSelectionContainer.style.display = 'none';
                elements.quizContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
                loadQuestions();
            }, 300);
        }
    } catch (error) {
        console.error('خطأ في تحميل الدروس للمادة:', error);
        showError('حدث خطأ في تحميل الدروس');
    }
}

// عرض الأقسام الفرعية للدرس المختار مع تطبيق التصميم
function loadSublessonsForLesson(lessonId) {
    try {
        elements.sublessonContainer.innerHTML = '';
        
        const lessonSublessons = sublessons.filter(sublesson => 
            sublesson.lessonId === lessonId
        );
        
        if (lessonSublessons.length > 0) {
            lessonSublessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            lessonSublessons.forEach(sublesson => {
                const sublessonCard = document.createElement('div');
                
                // تجميع كلاسات التصميم
                const designClasses = [
                    'sublesson-card',
                    sublesson.borderRadius || 'radius-soft',
                    sublesson.shadow || 'shadow-soft',
                    sublesson.border || 'border-light',
                    sublesson.hoverEffect || 'hover-scale',
                    sublesson.padding || 'normal',
                    sublesson.animation || 'anim-fade',
                    sublesson.bgStyle || 'gradient-info'
                ].join(' ');
                
                sublessonCard.className = designClasses;
                sublessonCard.dataset.sublesson = sublesson.id;
                
                // لون النص والأيقونة
                const textColorClass = sublesson.textColor || 'text-white';
                const iconColorClass = sublesson.iconColor || 'icon-white';
                
                sublessonCard.innerHTML = `
                    <i class="fas ${sublesson.icon || 'fa-folder'} ${iconColorClass}"></i>
                    <h3 class="${textColorClass}">${sublesson.name}</h3>
                    <p class="${textColorClass}">${sublesson.description || ''}</p>
                `;
                
                sublessonCard.addEventListener('click', function() {
                    try {
                        document.querySelectorAll('.sublesson-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedSublesson = this.dataset.sublesson;
                        
                        const sublessonName = sublessons.find(s => s.id === selectedSublesson)?.name || '';
                        elements.quizTitle.textContent += ` - ${sublessonName}`;
                        
                        setTimeout(() => {
                            elements.sublessonSelectionContainer.style.display = 'none';
                            elements.quizContainer.style.display = 'block';
                            elements.headerBackBtn.style.display = 'flex';
                            loadQuestions();
                        }, 500);
                        
                        saveCurrentState();
                    } catch (error) {
                        console.error('خطأ في اختيار القسم الفرعي:', error);
                        showError('حدث خطأ في اختيار القسم الفرعي');
                    }
                });
                
                elements.sublessonContainer.appendChild(sublessonCard);
            });
            
            elements.lessonSelectionContainer.style.display = 'none';
            elements.sublessonSelectionContainer.style.display = 'block';
            elements.headerBackBtn.style.display = 'flex';
        } else {
            setTimeout(() => {
                elements.lessonSelectionContainer.style.display = 'none';
                elements.quizContainer.style.display = 'block';
                elements.headerBackBtn.style.display = 'flex';
                loadQuestions();
            }, 500);
        }
    } catch (error) {
        console.error('خطأ في تحميل الأقسام الفرعية للدرس:', error);
        showError('حدث خطأ في تحميل الأقسام الفرعية');
    }
}

// =============================================
// دوال الاختبارات والأسئلة
// =============================================

// تحميل الإختبارات من Firebase
function loadQuestions() {
    try {
        elements.quizLoading.style.display = 'flex';
        elements.questionContainer.innerHTML = '';
        
        const questionsRef = database.ref(DB.questions);
        questionsRef.once('value', (snapshot) => {
            questions = [];
            categories = new Set(['all']);
            
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                
                if (question.grade === selectedGrade && 
                    question.section === selectedSection && 
                    (!selectedSubject || question.subject === selectedSubject) &&
                    (!selectedLesson || question.lesson === selectedLesson) &&
                    (!selectedSublesson || question.sublesson === selectedSublesson)) {
                    questions.push(question);
                    
                    if (question.category) {
                        categories.add(question.category);
                    }
                }
            });
            
            updateCategoryFilters();
            
            if (questions.length > 0) {
                startQuiz();
            } else {
                showNoQuestionsMessage();
            }
            
            elements.quizLoading.style.display = 'none';
        }, (error) => {
            console.error('خطأ في تحميل الأسئلة:', error);
            elements.quizLoading.style.display = 'none';
            showError('حدث خطأ في تحميل الأسئلة');
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأسئلة:', error);
        elements.quizLoading.style.display = 'none';
        showError('حدث خطأ في تحميل الأسئلة');
    }
}

// بدء الاختبار
function startQuiz() {
    try {
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = Array(questions.length).fill(null);
        showQuestion();
        updateProgressBar();
        elements.quizContainer.style.display = 'block';
        elements.resultsContainer.style.display = 'none';
        elements.backBtn.style.display = 'flex';
        elements.headerBackBtn.style.display = 'flex';
        
        // تسجيل بدء الاختبار للمستخدم إذا كان مسجلاً
        if (currentUser) {
            addUserActivity(currentUser.id, 'start_quiz', 'بدأ اختبار جديد', {
                grade: selectedGrade,
                section: selectedSection,
                subject: selectedSubject,
                lesson: selectedLesson,
                sublesson: selectedSublesson,
                questionsCount: questions.length
            });
        }
    } catch (error) {
        console.error('خطأ في بدء الاختبار:', error);
        showError('حدث خطأ في بدء الاختبار');
    }
}

// تحديث شريط التقدم
function updateProgressBar() {
    try {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        elements.progressBar.style.width = `${progress}%`;
    } catch (error) {
        console.error('خطأ في تحديث شريط التقدم:', error);
    }
}

// عرض السؤال الحالي
function showQuestion() {
    try {
        if (currentQuestionIndex >= questions.length) {
            submitQuiz();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        let questionHTML = '';
        
        questionHTML += `
            <div class="question">
                <h3><span class="question-number">${currentQuestionIndex + 1}</span> ${question.text}</h3>
        `;
        
        if (question.type === 'mcq') {
            questionHTML += `<div class="options">`;
            
            for (let i = 1; i <= 4; i++) {
                const option = question[`option${i}`];
                if (!option) continue;
                
                const isSelected = userAnswers[currentQuestionIndex] === i.toString();
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" data-answer="${i}">
                        ${option}
                        <i class="fas fa-check option-icon"></i>
                    </div>
                `;
            }
            
            questionHTML += `</div>`;
        } else {
            questionHTML += `
                <div class="true-false-options">
                    <div class="true-false-btn ${userAnswers[currentQuestionIndex] === 'true' ? 'selected' : ''}" data-answer="true">
                        <i class="fas fa-check"></i> صح
                    </div>
                    <div class="true-false-btn ${userAnswers[currentQuestionIndex] === 'false' ? 'selected' : ''}" data-answer="false">
                        <i class="fas fa-times"></i> خطأ
                    </div>
                </div>
            `;
        }
        
        questionHTML += `</div>`;
        elements.questionContainer.innerHTML = questionHTML;
        
        if (question.type === 'mcq') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    userAnswers[currentQuestionIndex] = option.dataset.answer;
                });
            });
        } else {
            const trueFalseBtns = document.querySelectorAll('.true-false-btn');
            trueFalseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    trueFalseBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    userAnswers[currentQuestionIndex] = btn.dataset.answer;
                });
            });
        }
        
        elements.prevBtn.disabled = currentQuestionIndex === 0;
        elements.nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'flex' : 'none';
        elements.submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'flex' : 'none';
    } catch (error) {
        console.error('خطأ في عرض السؤال:', error);
        showError('حدث خطأ في عرض السؤال');
    }
}

// الانتقال إلى السؤال التالي
function nextQuestion() {
    try {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
            updateProgressBar();
        }
    } catch (error) {
        console.error('خطأ في الانتقال للسؤال التالي:', error);
        showError('حدث خطأ في الانتقال للسؤال التالي');
    }
}

// العودة إلى السؤال السابق
function prevQuestion() {
    try {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
            updateProgressBar();
        }
    } catch (error) {
        console.error('خطأ في العودة للسؤال السابق:', error);
        showError('حدث خطأ في العودة للسؤال السابق');
    }
}

// إرسال الاختبار
function submitQuiz() {
    try {
        showResults();
    } catch (error) {
        console.error('خطأ في إرسال الاختبار:', error);
        showError('حدث خطأ في إرسال الاختبار');
    }
}

// عرض النتائج
function showResults() {
    try {
        score = 0;
        let feedbackHTML = '<h3>التصحيح:</h3><ul>';
        
        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                score++;
            }
            
            feedbackHTML += `<li>
                <strong>السؤال ${index + 1}:</strong> ${question.text}<br>
                <span style="color: ${isCorrect ? 'green' : 'red'}">
                    إجابتك: ${formatAnswer(question, userAnswer)} - 
                    ${isCorrect ? 'صحيح' : 'خطأ (الإجابة الصحيحة: ' + formatAnswer(question, question.correctAnswer) + ')'}
                </span>
            </li><br>`;
        });
        
        feedbackHTML += '</ul>';
        
        elements.quizContainer.style.display = 'none';
        elements.resultsContainer.style.display = 'block';
        elements.scoreDisplay.textContent = score;
        
        const percentage = Math.round((score / questions.length) * 100);
        elements.percentageDisplay.textContent = `${percentage}%`;
        
        let medal = '';
        if (percentage >= 90) {
            medal = '<i class="fas fa-medal gold"></i>';
        } else if (percentage >= 75) {
            medal = '<i class="fas fa-medal silver"></i>';
        } else if (percentage >= 50) {
            medal = '<i class="fas fa-medal bronze"></i>';
        }
        elements.percentageDisplay.innerHTML += ` ${medal}`;
        
        const timeTaken = calculateTimeTaken();
        elements.timeTakenDisplay.textContent = timeTaken;
        elements.feedbackDisplay.innerHTML = feedbackHTML;
        
        saveQuizResult(score, questions.length, timeTaken);
        trackQuizCompletion(score, percentage, timeTaken);
        
        // تحديث إحصائيات المستخدم إذا كان مسجلاً
        if (currentUser) {
            updateUserStatsAfterQuiz(score, questions.length, timeTaken);
        }
    } catch (error) {
        console.error('خطأ في عرض النتائج:', error);
        showError('حدث خطأ في عرض النتائج');
    }
}

// تحديث إحصائيات المستخدم بعد الاختبار
function updateUserStatsAfterQuiz(score, totalQuestions, timeTaken) {
    try {
        const percentage = Math.round((score / totalQuestions) * 100);
        
        // تحديث ملف المستخدم
        const profileRef = database.ref(`${DB.profiles}/${currentUser.id}`);
        profileRef.child('stats').transaction((currentStats) => {
            if (!currentStats) currentStats = {};
            
            return {
                totalQuizzes: (currentStats.totalQuizzes || 0) + 1,
                averageScore: ((currentStats.averageScore || 0) + percentage) / ((currentStats.totalQuizzes || 0) + 1),
                totalTime: (currentStats.totalTime || 0) + parseInt(timeTaken.split(':')[0]) * 60 + parseInt(timeTaken.split(':')[1]),
                bestScore: Math.max(currentStats.bestScore || 0, percentage),
                lastQuizDate: new Date().toISOString()
            };
        });
        
        // حفظ نتيجة الاختبار في جدول نتائج المستخدم
        const resultRef = database.ref(`${DB.results}/${currentUser.id}`);
        const newResult = {
            userId: currentUser.id,
            userName: currentUser.name,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            timeTaken: timeTaken,
            grade: selectedGrade,
            section: selectedSection,
            subject: selectedSubject,
            lesson: selectedLesson,
            sublesson: selectedSublesson,
            timestamp: new Date().toISOString()
        };
        
        resultRef.push(newResult);
        
        // إضافة نشاط
        addUserActivity(currentUser.id, 'complete_quiz', 'أكمل اختبار', {
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage
        });
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المستخدم:', error);
    }
}

// تتبع إكمال الاختبار
function trackQuizCompletion(score, percentage, timeTaken) {
    try {
        const userId = localStorage.getItem('userId');
        const quizSession = {
            userId: userId,
            timestamp: new Date().toISOString(),
            action: 'quiz_complete',
            score: score,
            percentage: percentage,
            timeTaken: timeTaken,
            grade: selectedGrade,
            section: selectedSection,
            subject: selectedSubject,
            lesson: selectedLesson,
            sublesson: selectedSublesson,
            userName: currentUser ? currentUser.name : 'زائر'
        };
        
        if (!siteStats.userActivities) siteStats.userActivities = [];
        siteStats.userActivities.push(quizSession);
        
        if (!siteStats.quizResults) siteStats.quizResults = [];
        siteStats.quizResults.push(quizSession);
        
        if (siteStats.userActivities.length > 100) {
            siteStats.userActivities = siteStats.userActivities.slice(-100);
        }
        
        if (siteStats.quizResults.length > 100) {
            siteStats.quizResults = siteStats.quizResults.slice(-100);
        }
        
        saveSiteStats();
        saveUserActivityToFirebase(quizSession);
    } catch (error) {
        console.error('خطأ في تتبع إكمال الاختبار:', error);
    }
}

// حساب الوقت المستغرق
function calculateTimeTaken() {
    try {
        if (!quizStartTime) return '00:00';
        
        const endTime = new Date();
        const timeDiff = endTime - quizStartTime;
        
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } catch (error) {
        console.error('خطأ في حساب الوقت:', error);
        return '00:00';
    }
}

// حفظ نتيجة الاختبار
function saveQuizResult(score, totalQuestions, timeTaken) {
    try {
        const result = {
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            timestamp: new Date().toISOString(),
            timeTaken: timeTaken,
            grade: selectedGrade,
            section: selectedSection,
            subject: selectedSubject,
            lesson: selectedLesson,
            sublesson: selectedSublesson,
            userId: localStorage.getItem('userId'),
            userName: currentUser ? currentUser.name : 'زائر'
        };
        
        const resultsRef = database.ref(DB.quizResults);
        resultsRef.push(result)
            .catch(error => {
                console.error('Error saving quiz result:', error);
            });
    } catch (error) {
        console.error('خطأ في حفظ نتيجة الاختبار:', error);
    }
}

// تنسيق الإجابة لعرضها
function formatAnswer(question, answer) {
    try {
        if (!answer) return 'لم يتم الإجابة';
        
        if (question.type === 'mcq') {
            return question[`option${answer}`] || answer;
        } else {
            return answer === 'true' ? 'صح' : 'خطأ';
        }
    } catch (error) {
        console.error('خطأ في تنسيق الإجابة:', error);
        return 'خطأ في التنسيق';
    }
}

// إعادة الاختبار
function restartQuiz() {
    try {
        elements.quizContainer.style.display = 'block';
        elements.resultsContainer.style.display = 'none';
        currentQuestionIndex = 0;
        userAnswers = Array(questions.length).fill(null);
        startQuiz();
    } catch (error) {
        console.error('خطأ في إعادة الاختبار:', error);
        showError('حدث خطأ في إعادة الاختبار');
    }
}

// عرض رسالة عدم وجود إختبارات
function showNoQuestionsMessage() {
    try {
        elements.questionContainer.innerHTML = `
            <div class="no-questions">
                <i class="fas fa-info-circle"></i> لا توجد إختبارات متاحة حالياً للصف والقسم المحدد.
            </div>
        `;
        elements.nextBtn.style.display = 'none';
        elements.submitBtn.style.display = 'none';
    } catch (error) {
        console.error('خطأ في عرض رسالة عدم وجود أسئلة:', error);
    }
}

// عرض رسالة خطأ
function showError(message) {
    try {
        alert(message);
    } catch (error) {
        console.error('خطأ في عرض رسالة الخطأ:', error);
    }
}

// تصفية الإختبارات حسب التصنيف
function filterQuestionsByCategory(selectedCategory) {
    try {
        if (selectedCategory === 'all') {
            loadQuestions();
            return;
        }
        
        elements.quizLoading.style.display = 'flex';
        elements.questionContainer.innerHTML = '';
        
        const filteredQuestions = questions.filter(q => q.category === selectedCategory);
        
        if (filteredQuestions.length > 0) {
            questions = filteredQuestions;
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = Array(questions.length).fill(null);
            showQuestion();
            updateProgressBar();
        } else {
            showNoQuestionsMessage();
        }
        
        elements.quizLoading.style.display = 'none';
    } catch (error) {
        console.error('خطأ في تصفية الأسئلة:', error);
        elements.quizLoading.style.display = 'none';
        showError('حدث خطأ في تصفية الأسئلة');
    }
}

// تحديث قوائم التصنيفات
function updateCategoryFilters() {
    try {
        elements.categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category === 'all' ? 'جميع التصنيفات' : category;
            elements.categorySelect.appendChild(option);
        });
        
        elements.categoryFilter.style.display = categories.size > 2 ? 'block' : 'none';
    } catch (error) {
        console.error('خطأ في تحديث قوائم التصنيفات:', error);
    }
}

// =============================================
// دوال لوحة الإدارة
// =============================================

// تحميل جميع الأسئلة للإدارة
function loadAllQuestions() {
    try {
        const questionsRef = database.ref(DB.questions);
        questionsRef.once('value', (snapshot) => {
            elements.allQuestionsList.innerHTML = '';
            
            const filterGrade = elements.filterGrade.value;
            const filterSection = elements.filterSection.value;
            const filterSubject = elements.filterSubject.value;
            const filterType = elements.filterType.value;
            
            let hasQuestions = false;
            
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                
                if ((!filterGrade || question.grade === filterGrade) && 
                    (!filterSection || question.section === filterSection) &&
                    (!filterSubject || question.subject === filterSubject) &&
                    (!filterType || question.type === filterType)) {
                    
                    hasQuestions = true;
                    const gradeName = grades.find(g => g.id === question.grade)?.name || question.grade;
                    const sectionName = sections.find(s => s.id === question.section)?.name || question.section;
                    const subjectName = subjects.find(s => s.id === question.subject)?.name || question.subject || 'عام';
                    const lessonName = lessons.find(l => l.id === question.lesson)?.name || '';
                    const sublessonName = sublessons.find(s => s.id === question.sublesson)?.name || '';
                    
                    const questionItem = document.createElement('div');
                    questionItem.className = 'question-item';
                    questionItem.innerHTML = `
                        <h4>${question.text}</h4>
                        <div class="question-meta">
                            <span><i class="fas fa-graduation-cap"></i> ${gradeName}</span>
                            <span><i class="fas fa-layer-group"></i> ${sectionName}</span>
                            <span><i class="fas fa-book"></i> ${subjectName}</span>
                            ${lessonName ? `<span><i class="fas fa-book-open"></i> ${lessonName}</span>` : ''}
                            ${sublessonName ? `<span><i class="fas fa-folder"></i> ${sublessonName}</span>` : ''}
                            <span><i class="fas fa-${question.type === 'mcq' ? 'list' : 'check'}"></i> ${question.type === 'mcq' ? 'اختيار من متعدد' : 'صح أم خطأ'}</span>
                        </div>
                        <div class="options-list">
                            ${question.type === 'mcq' ? `
                                <div class="option-item ${question.correctAnswer === '1' ? 'correct-option' : ''}">1. ${question.option1}</div>
                                <div class="option-item ${question.correctAnswer === '2' ? 'correct-option' : ''}">2. ${question.option2}</div>
                                ${question.option3 ? `<div class="option-item ${question.correctAnswer === '3' ? 'correct-option' : ''}">3. ${question.option3}</div>` : ''}
                                ${question.option4 ? `<div class="option-item ${question.correctAnswer === '4' ? 'correct-option' : ''}">4. ${question.option4}</div>` : ''}
                            ` : `
                                <div class="option-item ${question.correctAnswer === 'true' ? 'correct-option' : ''}">${question.correctAnswer === 'true' ? 'صح' : 'خطأ'}</div>
                            `}
                        </div>
                        <div class="question-actions">
                            <button class="btn-admin btn-admin-warning btn-sm" onclick="editQuestion('${question.id}')">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteQuestion('${question.id}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    `;
                    
                    elements.allQuestionsList.appendChild(questionItem);
                }
            });
            
            if (!hasQuestions) {
                elements.allQuestionsList.innerHTML = `
                    <div class="no-questions">
                        <i class="fas fa-info-circle"></i>
                        <h3>لا توجد أسئلة متطابقة مع معايير التصفية</h3>
                        <p>حاول تغيير معايير التصفية أو أضف أسئلة جديدة.</p>
                    </div>
                `;
            }
        }, (error) => {
            console.error('خطأ في تحميل الأسئلة للإدارة:', error);
            showError('حدث خطأ في تحميل الأسئلة للإدارة');
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأسئلة للإدارة:', error);
        showError('حدث خطأ في تحميل الأسئلة للإدارة');
    }
}

// إضافة سؤال جديد
function addNewQuestion() {
    try {
        const questionText = document.getElementById('question-text').value.trim();
        const questionType = document.getElementById('question-type').value;
        const category = document.getElementById('question-category').value.trim();
        const difficulty = document.getElementById('question-difficulty').value;
        const grade = document.getElementById('question-grade').value;
        const section = document.getElementById('question-section').value;
        const subject = document.getElementById('question-subject').value;
        const lesson = document.getElementById('question-lesson').value;
        const sublesson = document.getElementById('question-sublesson').value;
        
        if (!questionText) {
            alert('الرجاء إدخال نص السؤال');
            return;
        }
        
        if (!grade) {
            alert('الرجاء اختيار الصف');
            return;
        }
        
        if (!section) {
            alert('الرجاء اختيار قسم');
            return;
        }
        
        let correctAnswer;
        let questionData = {
            text: questionText,
            type: questionType,
            category: category || '',
            difficulty,
            grade,
            section,
            subject: subject || '',
            lesson: lesson || '',
            sublesson: sublesson || '',
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        if (questionType === 'mcq') {
            correctAnswer = document.getElementById('correct-answer').value;
            
            for (let i = 1; i <= 4; i++) {
                const optionValue = document.getElementById(`option${i}`).value.trim();
                if (optionValue) {
                    questionData[`option${i}`] = optionValue;
                }
            }
            
            if (!questionData.option1 || !questionData.option2) {
                alert('الرجاء إدخال خيارين على الأقل');
                return;
            }
        } else {
            correctAnswer = document.getElementById('tf-correct-answer').value;
        }
        
        questionData.correctAnswer = correctAnswer;
        
        const questionsRef = database.ref(DB.questions);
        questionsRef.push(questionData)
            .then(() => {
                alert('تمت إضافة السؤال بنجاح');
                
                document.getElementById('question-text').value = '';
                document.getElementById('question-category').value = '';
                for (let i = 1; i <= 4; i++) {
                    document.getElementById(`option${i}`).value = '';
                }
                document.getElementById('question-lesson').value = '';
                document.getElementById('question-sublesson').value = '';
                
                loadAllQuestions();
                createAutoBackup();
                
                // تسجيل نشاط إضافة سؤال
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_question', 'أضاف سؤال جديد', {
                        questionText: questionText.substring(0, 50)
                    });
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة السؤال: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة سؤال جديد:', error);
        alert('حدث خطأ أثناء إضافة السؤال');
    }
}

// حذف سؤال
function deleteQuestion(questionId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            database.ref(DB.questions + '/' + questionId).remove()
                .then(() => {
                    alert('تم حذف السؤال بنجاح');
                    loadAllQuestions();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف سؤال
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_question', 'حذف سؤال');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف السؤال: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف السؤال:', error);
        alert('حدث خطأ أثناء حذف السؤال');
    }
}

// تعديل سؤال
function editQuestion(questionId) {
    try {
        const questionsRef = database.ref(DB.questions + '/' + questionId);
        questionsRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const question = snapshot.val();
                
                const editModal = document.createElement('div');
                editModal.className = 'edit-modal';
                editModal.id = 'edit-question-modal';
                editModal.innerHTML = `
                    <div class="modal-box">
                        <h3><i class="fas fa-edit"></i> تعديل السؤال</h3>
                        
                        <div class="form-group">
                            <label for="edit-question-text">نص السؤال:</label>
                            <textarea id="edit-question-text" class="form-control" rows="3">${question.text}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-type">نوع السؤال:</label>
                            <select id="edit-question-type" class="form-control">
                                <option value="mcq" ${question.type === 'mcq' ? 'selected' : ''}>اختيار من متعدد</option>
                                <option value="truefalse" ${question.type === 'truefalse' ? 'selected' : ''}>صح أم خطأ</option>
                            </select>
                        </div>
                        
                        <div id="edit-mcq-options" style="${question.type === 'mcq' ? 'display: block;' : 'display: none;'}">
                            <div class="edit-options-grid">
                                <div class="edit-option-item">
                                    <label>الخيار الأول:</label>
                                    <input type="text" id="edit-option1" class="form-control" value="${question.option1 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="1" ${question.correctAnswer === '1' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
                                <div class="edit-option-item">
                                    <label>الخيار الثاني:</label>
                                    <input type="text" id="edit-option2" class="form-control" value="${question.option2 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="2" ${question.correctAnswer === '2' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
                                ${question.option3 ? `
                                <div class="edit-option-item">
                                    <label>الخيار الثالث:</label>
                                    <input type="text" id="edit-option3" class="form-control" value="${question.option3 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="3" ${question.correctAnswer === '3' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
                                ` : ''}
                                ${question.option4 ? `
                                <div class="edit-option-item">
                                    <label>الخيار الرابع:</label>
                                    <input type="text" id="edit-option4" class="form-control" value="${question.option4 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="4" ${question.correctAnswer === '4' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div id="edit-truefalse-options" style="${question.type === 'truefalse' ? 'display: block;' : 'display: none;'}">
                            <div class="form-group">
                                <label for="edit-tf-correct-answer">الإجابة الصحيحة:</label>
                                <select id="edit-tf-correct-answer" class="form-control">
                                    <option value="true" ${question.correctAnswer === 'true' ? 'selected' : ''}>صح</option>
                                    <option value="false" ${question.correctAnswer === 'false' ? 'selected' : ''}>خطأ</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-grade">الصف الدراسي:</label>
                            <select id="edit-question-grade" class="form-control">
                                ${grades.map(grade => `
                                    <option value="${grade.id}" ${question.grade === grade.id ? 'selected' : ''}>${grade.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-section">القسم:</label>
                            <select id="edit-question-section" class="form-control">
                                ${sections.map(section => `
                                    <option value="${section.id}" ${question.section === section.id ? 'selected' : ''}>${section.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-subject">المادة الدراسية:</label>
                            <select id="edit-question-subject" class="form-control">
                                <option value="">اختر المادة</option>
                                ${subjects.map(subject => `
                                    <option value="${subject.id}" ${question.subject === subject.id ? 'selected' : ''}>${subject.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="modal-buttons">
                            <button class="btn-admin" id="save-edit-btn">
                                <i class="fas fa-save"></i> حفظ التعديلات
                            </button>
                            <button class="btn btn-secondary" id="cancel-edit-btn">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(editModal);
                editModal.style.display = 'flex';
                elements.overlay.classList.add('active');
                
                const editQuestionType = editModal.querySelector('#edit-question-type');
                const editMcqOptions = editModal.querySelector('#edit-mcq-options');
                const editTruefalseOptions = editModal.querySelector('#edit-truefalse-options');
                const saveEditBtn = editModal.querySelector('#save-edit-btn');
                const cancelEditBtn = editModal.querySelector('#cancel-edit-btn');
                
                editQuestionType.addEventListener('change', function() {
                    try {
                        if (this.value === 'mcq') {
                            editMcqOptions.style.display = 'block';
                            editTruefalseOptions.style.display = 'none';
                        } else {
                            editMcqOptions.style.display = 'none';
                            editTruefalseOptions.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('خطأ في تغيير نوع السؤال في التعديل:', error);
                    }
                });
                
                saveEditBtn.addEventListener('click', function() {
                    saveQuestionEdit(questionId, editModal);
                });
                
                cancelEditBtn.addEventListener('click', function() {
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                });
                
                editModal.addEventListener('click', function(e) {
                    if (e.target === editModal) {
                        document.body.removeChild(editModal);
                        elements.overlay.classList.remove('active');
                    }
                });
            } else {
                alert('لم يتم العثور على السؤال');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل السؤال:', error);
        alert('حدث خطأ في تعديل السؤال');
    }
}

// حفظ تعديل السؤال
function saveQuestionEdit(questionId, editModal) {
    try {
        const questionText = editModal.querySelector('#edit-question-text').value.trim();
        const questionType = editModal.querySelector('#edit-question-type').value;
        const grade = editModal.querySelector('#edit-question-grade').value;
        const section = editModal.querySelector('#edit-question-section').value;
        const subject = editModal.querySelector('#edit-question-subject').value;
        
        if (!questionText) {
            alert('الرجاء إدخال نص السؤال');
            return;
        }
        
        if (!grade) {
            alert('الرجاء اختيار الصف');
            return;
        }
        
        if (!section) {
            alert('الرجاء اختيار قسم');
            return;
        }
        
        let correctAnswer;
        let questionData = {
            text: questionText,
            type: questionType,
            grade,
            section,
            subject: subject || '',
            updatedBy: currentUser ? currentUser.id : 'system',
            updatedAt: new Date().toISOString()
        };
        
        if (questionType === 'mcq') {
            correctAnswer = editModal.querySelector('input[name="edit-correct-answer"]:checked')?.value;
            
            for (let i = 1; i <= 4; i++) {
                const optionValue = editModal.querySelector(`#edit-option${i}`)?.value.trim();
                if (optionValue) {
                    questionData[`option${i}`] = optionValue;
                }
            }
            
            if (!questionData.option1 || !questionData.option2) {
                alert('الرجاء إدخال خيارين على الأقل');
                return;
            }
            
            if (!correctAnswer) {
                alert('الرجاء تحديد الإجابة الصحيحة');
                return;
            }
        } else {
            correctAnswer = editModal.querySelector('#edit-tf-correct-answer').value;
        }
        
        questionData.correctAnswer = correctAnswer;
        
        database.ref(DB.questions + '/' + questionId).update(questionData)
            .then(() => {
                alert('تم تحديث السؤال بنجاح');
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
                loadAllQuestions();
                createAutoBackup();
                
                // تسجيل نشاط تعديل سؤال
                if (currentUser) {
                    addUserActivity(currentUser.id, 'edit_question', 'عدل سؤال');
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء تحديث السؤال: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في حفظ تعديل السؤال:', error);
        alert('حدث خطأ أثناء حفظ التعديلات');
    }
}

// =============================================
// دوال إدارة الصفوف
// =============================================

// عرض الصفوف في لوحة الإدارة
function loadGradesForAdmin() {
    try {
        const gradesList = document.getElementById('grades-list');
        if (!gradesList) return;
        
        gradesList.innerHTML = '';
        
        if (grades.length > 0) {
            grades.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            grades.forEach(grade => {
                const gradeItem = document.createElement('div');
                gradeItem.className = 'item-card';
                
                // عرض خصائص التصميم
                const designInfo = [];
                if (grade.borderRadius) designInfo.push(`الحواف: ${grade.borderRadius}`);
                if (grade.shadow) designInfo.push(`الظل: ${grade.shadow}`);
                if (grade.hoverEffect) designInfo.push(`التحويم: ${grade.hoverEffect}`);
                
                gradeItem.innerHTML = `
                    <h4><i class="fas ${grade.icon || 'fa-graduation-cap'}"></i> ${grade.name}</h4>
                    <div class="item-meta">
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${grade.order || 1}</span>
                        <span><i class="fas fa-paint-brush"></i> ${designInfo.join(' • ')}</span>
                    </div>
                    <p>${grade.description || ''}</p>
                    <div class="item-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editGrade('${grade.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteGrade('${grade.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                gradesList.appendChild(gradeItem);
            });
        } else {
            gradesList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد صفوف دراسية</h3>
                    <p>أضف صفوفاً جديدة من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الصفوف للإدارة:', error);
    }
}

// إضافة صف جديد مع حقول التصميم
function addNewGrade() {
    try {
        const gradeName = document.getElementById('new-grade-name').value.trim();
        const gradeDescription = document.getElementById('new-grade-description').value.trim();
        const gradeOrder = parseInt(document.getElementById('new-grade-order').value) || 1;
        const gradeIcon = document.getElementById('new-grade-icon').value;
        
        // حقول التصميم
        const borderRadius = document.getElementById('new-grade-border-radius').value;
        const shadow = document.getElementById('new-grade-shadow').value;
        const border = document.getElementById('new-grade-border').value;
        const hoverEffect = document.getElementById('new-grade-hover-effect').value;
        const padding = document.getElementById('new-grade-padding').value;
        const animation = document.getElementById('new-grade-animation').value;
        const bgStyle = document.getElementById('new-grade-bg-style').value;
        const textColor = document.getElementById('new-grade-text-color').value;
        const iconColor = document.getElementById('new-grade-icon-color').value;
        
        if (!gradeName) {
            alert('الرجاء إدخال اسم الصف');
            return;
        }
        
        const gradeData = {
            name: gradeName,
            description: gradeDescription,
            order: gradeOrder,
            icon: gradeIcon,
            borderRadius: borderRadius,
            shadow: shadow,
            border: border,
            hoverEffect: hoverEffect,
            padding: padding,
            animation: animation,
            bgStyle: bgStyle,
            textColor: textColor,
            iconColor: iconColor,
            createdBy: currentUser ? currentUser.id : 'system',
            createdAt: new Date().toISOString()
        };
        
        const gradesRef = database.ref(DB.grades);
        gradesRef.push(gradeData)
            .then(() => {
                alert('تمت إضافة الصف بنجاح');
                
                document.getElementById('new-grade-name').value = '';
                document.getElementById('new-grade-description').value = '';
                document.getElementById('new-grade-order').value = '1';
                
                loadGradesForAdmin();
                createAutoBackup();
                
                // تسجيل نشاط إضافة صف
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_grade', 'أضاف صف جديد: ' + gradeName);
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة الصف: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة صف جديد:', error);
        alert('حدث خطأ أثناء إضافة الصف');
    }
}

// تعديل صف
function editGrade(gradeId) {
    try {
        const grade = grades.find(g => g.id === gradeId);
        if (!grade) {
            alert('لم يتم العثور على الصف');
            return;
        }
        
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.id = 'edit-grade-modal';
        editModal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fas fa-edit"></i> تعديل الصف</h3>
                
                <div class="form-group">
                    <label for="edit-grade-name">اسم الصف:</label>
                    <input type="text" id="edit-grade-name" class="form-control" value="${grade.name}">
                </div>
                
                <div class="form-group">
                    <label for="edit-grade-description">وصف الصف:</label>
                    <textarea id="edit-grade-description" class="form-control">${grade.description || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-grade-icon">أيقونة الصف:</label>
                        <select id="edit-grade-icon" class="form-control">
                            <option value="fa-graduation-cap" ${grade.icon === 'fa-graduation-cap' ? 'selected' : ''}>قبعة تخرج</option>
                            <option value="fa-book" ${grade.icon === 'fa-book' ? 'selected' : ''}>كتاب</option>
                            <option value="fa-school" ${grade.icon === 'fa-school' ? 'selected' : ''}>مدرسة</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-grade-order">ترتيب الصف:</label>
                        <input type="number" id="edit-grade-order" class="form-control" value="${grade.order || 1}" min="1">
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-admin" id="save-grade-edit-btn">
                        <i class="fas fa-save"></i> حفظ التعديلات
                    </button>
                    <button class="btn btn-secondary" id="cancel-grade-edit-btn">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        const saveBtn = editModal.querySelector('#save-grade-edit-btn');
        const cancelBtn = editModal.querySelector('#cancel-grade-edit-btn');
        
        saveBtn.addEventListener('click', function() {
            const gradeName = editModal.querySelector('#edit-grade-name').value.trim();
            const gradeDescription = editModal.querySelector('#edit-grade-description').value.trim();
            const gradeIcon = editModal.querySelector('#edit-grade-icon').value;
            const gradeOrder = parseInt(editModal.querySelector('#edit-grade-order').value) || 1;
            
            if (!gradeName) {
                alert('الرجاء إدخال اسم الصف');
                return;
            }
            
            const gradeData = {
                name: gradeName,
                description: gradeDescription,
                icon: gradeIcon,
                order: gradeOrder,
                updatedBy: currentUser ? currentUser.id : 'system',
                updatedAt: new Date().toISOString()
            };
            
            database.ref(DB.grades + '/' + gradeId).update(gradeData)
                .then(() => {
                    alert('تم تحديث الصف بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadGradesForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط تعديل صف
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'edit_grade', 'عدل صف: ' + gradeName);
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء تحديث الصف: ' + error.message);
                });
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(editModal);
            elements.overlay.classList.remove('active');
        });
        
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل الصف:', error);
        alert('حدث خطأ في تعديل الصف');
    }
}

// حذف صف
function deleteGrade(gradeId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا الصف؟ سيتم حذف جميع الأقسام والأسئلة المرتبطة به.')) {
            database.ref(DB.grades + '/' + gradeId).remove()
                .then(() => {
                    alert('تم حذف الصف بنجاح');
                    loadGradesForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف صف
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_grade', 'حذف صف');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف الصف: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف الصف:', error);
        alert('حدث خطأ أثناء حذف الصف');
    }
}

// =============================================
// دوال إدارة الأقسام
// =============================================

// عرض الأقسام في لوحة الإدارة
function loadSectionsForAdmin() {
    try {
        const sectionsList = document.getElementById('sections-list');
        if (!sectionsList) return;
        
        sectionsList.innerHTML = '';
        
        if (sections.length > 0) {
            sections.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            sections.forEach(section => {
                const gradeNames = section.grades ? 
                    section.grades.map(g => grades.find(grade => grade.id === g)?.name || g).join('، ') : 
                    'لم يتم تحديد صفوف';
                
                const sectionItem = document.createElement('div');
                sectionItem.className = 'item-card';
                
                sectionItem.innerHTML = `
                    <h4><i class="fas ${section.icon || 'fa-layer-group'}"></i> ${section.name}</h4>
                    <div class="item-meta">
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${section.order || 1}</span>
                        <span><i class="fas fa-graduation-cap"></i> الصفوف: ${gradeNames}</span>
                    </div>
                    <p>${section.description || ''}</p>
                    <div class="item-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editSection('${section.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSection('${section.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                sectionsList.appendChild(sectionItem);
            });
        } else {
            sectionsList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد أقسام</h3>
                    <p>أضف أقساماً جديدة من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الأقسام للإدارة:', error);
    }
}

// إضافة قسم جديد
function addNewSection() {
    try {
        const sectionName = elements.newSectionName.value.trim();
        const sectionDescription = elements.newSectionDescription.value.trim();
        const sectionOrder = parseInt(elements.newSectionOrder.value) || 1;
        
        const selectedGrades = Array.from(document.querySelectorAll('input[name="section-grades"]:checked')).map(cb => cb.value);
        
        if (!sectionName) {
            alert('الرجاء إدخال اسم القسم');
            return;
        }
        
        if (selectedGrades.length === 0) {
            alert('الرجاء اختيار صف واحد على الأقل');
            return;
        }
        
        const sectionData = {
            name: sectionName,
            description: sectionDescription,
            order: sectionOrder,
            grades: selectedGrades,
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        const sectionsRef = database.ref(DB.sections);
        sectionsRef.push(sectionData)
            .then(() => {
                alert('تمت إضافة القسم بنجاح');
                
                elements.newSectionName.value = '';
                elements.newSectionDescription.value = '';
                elements.newSectionOrder.value = '1';
                document.querySelectorAll('input[name="section-grades"]').forEach(cb => cb.checked = false);
                
                loadSectionsForAdmin();
                createAutoBackup();
                
                // تسجيل نشاط إضافة قسم
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_section', 'أضاف قسم جديد: ' + sectionName);
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة القسم: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة قسم جديد:', error);
        alert('حدث خطأ أثناء إضافة القسم');
    }
}

// تعديل قسم
function editSection(sectionId) {
    try {
        const section = sections.find(s => s.id === sectionId);
        if (!section) {
            alert('لم يتم العثور على القسم');
            return;
        }
        
        const gradeCheckboxes = grades.map(grade => {
            const checked = section.grades && section.grades.includes(grade.id) ? 'checked' : '';
            return `<label><input type="checkbox" name="edit-section-grades" value="${grade.id}" ${checked}> ${grade.name}</label>`;
        }).join('');
        
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.id = 'edit-section-modal';
        editModal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fas fa-edit"></i> تعديل القسم</h3>
                
                <div class="form-group">
                    <label for="edit-section-name">اسم القسم:</label>
                    <input type="text" id="edit-section-name" class="form-control" value="${section.name}">
                </div>
                
                <div class="form-group">
                    <label for="edit-section-description">وصف القسم:</label>
                    <textarea id="edit-section-description" class="form-control">${section.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-section-order">ترتيب القسم:</label>
                    <input type="number" id="edit-section-order" class="form-control" value="${section.order || 1}" min="1">
                </div>
                
                <div class="form-group">
                    <label>الصفوف المرتبطة:</label>
                    <div class="grades-checkboxes">
                        ${gradeCheckboxes}
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-admin" id="save-section-edit-btn">
                        <i class="fas fa-save"></i> حفظ التعديلات
                    </button>
                    <button class="btn btn-secondary" id="cancel-section-edit-btn">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        const saveBtn = editModal.querySelector('#save-section-edit-btn');
        const cancelBtn = editModal.querySelector('#cancel-section-edit-btn');
        
        saveBtn.addEventListener('click', function() {
            const sectionName = editModal.querySelector('#edit-section-name').value.trim();
            const sectionDescription = editModal.querySelector('#edit-section-description').value.trim();
            const sectionOrder = parseInt(editModal.querySelector('#edit-section-order').value) || 1;
            const selectedGrades = Array.from(editModal.querySelectorAll('input[name="edit-section-grades"]:checked')).map(cb => cb.value);
            
            if (!sectionName) {
                alert('الرجاء إدخال اسم القسم');
                return;
            }
            
            if (selectedGrades.length === 0) {
                alert('الرجاء اختيار صف واحد على الأقل');
                return;
            }
            
            const sectionData = {
                name: sectionName,
                description: sectionDescription,
                order: sectionOrder,
                grades: selectedGrades,
                updatedBy: currentUser ? currentUser.id : 'system',
                updatedAt: new Date().toISOString()
            };
            
            database.ref(DB.sections + '/' + sectionId).update(sectionData)
                .then(() => {
                    alert('تم تحديث القسم بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSectionsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط تعديل قسم
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'edit_section', 'عدل قسم: ' + sectionName);
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء تحديث القسم: ' + error.message);
                });
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(editModal);
            elements.overlay.classList.remove('active');
        });
        
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل القسم:', error);
        alert('حدث خطأ في تعديل القسم');
    }
}

// حذف قسم
function deleteSection(sectionId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المواد والأسئلة المرتبطة به.')) {
            database.ref(DB.sections + '/' + sectionId).remove()
                .then(() => {
                    alert('تم حذف القسم بنجاح');
                    loadSectionsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف قسم
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_section', 'حذف قسم');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف القسم: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        alert('حدث خطأ أثناء حذف القسم');
    }
}

// =============================================
// دوال إدارة المواد
// =============================================

// عرض المواد في لوحة الإدارة
function loadSubjectsForAdmin() {
    try {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        subjectsList.innerHTML = '';
        
        if (subjects.length > 0) {
            subjects.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            subjects.forEach(subject => {
                const sectionName = sections.find(s => s.id === subject.sectionId)?.name || subject.sectionId;
                
                const subjectItem = document.createElement('div');
                subjectItem.className = 'item-card';
                
                subjectItem.innerHTML = `
                    <h4><i class="fas ${subject.icon || 'fa-book'}"></i> ${subject.name}</h4>
                    <div class="item-meta">
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${subject.order || 1}</span>
                        <span><i class="fas fa-layer-group"></i> ${sectionName}</span>
                    </div>
                    <p>${subject.description || ''}</p>
                    <div class="item-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editSubject('${subject.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSubject('${subject.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                subjectsList.appendChild(subjectItem);
            });
        } else {
            subjectsList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد مواد</h3>
                    <p>أضف مواداً جديدة من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل المواد للإدارة:', error);
    }
}

// إضافة مادة جديدة
function addNewSubject() {
    try {
        const subjectName = elements.newSubjectName.value.trim();
        const subjectDescription = elements.newSubjectDescription.value.trim();
        const subjectOrder = parseInt(elements.newSubjectOrder.value) || 1;
        const subjectSection = elements.newSubjectSection.value;
        
        if (!subjectName) {
            alert('الرجاء إدخال اسم المادة');
            return;
        }
        
        if (!subjectSection) {
            alert('الرجاء اختيار قسم');
            return;
        }
        
        const subjectData = {
            name: subjectName,
            description: subjectDescription,
            order: subjectOrder,
            sectionId: subjectSection,
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        const subjectsRef = database.ref(DB.subjects);
        subjectsRef.push(subjectData)
            .then(() => {
                alert('تمت إضافة المادة بنجاح');
                
                elements.newSubjectName.value = '';
                elements.newSubjectDescription.value = '';
                elements.newSubjectOrder.value = '1';
                
                loadSubjectsForAdmin();
                createAutoBackup();
                
                // تسجيل نشاط إضافة مادة
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_subject', 'أضاف مادة جديدة: ' + subjectName);
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة المادة: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة مادة جديدة:', error);
        alert('حدث خطأ أثناء إضافة المادة');
    }
}

// تعديل مادة
function editSubject(subjectId) {
    try {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) {
            alert('لم يتم العثور على المادة');
            return;
        }
        
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.id = 'edit-subject-modal';
        editModal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fas fa-edit"></i> تعديل المادة</h3>
                
                <div class="form-group">
                    <label for="edit-subject-name">اسم المادة:</label>
                    <input type="text" id="edit-subject-name" class="form-control" value="${subject.name}">
                </div>
                
                <div class="form-group">
                    <label for="edit-subject-description">وصف المادة:</label>
                    <textarea id="edit-subject-description" class="form-control">${subject.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-subject-section">القسم التابع له:</label>
                    <select id="edit-subject-section" class="form-control">
                        ${sections.map(section => `
                            <option value="${section.id}" ${subject.sectionId === section.id ? 'selected' : ''}>${section.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="edit-subject-order">ترتيب المادة:</label>
                    <input type="number" id="edit-subject-order" class="form-control" value="${subject.order || 1}" min="1">
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-admin" id="save-subject-edit-btn">
                        <i class="fas fa-save"></i> حفظ التعديلات
                    </button>
                    <button class="btn btn-secondary" id="cancel-subject-edit-btn">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        const saveBtn = editModal.querySelector('#save-subject-edit-btn');
        const cancelBtn = editModal.querySelector('#cancel-subject-edit-btn');
        
        saveBtn.addEventListener('click', function() {
            const subjectName = editModal.querySelector('#edit-subject-name').value.trim();
            const subjectDescription = editModal.querySelector('#edit-subject-description').value.trim();
            const subjectSection = editModal.querySelector('#edit-subject-section').value;
            const subjectOrder = parseInt(editModal.querySelector('#edit-subject-order').value) || 1;
            
            if (!subjectName) {
                alert('الرجاء إدخال اسم المادة');
                return;
            }
            
            if (!subjectSection) {
                alert('الرجاء اختيار قسم');
                return;
            }
            
            const subjectData = {
                name: subjectName,
                description: subjectDescription,
                sectionId: subjectSection,
                order: subjectOrder,
                updatedBy: currentUser ? currentUser.id : 'system',
                updatedAt: new Date().toISOString()
            };
            
            database.ref(DB.subjects + '/' + subjectId).update(subjectData)
                .then(() => {
                    alert('تم تحديث المادة بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSubjectsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط تعديل مادة
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'edit_subject', 'عدل مادة: ' + subjectName);
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء تحديث المادة: ' + error.message);
                });
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(editModal);
            elements.overlay.classList.remove('active');
        });
        
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل المادة:', error);
        alert('حدث خطأ في تعديل المادة');
    }
}

// حذف مادة
function deleteSubject(subjectId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الأسئلة المرتبطة بها.')) {
            database.ref(DB.subjects + '/' + subjectId).remove()
                .then(() => {
                    alert('تم حذف المادة بنجاح');
                    loadSubjectsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف مادة
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_subject', 'حذف مادة');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف المادة: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف المادة:', error);
        alert('حدث خطأ أثناء حذف المادة');
    }
}

// =============================================
// دوال إدارة الدروس
// =============================================

// عرض الدروس في لوحة الإدارة
function loadLessonsForAdmin() {
    try {
        const lessonsList = document.getElementById('lessons-list');
        if (!lessonsList) return;
        
        lessonsList.innerHTML = '';
        
        if (lessons.length > 0) {
            lessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            lessons.forEach(lesson => {
                const subjectName = subjects.find(s => s.id === lesson.subjectId)?.name || lesson.subjectId;
                
                const lessonItem = document.createElement('div');
                lessonItem.className = 'item-card';
                
                lessonItem.innerHTML = `
                    <h4><i class="fas ${lesson.icon || 'fa-book-open'}"></i> ${lesson.name}</h4>
                    <div class="item-meta">
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${lesson.order || 1}</span>
                        <span><i class="fas fa-book"></i> ${subjectName}</span>
                    </div>
                    <p>${lesson.description || ''}</p>
                    <div class="item-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editLesson('${lesson.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteLesson('${lesson.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                lessonsList.appendChild(lessonItem);
            });
        } else {
            lessonsList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد دروس</h3>
                    <p>أضف دروساً جديدة من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الدروس للإدارة:', error);
    }
}

// إضافة درس جديد
function addNewLesson() {
    try {
        const lessonName = elements.newLessonName.value.trim();
        const lessonDescription = elements.newLessonDescription.value.trim();
        const lessonOrder = parseInt(elements.newLessonOrder.value) || 1;
        const lessonSubject = elements.newLessonSubject.value;
        
        if (!lessonName) {
            alert('الرجاء إدخال اسم الدرس');
            return;
        }
        
        if (!lessonSubject) {
            alert('الرجاء اختيار المادة');
            return;
        }
        
        const lessonData = {
            name: lessonName,
            description: lessonDescription,
            order: lessonOrder,
            subjectId: lessonSubject,
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        const lessonsRef = database.ref(DB.lessons);
        lessonsRef.push(lessonData)
            .then(() => {
                alert('تمت إضافة الدرس بنجاح');
                
                elements.newLessonName.value = '';
                elements.newLessonDescription.value = '';
                elements.newLessonOrder.value = '1';
                
                loadLessonsForAdmin();
                createAutoBackup();
                
                // تسجيل نشاط إضافة درس
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_lesson', 'أضاف درس جديد: ' + lessonName);
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة الدرس: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة درس جديد:', error);
        alert('حدث خطأ أثناء إضافة الدرس');
    }
}

// تعديل درس
function editLesson(lessonId) {
    try {
        const lesson = lessons.find(l => l.id === lessonId);
        if (!lesson) {
            alert('لم يتم العثور على الدرس');
            return;
        }
        
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.id = 'edit-lesson-modal';
        editModal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fas fa-edit"></i> تعديل الدرس</h3>
                
                <div class="form-group">
                    <label for="edit-lesson-name">اسم الدرس:</label>
                    <input type="text" id="edit-lesson-name" class="form-control" value="${lesson.name}">
                </div>
                
                <div class="form-group">
                    <label for="edit-lesson-description">وصف الدرس:</label>
                    <textarea id="edit-lesson-description" class="form-control">${lesson.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-lesson-subject">المادة التابع لها:</label>
                    <select id="edit-lesson-subject" class="form-control">
                        ${subjects.map(subject => `
                            <option value="${subject.id}" ${lesson.subjectId === subject.id ? 'selected' : ''}>${subject.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="edit-lesson-order">ترتيب الدرس:</label>
                    <input type="number" id="edit-lesson-order" class="form-control" value="${lesson.order || 1}" min="1">
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-admin" id="save-lesson-edit-btn">
                        <i class="fas fa-save"></i> حفظ التعديلات
                    </button>
                    <button class="btn btn-secondary" id="cancel-lesson-edit-btn">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        const saveBtn = editModal.querySelector('#save-lesson-edit-btn');
        const cancelBtn = editModal.querySelector('#cancel-lesson-edit-btn');
        
        saveBtn.addEventListener('click', function() {
            const lessonName = editModal.querySelector('#edit-lesson-name').value.trim();
            const lessonDescription = editModal.querySelector('#edit-lesson-description').value.trim();
            const lessonSubject = editModal.querySelector('#edit-lesson-subject').value;
            const lessonOrder = parseInt(editModal.querySelector('#edit-lesson-order').value) || 1;
            
            if (!lessonName) {
                alert('الرجاء إدخال اسم الدرس');
                return;
            }
            
            if (!lessonSubject) {
                alert('الرجاء اختيار المادة');
                return;
            }
            
            const lessonData = {
                name: lessonName,
                description: lessonDescription,
                subjectId: lessonSubject,
                order: lessonOrder,
                updatedBy: currentUser ? currentUser.id : 'system',
                updatedAt: new Date().toISOString()
            };
            
            database.ref(DB.lessons + '/' + lessonId).update(lessonData)
                .then(() => {
                    alert('تم تحديث الدرس بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadLessonsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط تعديل درس
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'edit_lesson', 'عدل درس: ' + lessonName);
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء تحديث الدرس: ' + error.message);
                });
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(editModal);
            elements.overlay.classList.remove('active');
        });
        
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل الدرس:', error);
        alert('حدث خطأ في تعديل الدرس');
    }
}

// حذف درس
function deleteLesson(lessonId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف جميع الأسئلة المرتبطة به.')) {
            database.ref(DB.lessons + '/' + lessonId).remove()
                .then(() => {
                    alert('تم حذف الدرس بنجاح');
                    loadLessonsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف درس
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_lesson', 'حذف درس');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف الدرس: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف الدرس:', error);
        alert('حدث خطأ أثناء حذف الدرس');
    }
}

// =============================================
// دوال إدارة الأقسام الفرعية
// =============================================

// عرض الأقسام الفرعية في لوحة الإدارة
function loadSublessonsForAdmin() {
    try {
        const sublessonsList = document.getElementById('sublessons-list');
        if (!sublessonsList) return;
        
        sublessonsList.innerHTML = '';
        
        if (sublessons.length > 0) {
            sublessons.sort((a, b) => (a.order || 999) - (b.order || 999));
            
            sublessons.forEach(sublesson => {
                const lessonName = lessons.find(l => l.id === sublesson.lessonId)?.name || sublesson.lessonId;
                
                const sublessonItem = document.createElement('div');
                sublessonItem.className = 'item-card';
                
                sublessonItem.innerHTML = `
                    <h4><i class="fas ${sublesson.icon || 'fa-folder'}"></i> ${sublesson.name}</h4>
                    <div class="item-meta">
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${sublesson.order || 1}</span>
                        <span><i class="fas fa-book-open"></i> ${lessonName}</span>
                    </div>
                    <p>${sublesson.description || ''}</p>
                    <div class="item-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editSublesson('${sublesson.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSublesson('${sublesson.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                sublessonsList.appendChild(sublessonItem);
            });
        } else {
            sublessonsList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد أقسام فرعية</h3>
                    <p>أضف أقساماً فرعية جديدة من النموذج أعلاه.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل الأقسام الفرعية للإدارة:', error);
    }
}

// إضافة قسم فرعي جديد
function addNewSublesson() {
    try {
        const sublessonName = elements.newSublessonName.value.trim();
        const sublessonDescription = elements.newSublessonDescription.value.trim();
        const sublessonOrder = parseInt(elements.newSublessonOrder.value) || 1;
        const sublessonLesson = elements.newSublessonLesson.value;
        
        if (!sublessonName) {
            alert('الرجاء إدخال اسم القسم الفرعي');
            return;
        }
        
        if (!sublessonLesson) {
            alert('الرجاء اختيار الدرس');
            return;
        }
        
        const sublessonData = {
            name: sublessonName,
            description: sublessonDescription,
            order: sublessonOrder,
            lessonId: sublessonLesson,
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        const sublessonsRef = database.ref(DB.sublessons);
        sublessonsRef.push(sublessonData)
            .then(() => {
                alert('تمت إضافة القسم الفرعي بنجاح');
                
                elements.newSublessonName.value = '';
                elements.newSublessonDescription.value = '';
                elements.newSublessonOrder.value = '1';
                
                loadSublessonsForAdmin();
                createAutoBackup();
                
                // تسجيل نشاط إضافة قسم فرعي
                if (currentUser) {
                    addUserActivity(currentUser.id, 'add_sublesson', 'أضاف قسم فرعي جديد: ' + sublessonName);
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة القسم الفرعي: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة قسم فرعي جديد:', error);
        alert('حدث خطأ أثناء إضافة القسم الفرعي');
    }
}

// تعديل قسم فرعي
function editSublesson(sublessonId) {
    try {
        const sublesson = sublessons.find(s => s.id === sublessonId);
        if (!sublesson) {
            alert('لم يتم العثور على القسم الفرعي');
            return;
        }
        
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.id = 'edit-sublesson-modal';
        editModal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fas fa-edit"></i> تعديل القسم الفرعي</h3>
                
                <div class="form-group">
                    <label for="edit-sublesson-name">اسم القسم الفرعي:</label>
                    <input type="text" id="edit-sublesson-name" class="form-control" value="${sublesson.name}">
                </div>
                
                <div class="form-group">
                    <label for="edit-sublesson-description">وصف القسم الفرعي:</label>
                    <textarea id="edit-sublesson-description" class="form-control">${sublesson.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-sublesson-lesson">الدرس التابع له:</label>
                    <select id="edit-sublesson-lesson" class="form-control">
                        ${lessons.map(lesson => `
                            <option value="${lesson.id}" ${sublesson.lessonId === lesson.id ? 'selected' : ''}>${lesson.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="edit-sublesson-order">ترتيب القسم الفرعي:</label>
                    <input type="number" id="edit-sublesson-order" class="form-control" value="${sublesson.order || 1}" min="1">
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-admin" id="save-sublesson-edit-btn">
                        <i class="fas fa-save"></i> حفظ التعديلات
                    </button>
                    <button class="btn btn-secondary" id="cancel-sublesson-edit-btn">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        const saveBtn = editModal.querySelector('#save-sublesson-edit-btn');
        const cancelBtn = editModal.querySelector('#cancel-sublesson-edit-btn');
        
        saveBtn.addEventListener('click', function() {
            const sublessonName = editModal.querySelector('#edit-sublesson-name').value.trim();
            const sublessonDescription = editModal.querySelector('#edit-sublesson-description').value.trim();
            const sublessonLesson = editModal.querySelector('#edit-sublesson-lesson').value;
            const sublessonOrder = parseInt(editModal.querySelector('#edit-sublesson-order').value) || 1;
            
            if (!sublessonName) {
                alert('الرجاء إدخال اسم القسم الفرعي');
                return;
            }
            
            if (!sublessonLesson) {
                alert('الرجاء اختيار الدرس');
                return;
            }
            
            const sublessonData = {
                name: sublessonName,
                description: sublessonDescription,
                lessonId: sublessonLesson,
                order: sublessonOrder,
                updatedBy: currentUser ? currentUser.id : 'system',
                updatedAt: new Date().toISOString()
            };
            
            database.ref(DB.sublessons + '/' + sublessonId).update(sublessonData)
                .then(() => {
                    alert('تم تحديث القسم الفرعي بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSublessonsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط تعديل قسم فرعي
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'edit_sublesson', 'عدل قسم فرعي: ' + sublessonName);
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء تحديث القسم الفرعي: ' + error.message);
                });
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(editModal);
            elements.overlay.classList.remove('active');
        });
        
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('خطأ في تعديل القسم الفرعي:', error);
        alert('حدث خطأ في تعديل القسم الفرعي');
    }
}

// حذف قسم فرعي
function deleteSublesson(sublessonId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا القسم الفرعي؟ سيتم حذف جميع الأسئلة المرتبطة به.')) {
            database.ref(DB.sublessons + '/' + sublessonId).remove()
                .then(() => {
                    alert('تم حذف القسم الفرعي بنجاح');
                    loadSublessonsForAdmin();
                    createAutoBackup();
                    
                    // تسجيل نشاط حذف قسم فرعي
                    if (currentUser) {
                        addUserActivity(currentUser.id, 'delete_sublesson', 'حذف قسم فرعي');
                    }
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف القسم الفرعي: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف القسم الفرعي:', error);
        alert('حدث خطأ أثناء حذف القسم الفرعي');
    }
}

// =============================================
// دوال إعدادات النظام
// =============================================

// حفظ إعدادات النظام
function saveSystemSettings() {
    try {
        const examTime = parseInt(elements.examTime.value);
        const examActive = elements.examStatus.checked;
        
        if (!examTime || examTime < 1) {
            alert('الرجاء إدخال مدة اختبار صحيحة');
            return;
        }
        
        const examStatusRef = database.ref('examStatus');
        examStatusRef.set({
            active: examActive,
            time: examTime,
            updatedBy: currentUser ? currentUser.id : 'system',
            updatedAt: new Date().toISOString()
        })
        .then(() => {
            alert('تم حفظ الإعدادات بنجاح');
            createAutoBackup();
            
            // تسجيل نشاط تعديل الإعدادات
            if (currentUser) {
                addUserActivity(currentUser.id, 'edit_settings', 'عدل إعدادات النظام');
            }
        })
        .catch(error => {
            alert('حدث خطأ أثناء حفظ الإعدادات: ' + error.message);
        });
    } catch (error) {
        console.error('خطأ في حفظ إعدادات النظام:', error);
        alert('حدث خطأ أثناء حفظ الإعدادات');
    }
}

// مراقبة حالة الاختبار
function checkExamStatus() {
    try {
        const examStatusRef = database.ref('examStatus');
        examStatusRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                examActive = snapshot.val().active;
                defaultExamTime = snapshot.val().time || 10;
                
                if (!examActive) {
                    elements.gradeSelectionContainer.innerHTML = `
                        <div class="no-questions" style="grid-column: 1 / -1;">
                            <i class="fas fa-exclamation-triangle"></i> 
                            <h3>الاختبارات متوقفة حالياً</h3>
                            <p>الرجاء المحاولة لاحقاً عندما يتم تفعيل الاختبارات من قبل المسؤول</p>
                        </div>
                    `;
                }
            } else {
                examStatusRef.set({
                    active: true,
                    time: 10
                });
            }
        }, (error) => {
            console.error('خطأ في مراقبة حالة الاختبار:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة مراقبة حالة الاختبار:', error);
    }
}

// =============================================
// دوال الإعلانات
// =============================================

// حفظ الإعلان
function saveAd() {
    try {
        const title = elements.adTitleInput.value.trim();
        const description = elements.adDescriptionInput.value.trim();
        const url = elements.adUrlInput.value.trim();
        const status = elements.adStatusInput.value;
        
        if (!title || !description) {
            alert('الرجاء إدخال عنوان ووصف الإعلان');
            return;
        }
        
        const adData = {
            title,
            description,
            url,
            status,
            createdBy: currentUser ? currentUser.id : 'system',
            createdByName: currentUser ? currentUser.name : 'النظام',
            createdAt: new Date().toISOString()
        };
        
        const adsRef = database.ref(DB.ads);
        adsRef.set(adData)
            .then(() => {
                alert('تم حفظ الإعلان بنجاح');
                
                localStorage.setItem('currentAd', JSON.stringify(adData));
                currentAd = adData;
                
                loadAd();
                createAutoBackup();
                
                // تسجيل نشاط تعديل الإعلان
                if (currentUser) {
                    addUserActivity(currentUser.id, 'edit_ad', 'عدل الإعلان');
                }
            })
            .catch(error => {
                alert('حدث خطأ أثناء حفظ الإعلان: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في حفظ الإعلان:', error);
        alert('حدث خطأ أثناء حفظ الإعلان');
    }
}

// تحديث معاينة الإعلان
function updateAdPreview() {
    try {
        const title = elements.adTitleInput.value || 'عنوان الإعلان';
        const description = elements.adDescriptionInput.value || 'وصف الإعلان سيظهر هنا';
        
        if (elements.previewAdTitle) elements.previewAdTitle.textContent = title;
        if (elements.previewAdDescription) elements.previewAdDescription.textContent = description;
    } catch (error) {
        console.error('خطأ في تحديث معاينة الإعلان:', error);
    }
}

// تحميل الإعلان
function loadAd() {
    try {
        const adsRef = database.ref(DB.ads);
        adsRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const ad = snapshot.val();
                if (ad.status === 'active') {
                    currentAd = ad;
                    localStorage.setItem('currentAd', JSON.stringify(ad));
                    displayAd(ad);
                    return;
                }
            }
            
            if (currentAd && currentAd.status === 'active') {
                displayAd(currentAd);
            }
        }, (error) => {
            console.error('خطأ في تحميل الإعلان:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الإعلان:', error);
    }
}

// عرض الإعلان
function displayAd(ad) {
    try {
        if (ad && ad.status === 'active') {
            if (elements.adTitle) elements.adTitle.textContent = ad.title;
            if (elements.adDescription) elements.adDescription.textContent = ad.description;
            if (elements.adContainer) elements.adContainer.style.display = 'block';
            
            if (elements.adTitleInput) {
                elements.adTitleInput.value = ad.title;
                elements.adDescriptionInput.value = ad.description;
                elements.adUrlInput.value = ad.url || '';
                elements.adStatusInput.value = ad.status;
                updateAdPreview();
            }
        }
    } catch (error) {
        console.error('خطأ في عرض الإعلان:', error);
    }
}

// =============================================
// دوال النسخ الاحتياطي
// =============================================

// النسخ الاحتياطي التلقائي
function createAutoBackup() {
    try {
        if (!autoBackupEnabled) return;
        
        console.log('جاري إنشاء نسخة احتياطية تلقائية...');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            grades: grades,
            sections: sections,
            subjects: subjects,
            lessons: lessons,
            sublessons: sublessons,
            admins: admins,
            siteStats: {
                totalVisits: siteStats.totalVisits,
                uniqueUsers: siteStats.uniqueUsers,
                dailyActiveUsers: siteStats.dailyActiveUsers,
                userSessions: siteStats.userSessions
            },
            appSettings: {
                examActive: examActive,
                defaultExamTime: defaultExamTime,
                isDarkMode: isDarkMode,
                autoBackupEnabled: autoBackupEnabled
            }
        };
        
        const questionsRef = database.ref(DB.questions);
        questionsRef.once('value', (snapshot) => {
            const questions = [];
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                questions.push(question);
            });
            
            backupData.questions = questions;
            
            const adsRef = database.ref(DB.ads);
            adsRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    backupData.ad = snapshot.val();
                }
                
                const resultsRef = database.ref(DB.quizResults);
                resultsRef.once('value', (snapshot) => {
                    const results = [];
                    snapshot.forEach((childSnapshot) => {
                        const result = childSnapshot.val();
                        result.id = childSnapshot.key;
                        results.push(result);
                    });
                    
                    backupData.quizResults = results;
                    
                    localStorage.setItem('autoBackup', JSON.stringify(backupData));
                    localStorage.setItem('lastBackup', new Date().toISOString());
                    
                    console.log('تم إنشاء نسخة احتياطية تلقائية');
                    
                    updateLastBackupInfo();
                });
            });
        });
    } catch (error) {
        console.error('خطأ في النسخ الاحتياطي التلقائي:', error);
    }
}

// إنشاء نسخة احتياطية يدويًا
function createManualBackup() {
    try {
        if (elements.backupStatus) {
            elements.backupStatus.style.display = 'block';
            elements.backupStatus.className = 'backup-status';
            elements.backupStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء النسخة الاحتياطية...';
        }
        
        const backupData = {
            timestamp: new Date().toISOString(),
            grades: grades,
            sections: sections,
            subjects: subjects,
            lessons: lessons,
            sublessons: sublessons,
            admins: admins,
            siteStats: {
                totalVisits: siteStats.totalVisits,
                uniqueUsers: siteStats.uniqueUsers,
                dailyActiveUsers: siteStats.dailyActiveUsers,
                userSessions: siteStats.userSessions
            },
            appSettings: {
                examActive: examActive,
                defaultExamTime: defaultExamTime,
                isDarkMode: isDarkMode,
                autoBackupEnabled: autoBackupEnabled
            }
        };
        
        const questionsRef = database.ref(DB.questions);
        questionsRef.once('value', (snapshot) => {
            const questions = [];
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                questions.push(question);
            });
            
            backupData.questions = questions;
            
            const adsRef = database.ref(DB.ads);
            adsRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    backupData.ad = snapshot.val();
                }
                
                const resultsRef = database.ref(DB.quizResults);
                resultsRef.once('value', (snapshot) => {
                    const results = [];
                    snapshot.forEach((childSnapshot) => {
                        const result = childSnapshot.val();
                        result.id = childSnapshot.key;
                        results.push(result);
                    });
                    
                    backupData.quizResults = results;
                    
                    const dataStr = JSON.stringify(backupData, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    
                    const exportFileDefaultName = `backup-${new Date().toISOString().split('T')[0]}.json`;
                    
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                    
                    localStorage.setItem('manualBackup', dataStr);
                    localStorage.setItem('lastBackup', new Date().toISOString());
                    
                    if (elements.backupStatus) {
                        elements.backupStatus.className = 'backup-status success';
                        elements.backupStatus.innerHTML = '<i class="fas fa-check"></i> تم إنشاء النسخة الاحتياطية بنجاح!';
                        
                        setTimeout(() => {
                            elements.backupStatus.style.display = 'none';
                        }, 3000);
                    }
                    
                    updateLastBackupInfo();
                });
            });
        });
    } catch (error) {
        console.error('خطأ في النسخ الاحتياطي اليدوي:', error);
        if (elements.backupStatus) {
            elements.backupStatus.className = 'backup-status error';
            elements.backupStatus.innerHTML = '<i class="fas fa-times"></i> حدث خطأ أثناء إنشاء النسخة الاحتياطية';
        }
    }
}

// استعادة نسخة احتياطية
function restoreBackup() {
    try {
        const fileInput = elements.backupFile;
        if (!fileInput || !fileInput.files.length) {
            alert('الرجاء اختيار ملف النسخة الاحتياطية');
            return;
        }
        
        if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (!backupData || typeof backupData !== 'object') {
                    throw new Error('ملف النسخة الاحتياطية غير صالح');
                }
                
                restoreBackupData(backupData);
            } catch (error) {
                alert('ملف النسخة الاحتياطية غير صالح أو تالف: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            alert('حدث خطأ أثناء قراءة الملف');
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error('خطأ في استعادة النسخة الاحتياطية:', error);
        alert('حدث خطأ أثناء استعادة النسخة الاحتياطية');
    }
}

// استعادة بيانات النسخة الاحتياطية
function restoreBackupData(backupData) {
    try {
        console.log('بدء استعادة النسخة الاحتياطية...');
        
        const deletePromises = [];
        
        deletePromises.push(database.ref(DB.grades).remove());
        deletePromises.push(database.ref(DB.sections).remove());
        deletePromises.push(database.ref(DB.subjects).remove());
        deletePromises.push(database.ref(DB.lessons).remove());
        deletePromises.push(database.ref(DB.sublessons).remove());
        deletePromises.push(database.ref(DB.questions).remove());
        deletePromises.push(database.ref(DB.ads).remove());
        deletePromises.push(database.ref(DB.quizResults).remove());
        deletePromises.push(database.ref(DB.admins).remove());
        
        Promise.all(deletePromises).then(() => {
            console.log('تم حذف جميع البيانات القديمة');
            
            const restorePromises = [];
            
            if (backupData.grades && Array.isArray(backupData.grades)) {
                backupData.grades.forEach(grade => {
                    const gradeId = grade.id;
                    const gradeData = { ...grade };
                    delete gradeData.id;
                    
                    restorePromises.push(
                        database.ref(DB.grades + '/' + gradeId).set(gradeData)
                    );
                });
            }
            
            if (backupData.sections && Array.isArray(backupData.sections)) {
                backupData.sections.forEach(section => {
                    const sectionId = section.id;
                    const sectionData = { ...section };
                    delete sectionData.id;
                    
                    restorePromises.push(
                        database.ref(DB.sections + '/' + sectionId).set(sectionData)
                    );
                });
            }
            
            if (backupData.subjects && Array.isArray(backupData.subjects)) {
                backupData.subjects.forEach(subject => {
                    const subjectId = subject.id;
                    const subjectData = { ...subject };
                    delete subjectData.id;
                    
                    restorePromises.push(
                        database.ref(DB.subjects + '/' + subjectId).set(subjectData)
                    );
                });
            }
            
            if (backupData.lessons && Array.isArray(backupData.lessons)) {
                backupData.lessons.forEach(lesson => {
                    const lessonId = lesson.id;
                    const lessonData = { ...lesson };
                    delete lessonData.id;
                    
                    restorePromises.push(
                        database.ref(DB.lessons + '/' + lessonId).set(lessonData)
                    );
                });
            }
            
            if (backupData.sublessons && Array.isArray(backupData.sublessons)) {
                backupData.sublessons.forEach(sublesson => {
                    const sublessonId = sublesson.id;
                    const sublessonData = { ...sublesson };
                    delete sublessonData.id;
                    
                    restorePromises.push(
                        database.ref(DB.sublessons + '/' + sublessonId).set(sublessonData)
                    );
                });
            }
            
            if (backupData.questions && Array.isArray(backupData.questions)) {
                backupData.questions.forEach(question => {
                    const questionId = question.id;
                    const questionData = { ...question };
                    delete questionData.id;
                    
                    restorePromises.push(
                        database.ref(DB.questions + '/' + questionId).set(questionData)
                    );
                });
            }
            
            if (backupData.ad) {
                restorePromises.push(
                    database.ref(DB.ads).set(backupData.ad)
                );
            }
            
            if (backupData.quizResults && Array.isArray(backupData.quizResults)) {
                backupData.quizResults.forEach(result => {
                    const resultId = result.id;
                    const resultData = { ...result };
                    delete resultData.id;
                    
                    restorePromises.push(
                        database.ref(DB.quizResults + '/' + resultId).set(resultData)
                    );
                });
            }
            
            if (backupData.admins && Array.isArray(backupData.admins)) {
                backupData.admins.forEach(admin => {
                    const adminId = admin.id;
                    const adminData = { ...admin };
                    delete adminData.id;
                    
                    restorePromises.push(
                        database.ref(DB.admins + '/' + adminId).set(adminData)
                    );
                });
            }
            
            Promise.all(restorePromises).then(() => {
                console.log('تم استعادة جميع البيانات بنجاح');
                
                if (backupData.siteStats) {
                    localStorage.setItem('siteStats', JSON.stringify(backupData.siteStats));
                    loadSiteStats();
                }
                
                if (backupData.appSettings) {
                    if (backupData.appSettings.examActive !== undefined) {
                        examActive = backupData.appSettings.examActive;
                    }
                    
                    if (backupData.appSettings.defaultExamTime) {
                        defaultExamTime = backupData.appSettings.defaultExamTime;
                    }
                    
                    if (backupData.appSettings.isDarkMode !== undefined) {
                        isDarkMode = backupData.appSettings.isDarkMode;
                        localStorage.setItem('darkMode', backupData.appSettings.isDarkMode);
                    }
                    
                    if (backupData.appSettings.autoBackupEnabled !== undefined) {
                        autoBackupEnabled = backupData.appSettings.autoBackupEnabled;
                        localStorage.setItem('autoBackupEnabled', backupData.appSettings.autoBackupEnabled);
                    }
                }
                
                if (backupData.appSettings) {
                    const examStatusRef = database.ref('examStatus');
                    examStatusRef.set({
                        active: backupData.appSettings.examActive !== undefined ? backupData.appSettings.examActive : true,
                        time: backupData.appSettings.defaultExamTime || 10
                    });
                }
                
                alert('✅ تم استعادة النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة تلقائيًا.');
                
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
                
            }).catch(error => {
                console.error('خطأ أثناء استعادة البيانات:', error);
                alert('حدث خطأ أثناء استعادة البيانات: ' + error.message);
            });
            
        }).catch(error => {
            console.error('خطأ أثناء حذف البيانات القديمة:', error);
            alert('حدث خطأ أثناء حذف البيانات القديمة: ' + error.message);
        });
        
    } catch (error) {
        console.error('خطأ في استعادة بيانات النسخة الاحتياطية:', error);
        alert('حدث خطأ أثناء استعادة البيانات: ' + error.message);
    }
}

// تحديث معلومات آخر نسخة احتياطية
function updateLastBackupInfo() {
    try {
        const lastBackup = localStorage.getItem('lastBackup');
        if (lastBackup && elements.lastBackupInfo) {
            const date = new Date(lastBackup);
            const formattedDate = date.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            elements.lastBackupInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clock"></i>
                    <span>${formattedDate}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحديث معلومات النسخة الاحتياطية:', error);
    }
}

// تحميل إعداد النسخ الاحتياطي التلقائي
function loadAutoBackupSetting() {
    try {
        if (elements.autoBackup) {
            elements.autoBackup.checked = autoBackupEnabled;
        }
    } catch (error) {
        console.error('خطأ في تحميل إعداد النسخ الاحتياطي:', error);
    }
}

// =============================================
// دوال الحالة والحفظ
// =============================================

// استعادة الحالة المحفوظة
function restoreSavedState() {
    try {
        if (savedState.selectedGrade) {
            selectedGrade = savedState.selectedGrade;
            
            if (savedState.selectedSection) {
                selectedSection = savedState.selectedSection;
            }
            
            if (savedState.selectedSubject) {
                selectedSubject = savedState.selectedSubject;
            }
            
            if (savedState.selectedLesson) {
                selectedLesson = savedState.selectedLesson;
            }
            
            if (savedState.selectedSublesson) {
                selectedSublesson = savedState.selectedSublesson;
            }
        }
    } catch (error) {
        console.error('خطأ في استعادة الحالة:', error);
    }
}

// حفظ الحالة الحالية
function saveCurrentState() {
    try {
        const state = {
            user: currentUser ? { id: currentUser.id, name: currentUser.name } : null,
            selectedGrade: selectedGrade,
            selectedSection: selectedSection,
            selectedSubject: selectedSubject,
            selectedLesson: selectedLesson,
            selectedSublesson: selectedSublesson
        };
        localStorage.setItem('quizState', JSON.stringify(state));
    } catch (error) {
        console.error('خطأ في حفظ الحالة:', error);
    }
}

// =============================================
// دوال تبديل التبويبات والنوافذ
// =============================================

// تبديل بين تبويبات لوحة التحكم
function switchAdminTab(tabId) {
    try {
        elements.adminNavItems.forEach(t => t.classList.remove('active'));
        elements.adminTabContents.forEach(c => c.classList.remove('active'));
        
        document.querySelector(`.admin-nav-item[data-tab="${tabId}"]`).classList.add('active');
        const tabElement = document.getElementById(`${tabId}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
            
            if (tabId === 'manage-questions') {
                loadAllQuestions();
            } else if (tabId === 'grades') {
                loadGradesForAdmin();
            } else if (tabId === 'sections') {
                loadSectionsForAdmin();
            } else if (tabId === 'subjects') {
                loadSubjectsForAdmin();
            } else if (tabId === 'lessons') {
                loadLessonsForAdmin();
            } else if (tabId === 'sublessons') {
                loadSublessonsForAdmin();
            } else if (tabId === 'stats') {
                updateSiteStats();
            } else if (tabId === 'backup') {
                updateLastBackupInfo();
            } else if (tabId === 'admins') {
                loadAdminsForAdmin();
            }
        }
    } catch (error) {
        console.error('خطأ في تبديل تبويبات لوحة التحكم:', error);
    }
}

// إظهار نافذة تسجيل الدخول
function showLoginModal() {
    try {
        elements.loginModal.style.display = 'flex';
        elements.overlay.classList.add('active');
        
        // تفعيل تبويب تسجيل الدخول
        elements.loginTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === 'login') {
                tab.classList.add('active');
            }
        });
        elements.loginForm.classList.add('active');
        elements.registerForm.classList.remove('active');
        
        elements.loginEmail.value = '';
        elements.loginPassword.value = '';
        elements.loginError.style.display = 'none';
        elements.registerError.style.display = 'none';
    } catch (error) {
        console.error('خطأ في إظهار نافذة تسجيل الدخول:', error);
    }
}

// إغلاق نافذة تسجيل الدخول
function closeLoginModal() {
    try {
        elements.loginModal.style.display = 'none';
        elements.overlay.classList.remove('active');
    } catch (error) {
        console.error('خطأ في إغلاق نافذة تسجيل الدخول:', error);
    }
}

// =============================================
// دوال إحصائيات الموقع
// =============================================

// تحديث إحصائيات الموقع
function updateSiteStats() {
    try {
        // إحصائيات الزيارات
        const totalVisits = siteStats.totalVisits || 0;
        const uniqueUsers = siteStats.uniqueUsers?.length || 0;
        const dailyActive = siteStats.dailyActiveUsers?.length || 0;
        
        let avgSession = 0;
        if (siteStats.userSessions?.length > 0) {
            const total = siteStats.userSessions.reduce((sum, s) => sum + (s.count || 0), 0);
            avgSession = Math.round(total / siteStats.userSessions.length);
        }
        
        if (elements.totalVisits) elements.totalVisits.textContent = totalVisits;
        if (elements.uniqueUsers) elements.uniqueUsers.textContent = uniqueUsers;
        if (elements.dailyActive) elements.dailyActive.textContent = dailyActive;
        if (elements.avgSession) elements.avgSession.textContent = avgSession;
        
        // إحصائيات الأسئلة والاختبارات
        const questionsRef = database.ref(DB.questions);
        questionsRef.once('value', (snapshot) => {
            const totalQuestions = snapshot.numChildren();
            if (elements.totalQuestionsStats) elements.totalQuestionsStats.textContent = totalQuestions;
        });
        
        const resultsRef = database.ref(DB.quizResults);
        resultsRef.once('value', (snapshot) => {
            const totalQuizzes = snapshot.numChildren();
            if (elements.totalQuizzesStats) elements.totalQuizzesStats.textContent = totalQuizzes;
            
            // حساب إحصائيات النتائج
            let totalScore = 0;
            let maxScore = 0;
            let minScore = 100;
            let count = 0;
            
            snapshot.forEach((childSnapshot) => {
                const result = childSnapshot.val();
                const percentage = result.percentage || 0;
                totalScore += percentage;
                maxScore = Math.max(maxScore, percentage);
                minScore = Math.min(minScore, percentage);
                count++;
            });
            
            const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
            if (elements.avgScorePercent) elements.avgScorePercent.textContent = avgScore + '%';
            if (elements.maxScore) elements.maxScore.textContent = maxScore + '%';
            if (elements.minScore) elements.minScore.textContent = (minScore < 100 ? minScore : 0) + '%';
        });
        
        // تحديث آخر النشاطات
        updateActivitiesList();
        
        // تحديث أفضل المستخدمين
        updateTopUsers();
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الموقع:', error);
    }
}

// تحديث قائمة النشاطات
function updateActivitiesList() {
    try {
        const activitiesList = elements.activitiesList;
        if (!activitiesList) return;
        
        const recentActivities = [...(siteStats.userActivities || [])]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);
        
        activitiesList.innerHTML = '';
        
        if (recentActivities.length === 0) {
            activitiesList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <p>لا توجد نشاطات حتى الآن</p>
                </div>
            `;
            return;
        }
        
        recentActivities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            const timeAgo = getTimeAgo(activityDate);
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let icon = 'fa-eye';
            let title = '';
            
            if (activity.action === 'visit') {
                icon = 'fa-globe';
                title = 'زيارة الموقع';
            } else if (activity.action === 'quiz_complete') {
                icon = 'fa-check-circle';
                title = `إكمال اختبار (${activity.percentage || 0}%)`;
            }
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${title}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
            
            activitiesList.appendChild(activityItem);
        });
    } catch (error) {
        console.error('خطأ في تحديث قائمة النشاطات:', error);
    }
}

// تحديث أفضل المستخدمين
function updateTopUsers() {
    try {
        const topUsersList = elements.topUsersList;
        if (!topUsersList) return;
        
        // تجميع نتائج المستخدمين
        const userScores = {};
        
        const resultsRef = database.ref(DB.quizResults);
        resultsRef.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const result = childSnapshot.val();
                const userId = result.userId || 'guest';
                const userName = result.userName || 'زائر';
                const percentage = result.percentage || 0;
                
                if (!userScores[userId]) {
                    userScores[userId] = {
                        total: 0,
                        count: 0,
                        name: userName
                    };
                }
                
                userScores[userId].total += percentage;
                userScores[userId].count++;
            });
            
            // حساب المتوسط وترتيب المستخدمين
            const users = Object.keys(userScores).map(userId => ({
                id: userId,
                name: userScores[userId].name,
                avgScore: Math.round(userScores[userId].total / userScores[userId].count),
                count: userScores[userId].count
            }));
            
            users.sort((a, b) => b.avgScore - a.avgScore);
            
            topUsersList.innerHTML = '';
            
            if (users.length === 0) {
                topUsersList.innerHTML = `
                    <div class="no-questions">
                        <i class="fas fa-info-circle"></i>
                        <p>لا يوجد مستخدمين بعد</p>
                    </div>
                `;
                return;
            }
            
            users.slice(0, 10).forEach((user, index) => {
                const userItem = document.createElement('div');
                userItem.className = 'top-user-item';
                
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                
                userItem.innerHTML = `
                    <div class="top-user-rank">${medal || (index + 1)}</div>
                    <div class="top-user-info">
                        <div class="top-user-name">${user.name}</div>
                        <div class="top-user-score">متوسط: ${user.avgScore}% (${user.count} اختبار)</div>
                    </div>
                `;
                
                topUsersList.appendChild(userItem);
            });
        });
    } catch (error) {
        console.error('خطأ في تحديث أفضل المستخدمين:', error);
    }
}

// حساب الوقت الماضي
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
}

// =============================================
// إعداد مستمعي الأحداث
// =============================================

function setupEventListeners() {
    try {
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleDarkMode);
        }
        
        if (elements.headerBackBtn) {
            elements.headerBackBtn.addEventListener('click', function() {
                goBack();
            });
        }
        
        if (elements.loginToggle) {
            elements.loginToggle.addEventListener('click', showLoginModal);
        }
        
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        elements.loginTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                elements.loginTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                if (this.dataset.tab === 'login') {
                    elements.loginForm.classList.add('active');
                    elements.registerForm.classList.remove('active');
                } else {
                    elements.loginForm.classList.remove('active');
                    elements.registerForm.classList.add('active');
                }
            });
        });
        
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', function() {
                const email = elements.loginEmail.value.trim();
                const password = elements.loginPassword.value;
                const remember = elements.rememberMe.checked;
                
                if (!email || !password) {
                    if (elements.loginError) {
                        elements.loginError.style.display = 'block';
                        elements.loginError.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور';
                    }
                    return;
                }
                
                login(email, password, remember);
            });
        }
        
        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', function() {
                const name = elements.registerName.value.trim();
                const email = elements.registerEmail.value.trim();
                const password = elements.registerPassword.value;
                const confirmPassword = elements.registerConfirm.value;
                
                if (!name || !email || !password || !confirmPassword) {
                    if (elements.registerError) {
                        elements.registerError.style.display = 'block';
                        elements.registerError.textContent = 'الرجاء إدخال جميع البيانات';
                    }
                    return;
                }
                
                register(name, email, password, confirmPassword);
            });
        }
        
        elements.nextBtn.addEventListener('click', nextQuestion);
        elements.prevBtn.addEventListener('click', prevQuestion);
        elements.submitBtn.addEventListener('click', submitQuiz);
        elements.restartBtn.addEventListener('click', restartQuiz);
        
        elements.logoContainer.addEventListener('click', function() {
            try {
                window.location.reload();
            } catch (error) {
                console.error('خطأ في إعادة تحميل الصفحة:', error);
            }
        });
        
        elements.adminToggle.addEventListener('click', function() {
            if (currentUser) {
                // التحقق مرة أخرى للتأكد
                const isAdmin = checkIfUserIsAdmin(currentUser.email);
                console.log('النقر على زر الإدارة - هل هو مشرف؟', isAdmin);
                
                if (isAdmin) {
                    elements.adminPanel.classList.add('active');
                    elements.overlay.classList.add('active');
                    loadAllQuestions();
                    loadGradesForAdmin();
                    loadSectionsForAdmin();
                    loadSubjectsForAdmin();
                    loadLessonsForAdmin();
                    loadSublessonsForAdmin();
                    updateSiteStats();
                    loadAdminsForAdmin();
                } else {
                    alert('عذراً، أنت لست مشرفاً');
                }
            } else {
                showLoginModal();
            }
        });
        
        elements.closeAdmin.addEventListener('click', function() {
            elements.adminPanel.classList.remove('active');
            elements.overlay.classList.remove('active');
        });
        
        elements.overlay.addEventListener('click', function() {
            elements.loginModal.style.display = 'none';
            elements.adminPanel.classList.remove('active');
            elements.overlay.classList.remove('active');
        });
        
        elements.categorySelect.addEventListener('change', function() {
            try {
                filterQuestionsByCategory(this.value);
            } catch (error) {
                console.error('خطأ في تصفية الأسئلة:', error);
            }
        });
        
        elements.adminNavItems.forEach(item => {
            item.addEventListener('click', function() {
                try {
                    switchAdminTab(this.dataset.tab);
                } catch (error) {
                    console.error('خطأ في تبديل التبويبات:', error);
                }
            });
        });
        
        if (elements.questionType) {
            elements.questionType.addEventListener('change', function() {
                try {
                    if (this.value === 'mcq') {
                        elements.mcqOptions.style.display = 'block';
                        elements.truefalseOptions.style.display = 'none';
                    } else {
                        elements.mcqOptions.style.display = 'none';
                        elements.truefalseOptions.style.display = 'block';
                    }
                } catch (error) {
                    console.error('خطأ في تغيير نوع السؤال:', error);
                }
            });
        }
        
        if (elements.addQuestionBtn) {
            elements.addQuestionBtn.addEventListener('click', addNewQuestion);
        }
        
        if (elements.saveSettingsBtn) {
            elements.saveSettingsBtn.addEventListener('click', saveSystemSettings);
        }
        
        if (elements.addGradeBtn) {
            elements.addGradeBtn.addEventListener('click', addNewGrade);
        }
        
        if (elements.addSectionBtn) {
            elements.addSectionBtn.addEventListener('click', addNewSection);
        }
        
        if (elements.addSubjectBtn) {
            elements.addSubjectBtn.addEventListener('click', addNewSubject);
        }
        
        if (elements.addLessonBtn) {
            elements.addLessonBtn.addEventListener('click', addNewLesson);
        }
        
        if (elements.addSublessonBtn) {
            elements.addSublessonBtn.addEventListener('click', addNewSublesson);
        }
        
        if (elements.addAdminBtn) {
            elements.addAdminBtn.addEventListener('click', addNewAdmin);
        }
        
        if (elements.filterGrade && elements.filterSection) {
            elements.filterGrade.addEventListener('change', loadAllQuestions);
            elements.filterSection.addEventListener('change', loadAllQuestions);
            elements.filterSubject.addEventListener('change', loadAllQuestions);
            elements.filterType.addEventListener('change', loadAllQuestions);
        }
        
        if (elements.saveAdBtn) {
            elements.saveAdBtn.addEventListener('click', saveAd);
        }
        
        if (elements.adTitleInput && elements.adDescriptionInput) {
            elements.adTitleInput.addEventListener('input', updateAdPreview);
            elements.adDescriptionInput.addEventListener('input', updateAdPreview);
        }
        
        if (elements.adClose) {
            elements.adClose.addEventListener('click', function() {
                elements.adContainer.style.display = 'none';
            });
        }
        
        if (elements.adAction) {
            elements.adAction.addEventListener('click', function() {
                try {
                    if (currentAd && currentAd.url) {
                        window.open(currentAd.url, '_blank');
                    }
                } catch (error) {
                    console.error('خطأ في فتح رابط الإعلان:', error);
                }
            });
        }
        
        if (elements.autoBackup) {
            elements.autoBackup.addEventListener('change', function() {
                autoBackupEnabled = this.checked;
                localStorage.setItem('autoBackupEnabled', autoBackupEnabled);
            });
        }
        
        if (elements.manualBackupBtn) {
            elements.manualBackupBtn.addEventListener('click', createManualBackup);
        }
        
        if (elements.restoreBackupBtn) {
            elements.restoreBackupBtn.addEventListener('click', restoreBackup);
        }
        
        if (elements.questionGrade) {
            elements.questionGrade.addEventListener('change', function() {
                const selectedGrade = this.value;
                updateSectionDropdowns(selectedGrade);
                elements.questionSection.value = '';
                elements.questionSubject.value = '';
                elements.questionLesson.value = '';
                elements.questionSublesson.value = '';
                updateSubjectDropdowns('');
                updateLessonDropdowns('');
                updateSublessonDropdowns('');
            });
        }
        
        if (elements.questionSection) {
            elements.questionSection.addEventListener('change', function() {
                const selectedSection = this.value;
                updateSubjectDropdowns(selectedSection);
                elements.questionSubject.value = '';
                elements.questionLesson.value = '';
                elements.questionSublesson.value = '';
                updateLessonDropdowns('');
                updateSublessonDropdowns('');
            });
        }
        
        if (elements.questionSubject) {
            elements.questionSubject.addEventListener('change', function() {
                const selectedSubject = this.value;
                updateLessonDropdowns(selectedSubject);
                elements.questionLesson.value = '';
                elements.questionSublesson.value = '';
                updateSublessonDropdowns('');
            });
        }
        
        if (elements.questionLesson) {
            elements.questionLesson.addEventListener('change', function() {
                const selectedLesson = this.value;
                updateSublessonDropdowns(selectedLesson);
                elements.questionSublesson.value = '';
            });
        }
        
        // إغلاق النوافذ بالضغط على ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (elements.loginModal.style.display === 'flex') {
                    closeLoginModal();
                }
                if (elements.adminPanel.classList.contains('active')) {
                    elements.adminPanel.classList.remove('active');
                    elements.overlay.classList.remove('active');
                }
            }
        });
        
    } catch (error) {
        console.error('خطأ في إعداد مستمعي الأحداث:', error);
    }
}

// =============================================
// دوال إضافية
// =============================================

// تبديل وضع Dark Mode
function toggleDarkMode() {
    try {
        isDarkMode = !isDarkMode;
        
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'false');
        }
        
        // تحديث إعدادات المستخدم إذا كان مسجلاً
        if (currentUser) {
            const profileRef = database.ref(`${DB.profiles}/${currentUser.id}/settings`);
            profileRef.update({ darkMode: isDarkMode });
        }
    } catch (error) {
        console.error('خطأ في تبديل وضع Dark Mode:', error);
    }
}

// =============================================
// بدء التطبيق
// =============================================
document.addEventListener('DOMContentLoaded', initApp);
