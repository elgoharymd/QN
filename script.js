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
const auth = firebase.auth();

// متغيرات التطبيق
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let userAnswers = [];
let clickCount = 0;
let adminPassword = localStorage.getItem('adminPassword') || "gohary01010081147mo";
let categories = new Set();
let quizStartTime;
let timerInterval;
let selectedYear = '';
let selectedSection = '';
let selectedSubject = '';
let selectedLesson = '';
let selectedSublesson = '';
let subjects = [];
let sections = [];
let lessons = [];
let sublessons = [];
let examActive = true;
let defaultExamTime = 10;
let currentUser = null;
let savedState = JSON.parse(localStorage.getItem('quizState')) || {};
let currentEditingQuestionId = null;
let currentAd = JSON.parse(localStorage.getItem('currentAd')) || null;
let autoBackupEnabled = localStorage.getItem('autoBackupEnabled') !== 'false';
let userStats = JSON.parse(localStorage.getItem('userStats')) || {
    totalVisits: 0,
    uniqueUsers: new Set(),
    dailyActiveUsers: new Set(),
    userSessions: [],
    activeUsers: new Set(),
    permanentUsers: new Set(),
    userActivities: []
};

// متغير Dark Mode
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// عناصر DOM
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
    passwordModal: document.getElementById('password-modal'),
    passwordInput: document.getElementById('admin-password'),
    passwordSubmit: document.getElementById('password-submit'),
    passwordCancel: document.getElementById('password-cancel'),
    passwordError: document.getElementById('password-error'),
    quizLoading: document.getElementById('quiz-loading'),
    categoryFilter: document.getElementById('category-filter'),
    categorySelect: document.getElementById('category-select'),
    timerDisplay: document.getElementById('timer'),
    overlay: document.getElementById('overlay'),
    yearSelectionContainer: document.getElementById('year-selection-container'),
    sectionSelectionContainer: document.getElementById('section-selection-container'),
    subjectSelectionContainer: document.getElementById('subject-selection-container'),
    lessonSelectionContainer: document.getElementById('lesson-selection-container'),
    sublessonSelectionContainer: document.getElementById('sublesson-selection-container'),
    yearCards: document.querySelectorAll('.year-card'),
    backBtn: document.getElementById('back-btn'),
    adminNavItems: document.querySelectorAll('.admin-nav-item'),
    adminTabContents: document.querySelectorAll('.admin-tab-content'),
    adContainer: document.getElementById('ad-container'),
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
    
    // عناصر لوحة الإدارة
    questionType: document.getElementById('question-type'),
    mcqOptions: document.getElementById('mcq-options'),
    truefalseOptions: document.getElementById('truefalse-options'),
    addQuestionBtn: document.getElementById('add-question-btn'),
    questionsList: document.getElementById('questions-list'),
    filterYear: document.getElementById('filter-year'),
    filterSection: document.getElementById('filter-section'),
    filterSubject: document.getElementById('filter-subject'),
    filterType: document.getElementById('filter-type'),
    allQuestionsList: document.getElementById('all-questions-list'),
    examTime: document.getElementById('exam-time'),
    examStatus: document.getElementById('exam-status'),
    adminPasswordSetting: document.getElementById('admin-password-setting'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    totalQuestions: document.getElementById('total-questions'),
    totalQuizzes: document.getElementById('total-quizzes'),
    avgScore: document.getElementById('avg-score'),
    activeUsers: document.getElementById('active-users'),
    recentResults: document.getElementById('recent-results'),
    newSectionName: document.getElementById('new-section-name'),
    newSectionDescription: document.getElementById('new-section-description'),
    newSectionIcon: document.getElementById('new-section-icon'),
    addSectionBtn: document.getElementById('add-section-btn'),
    sectionsList: document.getElementById('sections-list'),
    newSubjectName: document.getElementById('new-subject-name'),
    newSubjectDescription: document.getElementById('new-subject-description'),
    newSubjectSection: document.getElementById('new-subject-section'),
    newSubjectIcon: document.getElementById('new-subject-icon'),
    addSubjectBtn: document.getElementById('add-subject-btn'),
    subjectsList: document.getElementById('subjects-list'),
    questionSection: document.getElementById('question-section'),
    questionSubject: document.getElementById('question-subject'),
    questionLesson: document.getElementById('question-lesson'),
    questionSublesson: document.getElementById('question-sublesson'),
    newLessonName: document.getElementById('new-lesson-name'),
    newLessonDescription: document.getElementById('new-lesson-description'),
    newLessonSubject: document.getElementById('new-lesson-subject'),
    newLessonIcon: document.getElementById('new-lesson-icon'),
    newLessonOrder: document.getElementById('new-lesson-order'),
    addLessonBtn: document.getElementById('add-lesson-btn'),
    lessonsList: document.getElementById('lessons-list'),
    newSublessonName: document.getElementById('new-sublesson-name'),
    newSublessonDescription: document.getElementById('new-sublesson-description'),
    newSublessonLesson: document.getElementById('new-sublesson-lesson'),
    newSublessonIcon: document.getElementById('new-sublesson-icon'),
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
    questionYear: document.getElementById('question-year'),
    
    // عناصر إحصائيات المستخدمين
    totalUsersCount: document.getElementById('total-users-count'),
    activeUsersCount: document.getElementById('active-users-count'),
    dailyActiveCount: document.getElementById('daily-active-count'),
    avgSessionCount: document.getElementById('avg-session-count'),
    userActivityChart: document.getElementById('user-activity-chart'),
    userActivityList: document.getElementById('user-activity-list')
};

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
        
        setupEventListeners();
        loadInitialData();
        checkExamStatus();
        restoreSavedState();
        loadAd();
        
        elements.yearSelectionContainer.style.display = 'grid';
        
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
        
        userStats.totalVisits++;
        userStats.uniqueUsers.add(userId);
        
        const today = new Date().toDateString();
        const userKey = `${userId}_${today}`;
        userStats.dailyActiveUsers.add(userKey);
        
        userStats.activeUsers.add(userId);
        
        userStats.userActivities.push(session);
        
        if (userStats.userActivities.length > 100) {
            userStats.userActivities = userStats.userActivities.slice(-100);
        }
        
        const userSessions = userStats.userSessions.find(s => s.userId === userId);
        if (userSessions) {
            userSessions.count++;
            userSessions.lastVisit = new Date().toISOString();
        } else {
            userStats.userSessions.push({
                userId: userId,
                count: 1,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            });
        }
        
        saveUserStats();
        saveUserActivityToFirebase(session);
    } catch (error) {
        console.error('خطأ في تتبع دخول المستخدم:', error);
    }
}

// حفظ إحصائيات المستخدمين
function saveUserStats() {
    try {
        const statsToSave = {
            totalVisits: userStats.totalVisits,
            uniqueUsers: Array.from(userStats.uniqueUsers),
            dailyActiveUsers: Array.from(userStats.dailyActiveUsers),
            userSessions: userStats.userSessions,
            activeUsers: Array.from(userStats.activeUsers),
            permanentUsers: Array.from(userStats.permanentUsers),
            userActivities: userStats.userActivities
        };
        
        localStorage.setItem('userStats', JSON.stringify(statsToSave));
    } catch (error) {
        console.error('خطأ في حفظ إحصائيات المستخدمين:', error);
    }
}

// تحميل إحصائيات المستخدمين
function loadUserStats() {
    try {
        const savedStats = JSON.parse(localStorage.getItem('userStats'));
        if (savedStats) {
            userStats = {
                totalVisits: savedStats.totalVisits || 0,
                uniqueUsers: new Set(savedStats.uniqueUsers || []),
                dailyActiveUsers: new Set(savedStats.dailyActiveUsers || []),
                userSessions: savedStats.userSessions || [],
                activeUsers: new Set(savedStats.activeUsers || []),
                permanentUsers: new Set(savedStats.permanentUsers || []),
                userActivities: savedStats.userActivities || []
            };
        }
    } catch (error) {
        console.error('خطأ في تحميل إحصائيات المستخدمين:', error);
    }
}

// حفظ نشاط المستخدم في Firebase
function saveUserActivityToFirebase(session) {
    try {
        const userActivityRef = database.ref('userActivities');
        userActivityRef.push(session)
            .catch(error => {
                console.error('Error saving user activity:', error);
            });
    } catch (error) {
        console.error('خطأ في حفظ نشاط المستخدم:', error);
    }
}

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
            } else {
                elements.sectionSelectionContainer.style.display = 'none';
                elements.yearSelectionContainer.style.display = 'grid';
                elements.backBtn.style.display = 'none';
                elements.headerBackBtn.style.display = 'none';
                selectedSection = '';
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
            elements.yearSelectionContainer.style.display = 'grid';
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

// تحميل البيانات الأولية
function loadInitialData() {
    try {
        loadSections();
        loadSubjects();
        loadLessons();
        loadSublessons();
        loadUserStats();
        updateLastBackupInfo();
        loadAutoBackupSetting();
    } catch (error) {
        console.error('خطأ في تحميل البيانات الأولية:', error);
    }
}

// تحميل الأقسام
function loadSections() {
    try {
        const sectionsRef = database.ref('sections');
        sectionsRef.on('value', (snapshot) => {
            sections = [];
            snapshot.forEach((childSnapshot) => {
                const section = childSnapshot.val();
                section.id = childSnapshot.key;
                sections.push(section);
            });
            
            updateSectionDropdowns();
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
        const subjectsRef = database.ref('subjects');
        subjectsRef.on('value', (snapshot) => {
            subjects = [];
            snapshot.forEach((childSnapshot) => {
                const subject = childSnapshot.val();
                subject.id = childSnapshot.key;
                subjects.push(subject);
            });
            
            updateSubjectDropdowns();
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
        const lessonsRef = database.ref('lessons');
        lessonsRef.on('value', (snapshot) => {
            lessons = [];
            snapshot.forEach((childSnapshot) => {
                const lesson = childSnapshot.val();
                lesson.id = childSnapshot.key;
                lessons.push(lesson);
            });
            
            updateLessonDropdowns();
            updateLessonDropdownsForSublessons();
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
        const sublessonsRef = database.ref('sublessons');
        sublessonsRef.on('value', (snapshot) => {
            sublessons = [];
            snapshot.forEach((childSnapshot) => {
                const sublesson = childSnapshot.val();
                sublesson.id = childSnapshot.key;
                sublessons.push(sublesson);
            });
            
            updateSublessonDropdowns();
        }, (error) => {
            console.error('خطأ في تحميل الأقسام الفرعية:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأقسام الفرعية:', error);
    }
}

// تحديث قوائم الأقسام المنسدلة
function updateSectionDropdowns(selectedYear = '') {
    try {
        if (elements.questionSection) {
            elements.questionSection.innerHTML = '';
            
            let filteredSections = sections;
            if (selectedYear) {
                filteredSections = sections.filter(section => 
                    section.grades && section.grades.includes(selectedYear)
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
            elements.newSubjectSection.innerHTML = '';
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

// استعادة الحالة المحفوظة
function restoreSavedState() {
    try {
        if (savedState.selectedYear) {
            selectedYear = savedState.selectedYear;
            const yearCard = document.querySelector(`.year-card[data-year="${selectedYear}"]`);
            if (yearCard) yearCard.click();
            
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
            user: currentUser,
            selectedYear: selectedYear,
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

// إعداد مستمعي الأحداث
function setupEventListeners() {
    try {
        elements.yearCards.forEach(card => {
            card.addEventListener('click', function() {
                try {
                    selectedYear = this.dataset.year;
                    elements.yearSelectionContainer.style.display = 'none';
                    elements.sectionSelectionContainer.style.display = 'block';
                    elements.backBtn.style.display = 'flex';
                    elements.headerBackBtn.style.display = 'flex';
                    
                    const yearText = getYearText(selectedYear);
                    elements.quizTitle.textContent = `اختبار إختبارات الاختبارات- ${yearText}`;
                    
                    loadSectionsForYear(selectedYear);
                    saveCurrentState();
                } catch (error) {
                    console.error('خطأ في اختيار الصف الدراسي:', error);
                    showError('حدث خطأ في اختيار الصف الدراسي');
                }
            });
        });
        
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleDarkMode);
        }
        
        if (elements.headerBackBtn) {
            elements.headerBackBtn.addEventListener('click', function() {
                goBack();
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
            showPasswordModal();
        });
        
        elements.closeAdmin.addEventListener('click', closeAdminPanel);
        elements.passwordSubmit.addEventListener('click', checkAdminPassword);
        
        elements.passwordCancel.addEventListener('click', function() {
            try {
                elements.passwordModal.style.display = 'none';
                elements.passwordInput.value = '';
                elements.passwordError.style.display = 'none';
            } catch (error) {
                console.error('خطأ في إلغاء نافذة كلمة المرور:', error);
            }
        });
        
        elements.passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                elements.passwordSubmit.click();
            }
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
        
        if (elements.filterYear && elements.filterSection) {
            elements.filterYear.addEventListener('change', loadAllQuestions);
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
        
        if (elements.questionYear) {
            elements.questionYear.addEventListener('change', function() {
                const selectedYear = this.value;
                updateSectionDropdowns(selectedYear);
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
    } catch (error) {
        console.error('خطأ في إعداد مستمعي الأحداث:', error);
    }
}

// تحميل الأقسام بناءً على الصف المختار
function loadSectionsForYear(year) {
    try {
        elements.sectionContainer.innerHTML = '';
        
        const yearSections = sections.filter(section => 
            section.grades && section.grades.includes(year)
        );
        
        if (yearSections.length > 0) {
            yearSections.forEach(section => {
                const sectionCard = document.createElement('div');
                sectionCard.className = 'section-card card-3d';
                sectionCard.dataset.section = section.id;
                sectionCard.innerHTML = `
                    <i class="${section.icon}"></i>
                    <h3>${section.name}</h3>
                    <p>${section.description}</p>
                `;
                elements.sectionContainer.appendChild(sectionCard);
                
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
            });
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

// تحميل المواد بناءً على القسم المختار
function loadSubjectsForSection(sectionId) {
    try {
        elements.subjectContainer.innerHTML = '';
        
        const sectionSubjects = subjects.filter(subject => 
            subject.sectionId === sectionId
        );
        
        if (sectionSubjects.length > 0) {
            sectionSubjects.forEach(subject => {
                const subjectCard = document.createElement('div');
                subjectCard.className = 'subject-card card-3d';
                subjectCard.dataset.subject = subject.id;
                subjectCard.innerHTML = `
                    <i class="fas ${subject.icon}"></i>
                    <h3>${subject.name}</h3>
                    <p>${subject.description}</p>
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

// تحميل الدروس للمادة المختارة
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
                lessonCard.className = 'lesson-card card-3d';
                lessonCard.dataset.lesson = lesson.id;
                lessonCard.innerHTML = `
                    <i class="fas ${lesson.icon}"></i>
                    <h3>${lesson.name}</h3>
                    <p>${lesson.description}</p>
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
            }, 500);
        }
    } catch (error) {
        console.error('خطأ في تحميل الدروس للمادة:', error);
        showError('حدث خطأ في تحميل الدروس');
    }
}

// تحميل الأقسام الفرعية للدرس المختار
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
                sublessonCard.className = 'sublesson-card card-3d';
                sublessonCard.dataset.sublesson = sublesson.id;
                sublessonCard.innerHTML = `
                    <i class="fas ${sublesson.icon}"></i>
                    <h3>${sublesson.name}</h3>
                    <p>${sublesson.description}</p>
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

// تحميل الإختبارات من Firebase
function loadQuestions() {
    try {
        elements.quizLoading.style.display = 'flex';
        elements.questionContainer.innerHTML = '';
        
        const questionsRef = database.ref('questions');
        questionsRef.once('value', (snapshot) => {
            questions = [];
            categories = new Set(['all']);
            
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                
                if (question.year === selectedYear && 
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

// تحميل جميع الأسئلة للإدارة
function loadAllQuestions() {
    try {
        const questionsRef = database.ref('questions');
        questionsRef.once('value', (snapshot) => {
            elements.allQuestionsList.innerHTML = '';
            
            const filterYear = elements.filterYear.value;
            const filterSection = elements.filterSection.value;
            const filterSubject = elements.filterSubject.value;
            const filterType = elements.filterType.value;
            
            let hasQuestions = false;
            
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                
                if ((!filterYear || question.year === filterYear) && 
                    (!filterSection || question.section === filterSection) &&
                    (!filterSubject || question.subject === filterSubject) &&
                    (!filterType || question.type === filterType)) {
                    
                    hasQuestions = true;
                    const sectionName = sections.find(s => s.id === question.section)?.name || question.section;
                    const subjectName = subjects.find(s => s.id === question.subject)?.name || question.subject || 'عام';
                    const lessonName = lessons.find(l => l.id === question.lesson)?.name || '';
                    const sublessonName = sublessons.find(s => s.id === question.sublesson)?.name || '';
                    
                    const questionItem = document.createElement('div');
                    questionItem.className = 'question-item';
                    questionItem.innerHTML = `
                        <h4>${question.text}</h4>
                        <div class="question-meta">
                            <span><i class="fas fa-graduation-cap"></i> ${getYearText(question.year)}</span>
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
            
            updateAdminStats();
        }, (error) => {
            console.error('خطأ في تحميل الأسئلة للإدارة:', error);
            showError('حدث خطأ في تحميل الأسئلة للإدارة');
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأسئلة للإدارة:', error);
        showError('حدث خطأ في تحميل الأسئلة للإدارة');
    }
}

// تحديث إحصائيات لوحة الإدارة
function updateAdminStats() {
    try {
        const questionsRef = database.ref('questions');
        questionsRef.once('value', (snapshot) => {
            elements.totalQuestions.textContent = snapshot.numChildren();
        }, (error) => {
            console.error('خطأ في تحديث إحصائيات الأسئلة:', error);
        });
        
        const resultsRef = database.ref('quizResults');
        resultsRef.once('value', (snapshot) => {
            elements.totalQuizzes.textContent = snapshot.numChildren();
            
            let totalScore = 0;
            let count = 0;
            
            snapshot.forEach((childSnapshot) => {
                const result = childSnapshot.val();
                totalScore += result.percentage;
                count++;
            });
            
            const avg = count > 0 ? Math.round(totalScore / count) : 0;
            elements.avgScore.textContent = `${avg}%`;
            
            elements.recentResults.innerHTML = '';
            const recentResults = [];
            
            snapshot.forEach((childSnapshot) => {
                recentResults.push(childSnapshot.val());
            });
            
            recentResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            recentResults.slice(0, 5).forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'question-item';
                resultItem.innerHTML = `
                    <h4>${result.userName}</h4>
                    <div class="question-meta">
                        <span><i class="fas fa-graduation-cap"></i> ${getYearText(result.year)}</span>
                        <span><i class="fas fa-chart-line"></i> ${result.percentage}%</span>
                        <span><i class="fas fa-clock"></i> ${result.timeTaken}</span>
                    </div>
                `;
                
                elements.recentResults.appendChild(resultItem);
            });
        }, (error) => {
            console.error('خطأ في تحديث إحصائيات النتائج:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحديث الإحصائيات:', error);
    }
}

// تحديث إحصائيات المستخدمين
function updateUserAnalytics() {
    try {
        const totalUsers = userStats.uniqueUsers.size;
        const activeUsers = userStats.activeUsers.size;
        const dailyActive = userStats.dailyActiveUsers.size;
        
        const avgSessions = userStats.userSessions.length > 0 
            ? Math.round(userStats.userSessions.reduce((sum, session) => sum + session.count, 0) / userStats.userSessions.length)
            : 0;
        
        if (elements.totalUsersCount) {
            elements.totalUsersCount.textContent = totalUsers;
        }
        if (elements.activeUsersCount) {
            elements.activeUsersCount.textContent = activeUsers;
        }
        if (elements.dailyActiveCount) {
            elements.dailyActiveCount.textContent = dailyActive;
        }
        if (elements.avgSessionCount) {
            elements.avgSessionCount.textContent = avgSessions;
        }
        
        updateUserActivityChart();
        updateRecentActivities();
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المستخدمين:', error);
    }
}

// تحديث مخطط نشاط المستخدمين
function updateUserActivityChart() {
    try {
        const chartContainer = elements.userActivityChart;
        if (!chartContainer) return;
        
        const today = new Date();
        const activityData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('ar-SA', { weekday: 'short' });
            
            const dayKey = date.toDateString();
            let activeCount = 0;
            
            userStats.userActivities.forEach(activity => {
                const activityDate = new Date(activity.timestamp);
                if (activityDate.toDateString() === dayKey) {
                    activeCount++;
                }
            });
            
            activityData.push({
                day: dateStr,
                count: activeCount
            });
        }
        
        const maxCount = Math.max(...activityData.map(d => d.count), 1);
        
        let chartHTML = `
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 250px; padding: 20px;">
        `;
        
        activityData.forEach(data => {
            const height = (data.count / maxCount) * 200;
            chartHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; height: 100%;">
                    <div style="width: 40px; background: var(--gradient-primary); border-radius: 8px 8px 0 0; height: ${height}px;"></div>
                    <div style="margin-top: 10px; font-weight: bold; color: var(--text-primary);">${data.count}</div>
                    <div style="margin-top: 5px; font-size: 12px; color: var(--text-secondary);">${data.day}</div>
                </div>
            `;
        });
        
        chartHTML += `</div>`;
        
        chartContainer.innerHTML = chartHTML;
    } catch (error) {
        console.error('خطأ في تحديث مخطط النشاط:', error);
    }
}

// تحديث النشاطات الأخيرة
function updateRecentActivities() {
    try {
        const activityList = elements.userActivityList;
        if (!activityList) return;
        
        const recentActivities = [...userStats.userActivities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        activityList.innerHTML = '';
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="no-questions">
                    <i class="fas fa-info-circle"></i>
                    <h3>لا توجد نشاطات مسجلة</h3>
                    <p>سيتم عرض نشاطات المستخدمين هنا عند زيارة الموقع.</p>
                </div>
            `;
            return;
        }
        
        recentActivities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            const timeAgo = getTimeAgo(activityDate);
            
            const userInitials = activity.userId.substring(0, 2).toUpperCase();
            
            const activityItem = document.createElement('div');
            activityItem.className = 'user-activity-item';
            activityItem.innerHTML = `
                <div class="user-activity-avatar">${userInitials}</div>
                <div class="user-activity-info">
                    <div class="user-activity-name">مستخدم ${activity.userId.substring(0, 8)}</div>
                    <div class="user-activity-time">${activity.action === 'visit' ? 'زيارة الموقع' : 'إجراء اختبار'} • ${timeAgo}</div>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    } catch (error) {
        console.error('خطأ في تحديث النشاطات الأخيرة:', error);
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
    return `قبل ${diffDays} يوم`;
}

// تحميل الأقسام للإدارة
function loadSectionsForAdmin() {
    try {
        const sectionsRef = database.ref('sections');
        sectionsRef.once('value', (snapshot) => {
            elements.sectionsList.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const section = childSnapshot.val();
                section.id = childSnapshot.key;
                
                const sectionItem = document.createElement('div');
                sectionItem.className = 'question-item';
                sectionItem.innerHTML = `
                    <h4><i class="${section.icon}"></i> ${section.name}</h4>
                    <div class="question-meta">
                        <span><i class="fas fa-graduation-cap"></i> ${section.grades ? section.grades.map(g => getYearText(g)).join(', ') : 'لم يتم تحديد صفوف'}</span>
                    </div>
                    <p>${section.description}</p>
                    <div class="question-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editSection('${section.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSection('${section.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                elements.sectionsList.appendChild(sectionItem);
            });
        }, (error) => {
            console.error('خطأ في تحميل الأقسام للإدارة:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأقسام للإدارة:', error);
    }
}

// تحميل المواد للإدارة
function loadSubjectsForAdmin() {
    try {
        const subjectsRef = database.ref('subjects');
        subjectsRef.once('value', (snapshot) => {
            elements.subjectsList.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const subject = childSnapshot.val();
                subject.id = childSnapshot.key;
                
                const sectionName = sections.find(s => s.id === subject.sectionId)?.name || subject.sectionId;
                
                const subjectItem = document.createElement('div');
                subjectItem.className = 'question-item';
                subjectItem.innerHTML = `
                    <h4><i class="fas ${subject.icon}"></i> ${subject.name}</h4>
                    <div class="question-meta">
                        <span><i class="fas fa-layer-group"></i> ${sectionName}</span>
                    </div>
                    <p>${subject.description}</p>
                    <div class="question-actions">
                        <button class="btn-admin btn-admin-warning btn-sm" onclick="editSubject('${subject.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSubject('${subject.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                
                elements.subjectsList.appendChild(subjectItem);
            });
        }, (error) => {
            console.error('خطأ في تحميل المواد للإدارة:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل المواد للإدارة:', error);
    }
}

// تحميل الدروس للإدارة
function loadLessonsForAdmin() {
    try {
        const lessonsRef = database.ref('lessons');
        lessonsRef.once('value', (snapshot) => {
            const lessonsList = document.getElementById('lessons-list');
            if (!lessonsList) return;
            
            lessonsList.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const lesson = childSnapshot.val();
                lesson.id = childSnapshot.key;
                
                const subjectName = subjects.find(s => s.id === lesson.subjectId)?.name || lesson.subjectId;
                
                const lessonItem = document.createElement('div');
                lessonItem.className = 'question-item';
                lessonItem.innerHTML = `
                    <h4><i class="fas ${lesson.icon}"></i> ${lesson.name}</h4>
                    <div class="question-meta">
                        <span><i class="fas fa-book"></i> ${subjectName}</span>
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${lesson.order || 1}</span>
                    </div>
                    <p>${lesson.description}</p>
                    <div class="question-actions">
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
        }, (error) => {
            console.error('خطأ في تحميل الدروس للإدارة:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الدروس للإدارة:', error);
    }
}

// تحميل الأقسام الفرعية للإدارة
function loadSublessonsForAdmin() {
    try {
        const sublessonsRef = database.ref('sublessons');
        sublessonsRef.once('value', (snapshot) => {
            const sublessonsList = document.getElementById('sublessons-list');
            if (!sublessonsList) return;
            
            sublessonsList.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const sublesson = childSnapshot.val();
                sublesson.id = childSnapshot.key;
                
                const lessonName = lessons.find(l => l.id === sublesson.lessonId)?.name || sublesson.lessonId;
                
                const sublessonItem = document.createElement('div');
                sublessonItem.className = 'question-item';
                sublessonItem.innerHTML = `
                    <h4><i class="fas ${sublesson.icon}"></i> ${sublesson.name}</h4>
                    <div class="question-meta">
                        <span><i class="fas fa-book-open"></i> ${lessonName}</span>
                        <span><i class="fas fa-sort-numeric-up"></i> الترتيب: ${sublesson.order || 1}</span>
                    </div>
                    <p>${sublesson.description}</p>
                    <div class="question-actions">
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
        }, (error) => {
            console.error('خطأ في تحميل الأقسام الفرعية للإدارة:', error);
        });
    } catch (error) {
        console.error('خطأ في دالة تحميل الأقسام الفرعية للإدارة:', error);
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
    } catch (error) {
        console.error('خطأ في تبديل وضع Dark Mode:', error);
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
    } catch (error) {
        console.error('خطأ في عرض النتائج:', error);
        showError('حدث خطأ في عرض النتائج');
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
            year: selectedYear,
            section: selectedSection,
            subject: selectedSubject,
            lesson: selectedLesson,
            sublesson: selectedSublesson
        };
        
        userStats.userActivities.push(quizSession);
        
        const userQuizCount = userStats.userActivities.filter(a => 
            a.userId === userId && a.action === 'quiz_complete'
        ).length;
        
        if (userQuizCount >= 3) {
            userStats.permanentUsers.add(userId);
        }
        
        if (userStats.userActivities.length > 100) {
            userStats.userActivities = userStats.userActivities.slice(-100);
        }
        
        saveUserStats();
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
            year: selectedYear,
            section: selectedSection,
            subject: selectedSubject,
            lesson: selectedLesson,
            sublesson: selectedSublesson,
            userId: currentUser ? currentUser.id : null,
            userName: currentUser ? currentUser.name : 'زائر'
        };
        
        const resultsRef = database.ref('quizResults');
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

// الحصول على نص الصف الدراسي
function getYearText(year) {
    switch(year) {
        case 'secondary1': return 'الصف الأول الثانوي';
        case 'secondary2': return 'الصف الثاني الثانوي';
        case 'secondary3': return 'الصف الثالث الثانوي';
        default: return '';
    }
}

// عرض نافذة كلمة المرور
function showPasswordModal() {
    try {
        elements.passwordModal.style.display = 'flex';
        elements.passwordInput.focus();
        elements.passwordError.style.display = 'none';
    } catch (error) {
        console.error('خطأ في عرض نافذة كلمة المرور:', error);
    }
}

// إغلاق لوحة التحكم
function closeAdminPanel() {
    try {
        elements.adminPanel.classList.remove('active');
        elements.overlay.classList.remove('active');
    } catch (error) {
        console.error('خطأ في إغلاق لوحة التحكم:', error);
    }
}

// التحقق من كلمة المرور
function checkAdminPassword() {
    try {
        if (elements.passwordInput.value === adminPassword) {
            elements.passwordModal.style.display = 'none';
            elements.adminPanel.style.display = 'block';
            elements.adminPanel.classList.add('active');
            elements.overlay.classList.add('active');
            elements.passwordInput.value = '';
            elements.passwordError.style.display = 'none';
            
            loadAllQuestions();
            loadSectionsForAdmin();
            loadSubjectsForAdmin();
            loadLessonsForAdmin();
            loadSublessonsForAdmin();
            updateUserAnalytics();
        } else {
            elements.passwordError.style.display = 'block';
        }
    } catch (error) {
        console.error('خطأ في التحقق من كلمة المرور:', error);
        showError('حدث خطأ في التحقق من كلمة المرور');
    }
}

// حذف قسم
function deleteSection(sectionId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المواد والأسئلة المرتبطة به.')) {
            database.ref('sections/' + sectionId).remove()
                .then(() => {
                    alert('تم حذف القسم بنجاح');
                    loadSectionsForAdmin();
                    createAutoBackup();
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف القسم: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        showError('حدث خطأ أثناء حذف القسم');
    }
}

// حذف مادة
function deleteSubject(subjectId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الأسئلة المرتبطة بها.')) {
            database.ref('subjects/' + subjectId).remove()
                .then(() => {
                    alert('تم حذف المادة بنجاح');
                    loadSubjectsForAdmin();
                    createAutoBackup();
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف المادة: ' + error.message);
                });
            }
    } catch (error) {
        console.error('خطأ في حذف المادة:', error);
        showError('حدث خطأ أثناء حذف المادة');
    }
}

// حذف درس
function deleteLesson(lessonId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف جميع الأسئلة المرتبطة به.')) {
            database.ref('lessons/' + lessonId).remove()
                .then(() => {
                    alert('تم حذف الدرس بنجاح');
                    loadLessonsForAdmin();
                    createAutoBackup();
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف الدرس: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف الدرس:', error);
        showError('حدث خطأ أثناء حذف الدرس');
    }
}

// حذف قسم فرعي
function deleteSublesson(sublessonId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا القسم الفرعي؟ سيتم حذف جميع الأسئلة المرتبطة به.')) {
            database.ref('sublessons/' + sublessonId).remove()
                .then(() => {
                    alert('تم حذف القسم الفرعي بنجاح');
                    loadSublessonsForAdmin();
                    createAutoBackup();
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف القسم الفرعي: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف القسم الفرعي:', error);
        showError('حدث خطأ أثناء حذف القسم الفرعي');
    }
}

// حذف سؤال
function deleteQuestion(questionId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            database.ref('questions/' + questionId).remove()
                .then(() => {
                    alert('تم حذف السؤال بنجاح');
                    loadAllQuestions();
                    createAutoBackup();
                })
                .catch(error => {
                    alert('حدث خطأ أثناء حذف السؤال: ' + error.message);
                });
        }
    } catch (error) {
        console.error('خطأ في حذف السؤال:', error);
        showError('حدث خطأ أثناء حذف السؤال');
    }
}

// تعديل سؤال
function editQuestion(questionId) {
    try {
        currentEditingQuestionId = questionId;
        
        const questionsRef = database.ref('questions/' + questionId);
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
                                <div class="edit-option-item">
                                    <label>الخيار الثالث:</label>
                                    <input type="text" id="edit-option3" class="form-control" value="${question.option3 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="3" ${question.correctAnswer === '3' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
                                <div class="edit-option-item">
                                    <label>الخيار الرابع:</label>
                                    <input type="text" id="edit-option4" class="form-control" value="${question.option4 || ''}">
                                    <div class="correct-option-indicator">
                                        <input type="radio" name="edit-correct-answer" value="4" ${question.correctAnswer === '4' ? 'checked' : ''}>
                                        <label>إجابة صحيحة</label>
                                    </div>
                                </div>
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
                            <label for="edit-question-category">التصنيف:</label>
                            <input type="text" id="edit-question-category" class="form-control" value="${question.category || ''}" placeholder="تصنيف السؤال (اختياري)">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-difficulty">مستوى الصعوبة:</label>
                            <select id="edit-question-difficulty" class="form-control">
                                <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>سهل</option>
                                <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>متوسط</option>
                                <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>صعب</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-year">الصف الدراسي:</label>
                            <select id="edit-question-year" class="form-control">
                                <option value="secondary1" ${question.year === 'secondary1' ? 'selected' : ''}>الصف الأول الثانوي</option>
                                <option value="secondary2" ${question.year === 'secondary2' ? 'selected' : ''}>الصف الثاني الثانوي</option>
                                <option value="secondary3" ${question.year === 'secondary3' ? 'selected' : ''}>الصف الثالث الثانوي</option>
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
                        
                        <div class="form-group">
                            <label for="edit-question-lesson">الدرس:</label>
                            <select id="edit-question-lesson" class="form-control">
                                <option value="">اختر الدرس (اختياري)</option>
                                ${lessons.map(lesson => `
                                    <option value="${lesson.id}" ${question.lesson === lesson.id ? 'selected' : ''}>${lesson.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-question-sublesson">القسم الفرعي:</label>
                            <select id="edit-question-sublesson" class="form-control">
                                <option value="">اختر القسم الفرعي (اختياري)</option>
                                ${sublessons.map(sublesson => `
                                    <option value="${sublesson.id}" ${question.sublesson === sublesson.id ? 'selected' : ''}>${sublesson.name}</option>
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
                
                editModal.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        saveQuestionEdit(questionId, editModal);
                    }
                });
            } else {
                alert('لم يتم العثور على السؤال');
            }
        }, (error) => {
            console.error('خطأ في تحميل السؤال للتعديل:', error);
            alert('حدث خطأ في تحميل السؤال للتعديل');
        });
    } catch (error) {
        console.error('خطأ في دالة تعديل السؤال:', error);
        showError('حدث خطأ في تعديل السؤال');
    }
}

// حفظ تعديل السؤال
function saveQuestionEdit(questionId, editModal) {
    try {
        const questionText = editModal.querySelector('#edit-question-text').value.trim();
        const questionType = editModal.querySelector('#edit-question-type').value;
        const category = editModal.querySelector('#edit-question-category').value.trim();
        const difficulty = editModal.querySelector('#edit-question-difficulty').value;
        const year = editModal.querySelector('#edit-question-year').value;
        const section = editModal.querySelector('#edit-question-section').value;
        const subject = editModal.querySelector('#edit-question-subject').value;
        const lesson = editModal.querySelector('#edit-question-lesson').value;
        const sublesson = editModal.querySelector('#edit-question-sublesson').value;
        
        if (!questionText) {
            alert('الرجاء إدخال نص السؤال');
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
            year,
            section,
            subject: subject || '',
            lesson: lesson || '',
            sublesson: sublesson || '',
            updatedAt: new Date().toISOString()
        };
        
        if (questionType === 'mcq') {
            correctAnswer = editModal.querySelector('input[name="edit-correct-answer"]:checked')?.value;
            
            for (let i = 1; i <= 4; i++) {
                const optionValue = editModal.querySelector(`#edit-option${i}`).value.trim();
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
        
        database.ref('questions/' + questionId).update(questionData)
            .then(() => {
                alert('تم تحديث السؤال بنجاح');
                document.body.removeChild(editModal);
                elements.overlay.classList.remove('active');
                loadAllQuestions();
                createAutoBackup();
            })
            .catch(error => {
                alert('حدث خطأ أثناء تحديث السؤال: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في حفظ تعديل السؤال:', error);
        alert('حدث خطأ أثناء حفظ التعديلات');
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
                    <textarea id="edit-section-description" class="form-control">${section.description}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-section-icon">أيقونة القسم:</label>
                    <select id="edit-section-icon" class="form-control">
                        <option value="fas fa-book" ${section.icon === 'fas fa-book' ? 'selected' : ''}>كتاب</option>
                        <option value="fas fa-calculator" ${section.icon === 'fas fa-calculator' ? 'selected' : ''}>آلة حاسبة</option>
                        <option value="fas fa-flask" ${section.icon === 'fas fa-flask' ? 'selected' : ''}>مختبر</option>
                        <option value="fas fa-globe" ${section.icon === 'fas fa-globe' ? 'selected' : ''}>عالم</option>
                        <option value="fas fa-history" ${section.icon === 'fas fa-history' ? 'selected' : ''}>تاريخ</option>
                        <option value="fas fa-quran" ${section.icon === 'fas fa-quran' ? 'selected' : ''}>قرآن</option>
                        <option value="fas fa-language" ${section.icon === 'fas fa-language' ? 'selected' : ''}>لغة</option>
                        <option value="fas fa-atom" ${section.icon === 'fas fa-atom' ? 'selected' : ''}>علوم</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>الصفوف المرتبطة:</label>
                    <div class="grades-checkboxes">
                        <label><input type="checkbox" name="edit-section-grades" value="secondary1" ${section.grades && section.grades.includes('secondary1') ? 'checked' : ''}> الصف الأول الثانوي</label>
                        <label><input type="checkbox" name="edit-section-grades" value="secondary2" ${section.grades && section.grades.includes('secondary2') ? 'checked' : ''}> الصف الثاني الثانوي</label>
                        <label><input type="checkbox" name="edit-section-grades" value="secondary3" ${section.grades && section.grades.includes('secondary3') ? 'checked' : ''}> الصف الثالث الثانوي</label>
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
            const sectionIcon = editModal.querySelector('#edit-section-icon').value;
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
                icon: sectionIcon,
                grades: selectedGrades,
                updatedAt: new Date().toISOString()
            };
            
            database.ref('sections/' + sectionId).update(sectionData)
                .then(() => {
                    alert('تم تحديث القسم بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSectionsForAdmin();
                    createAutoBackup();
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
                    <textarea id="edit-subject-description" class="form-control">${subject.description}</textarea>
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
                    <label for="edit-subject-icon">أيقونة المادة:</label>
                    <select id="edit-subject-icon" class="form-control">
                        <option value="fa-atom" ${subject.icon === 'fa-atom' ? 'selected' : ''}>علوم (ذرة)</option>
                        <option value="fa-flask" ${subject.icon === 'fa-flask' ? 'selected' : ''}>كيمياء</option>
                        <option value="fa-calculator" ${subject.icon === 'fa-calculator' ? 'selected' : ''}>رياضيات</option>
                        <option value="fa-dna" ${subject.icon === 'fa-dna' ? 'selected' : ''}>أحياء</option>
                        <option value="fa-language" ${subject.icon === 'fa-language' ? 'selected' : ''}>لغة عربية</option>
                        <option value="fa-book-open" ${subject.icon === 'fa-book-open' ? 'selected' : ''}>أدب</option>
                        <option value="fa-pray" ${subject.icon === 'fa-pray' ? 'selected' : ''}>فقه</option>
                        <option value="fa-quran" ${subject.icon === 'fa-quran' ? 'selected' : ''}>قرآن</option>
                        <option value="fa-hands-praying" ${subject.icon === 'fa-hands-praying' ? 'selected' : ''}>حديث</option>
                        <option value="fa-mosque" ${subject.icon === 'fa-mosque' ? 'selected' : ''}>توحيد</option>
                        <option value="fa-globe" ${subject.icon === 'fa-globe' ? 'selected' : ''}>جغرافيا</option>
                        <option value="fa-history" ${subject.icon === 'fa-history' ? 'selected' : ''}>تاريخ</option>
                        <option value="fa-brain" ${subject.icon === 'fa-brain' ? 'selected' : ''}>منطق</option>
                        <option value="fa-scroll" ${subject.icon === 'fa-scroll' ? 'selected' : ''}>بلاغة</option>
                        <option value="fa-comment" ${subject.icon === 'fa-comment' ? 'selected' : ''}>إنشاء</option>
                        <option value="fa-infinity" ${subject.icon === 'fa-infinity' ? 'selected' : ''}>هندسة</option>
                    </select>
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
            const subjectIcon = editModal.querySelector('#edit-subject-icon').value;
            
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
                icon: subjectIcon,
                updatedAt: new Date().toISOString()
            };
            
            database.ref('subjects/' + subjectId).update(subjectData)
                .then(() => {
                    alert('تم تحديث المادة بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSubjectsForAdmin();
                    createAutoBackup();
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
                    <textarea id="edit-lesson-description" class="form-control">${lesson.description}</textarea>
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
                    <label for="edit-lesson-icon">أيقونة الدرس:</label>
                    <select id="edit-lesson-icon" class="form-control">
                        <option value="fa-book-open" ${lesson.icon === 'fa-book-open' ? 'selected' : ''}>كتاب مفتوح</option>
                        <option value="fa-chalkboard-teacher" ${lesson.icon === 'fa-chalkboard-teacher' ? 'selected' : ''}>سبورة</option>
                        <option value="fa-graduation-cap" ${lesson.icon === 'fa-graduation-cap' ? 'selected' : ''}>تخرج</option>
                        <option value="fa-lightbulb" ${lesson.icon === 'fa-lightbulb' ? 'selected' : ''}>فكرة</option>
                        <option value="fa-puzzle-piece" ${lesson.icon === 'fa-puzzle-piece' ? 'selected' : ''}>أحجية</option>
                        <option value="fa-brain" ${lesson.icon === 'fa-brain' ? 'selected' : ''}>عقل</option>
                        <option value="fa-flask" ${lesson.icon === 'fa-flask' ? 'selected' : ''}>تجربة</option>
                        <option value="fa-calculator" ${lesson.icon === 'fa-calculator' ? 'selected' : ''}>حساب</option>
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
            const lessonIcon = editModal.querySelector('#edit-lesson-icon').value;
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
                icon: lessonIcon,
                order: lessonOrder,
                updatedAt: new Date().toISOString()
            };
            
            database.ref('lessons/' + lessonId).update(lessonData)
                .then(() => {
                    alert('تم تحديث الدرس بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadLessonsForAdmin();
                    createAutoBackup();
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
                    <textarea id="edit-sublesson-description" class="form-control">${sublesson.description}</textarea>
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
                    <label for="edit-sublesson-icon">أيقونة القسم الفرعي:</label>
                    <select id="edit-sublesson-icon" class="form-control">
                        <option value="fa-folder" ${sublesson.icon === 'fa-folder' ? 'selected' : ''}>مجلد</option>
                        <option value="fa-folder-open" ${sublesson.icon === 'fa-folder-open' ? 'selected' : ''}>مجلد مفتوح</option>
                        <option value="fa-bookmark" ${sublesson.icon === 'fa-bookmark' ? 'selected' : ''}>إشارة مرجعية</option>
                        <option value="fa-tag" ${sublesson.icon === 'fa-tag' ? 'selected' : ''}>علامة</option>
                        <option value="fa-hashtag" ${sublesson.icon === 'fa-hashtag' ? 'selected' : ''}>هاشتاج</option>
                        <option value="fa-layer-group" ${sublesson.icon === 'fa-layer-group' ? 'selected' : ''}>طبقات</option>
                        <option value="fa-sitemap" ${sublesson.icon === 'fa-sitemap' ? 'selected' : ''}>هيكل</option>
                        <option value="fa-project-diagram" ${sublesson.icon === 'fa-project-diagram' ? 'selected' : ''}>مخطط</option>
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
            const sublessonIcon = editModal.querySelector('#edit-sublesson-icon').value;
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
                icon: sublessonIcon,
                order: sublessonOrder,
                updatedAt: new Date().toISOString()
            };
            
            database.ref('sublessons/' + sublessonId).update(sublessonData)
                .then(() => {
                    alert('تم تحديث القسم الفرعي بنجاح');
                    document.body.removeChild(editModal);
                    elements.overlay.classList.remove('active');
                    loadSublessonsForAdmin();
                    createAutoBackup();
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

// مراقبة حالة الاختبار
function checkExamStatus() {
    try {
        const examStatusRef = database.ref('examStatus');
        examStatusRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                examActive = snapshot.val().active;
                defaultExamTime = snapshot.val().time || 10;
                
                if (!examActive) {
                    elements.yearSelectionContainer.innerHTML = `
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

// إضافة سؤال جديد
function addNewQuestion() {
    try {
        const questionText = document.getElementById('question-text').value.trim();
        const questionType = document.getElementById('question-type').value;
        const category = document.getElementById('question-category').value.trim();
        const difficulty = document.getElementById('question-difficulty').value;
        const year = document.getElementById('question-year').value;
        const section = document.getElementById('question-section').value;
        const subject = document.getElementById('question-subject').value;
        const lesson = document.getElementById('question-lesson').value;
        const sublesson = document.getElementById('question-sublesson').value;
        
        if (!questionText) {
            alert('الرجاء إدخال نص السؤال');
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
            year,
            section,
            subject: subject || '',
            lesson: lesson || '',
            sublesson: sublesson || '',
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
        
        const questionsRef = database.ref('questions');
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
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة السؤال: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة سؤال جديد:', error);
        alert('حدث خطأ أثناء إضافة السؤال');
    }
}

// إضافة قسم جديد
function addNewSection() {
    try {
        const sectionName = elements.newSectionName.value.trim();
        const sectionDescription = elements.newSectionDescription.value.trim();
        const sectionIcon = elements.newSectionIcon.value;
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
            icon: sectionIcon,
            grades: selectedGrades,
            createdAt: new Date().toISOString()
        };
        
        const sectionsRef = database.ref('sections');
        sectionsRef.push(sectionData)
            .then(() => {
                alert('تمت إضافة القسم بنجاح');
                
                elements.newSectionName.value = '';
                elements.newSectionDescription.value = '';
                document.querySelectorAll('input[name="section-grades"]').forEach(cb => cb.checked = false);
                
                loadSectionsForAdmin();
                createAutoBackup();
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة القسم: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة قسم جديد:', error);
        alert('حدث خطأ أثناء إضافة القسم');
    }
}

// إضافة مادة جديدة
function addNewSubject() {
    try {
        const subjectName = elements.newSubjectName.value.trim();
        const subjectDescription = elements.newSubjectDescription.value.trim();
        const subjectSection = elements.newSubjectSection.value;
        const subjectIcon = elements.newSubjectIcon.value;
        
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
            icon: subjectIcon,
            createdAt: new Date().toISOString()
        };
        
        const subjectsRef = database.ref('subjects');
        subjectsRef.push(subjectData)
            .then(() => {
                alert('تمت إضافة المادة بنجاح');
                
                elements.newSubjectName.value = '';
                elements.newSubjectDescription.value = '';
                
                loadSubjectsForAdmin();
                createAutoBackup();
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة المادة: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة مادة جديدة:', error);
        alert('حدث خطأ أثناء إضافة المادة');
    }
}

// إضافة درس جديد
function addNewLesson() {
    try {
        const lessonName = elements.newLessonName.value.trim();
        const lessonDescription = elements.newLessonDescription.value.trim();
        const lessonSubject = elements.newLessonSubject.value;
        const lessonIcon = elements.newLessonIcon.value;
        const lessonOrder = parseInt(elements.newLessonOrder.value) || 1;
        
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
            icon: lessonIcon,
            order: lessonOrder,
            createdAt: new Date().toISOString()
        };
        
        const lessonsRef = database.ref('lessons');
        lessonsRef.push(lessonData)
            .then(() => {
                alert('تمت إضافة الدرس بنجاح');
                
                elements.newLessonName.value = '';
                elements.newLessonDescription.value = '';
                elements.newLessonOrder.value = '1';
                
                loadLessonsForAdmin();
                createAutoBackup();
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة الدرس: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة درس جديد:', error);
        alert('حدث خطأ أثناء إضافة الدرس');
    }
}

// إضافة قسم فرعي جديد
function addNewSublesson() {
    try {
        const sublessonName = elements.newSublessonName.value.trim();
        const sublessonDescription = elements.newSublessonDescription.value.trim();
        const sublessonLesson = elements.newSublessonLesson.value;
        const sublessonIcon = elements.newSublessonIcon.value;
        const sublessonOrder = parseInt(elements.newSublessonOrder.value) || 1;
        
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
            icon: sublessonIcon,
            order: sublessonOrder,
            createdAt: new Date().toISOString()
        };
        
        const sublessonsRef = database.ref('sublessons');
        sublessonsRef.push(sublessonData)
            .then(() => {
                alert('تمت إضافة القسم الفرعي بنجاح');
                
                elements.newSublessonName.value = '';
                elements.newSublessonDescription.value = '';
                elements.newSublessonOrder.value = '1';
                
                loadSublessonsForAdmin();
                createAutoBackup();
            })
            .catch(error => {
                alert('حدث خطأ أثناء إضافة القسم الفرعي: ' + error.message);
            });
    } catch (error) {
        console.error('خطأ في إضافة قسم فرعي جديد:', error);
        alert('حدث خطأ أثناء إضافة القسم الفرعي');
    }
}

// حفظ إعدادات النظام
function saveSystemSettings() {
    try {
        const examTime = parseInt(elements.examTime.value);
        const examActive = elements.examStatus.checked;
        const newAdminPassword = elements.adminPasswordSetting.value;
        
        if (!examTime || examTime < 1) {
            alert('الرجاء إدخال مدة اختبار صحيحة');
            return;
        }
        
        if (!newAdminPassword) {
            alert('الرجاء إدخال كلمة مرور إدارية');
            return;
        }
        
        const examStatusRef = database.ref('examStatus');
        examStatusRef.set({
            active: examActive,
            time: examTime
        })
        .then(() => {
            adminPassword = newAdminPassword;
            localStorage.setItem('adminPassword', newAdminPassword);
            
            alert('تم حفظ الإعدادات بنجاح');
            createAutoBackup();
        })
        .catch(error => {
            alert('حدث خطأ أثناء حفظ الإعدادات: ' + error.message);
        });
    } catch (error) {
        console.error('خطأ في حفظ إعدادات النظام:', error);
        alert('حدث خطأ أثناء حفظ الإعدادات');
    }
}

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
            } else if (tabId === 'lessons') {
                loadLessonsForAdmin();
            } else if (tabId === 'sublessons') {
                loadSublessonsForAdmin();
            } else if (tabId === 'sections') {
                loadSectionsForAdmin();
            } else if (tabId === 'subjects') {
                loadSubjectsForAdmin();
            } else if (tabId === 'user-analytics') {
                updateUserAnalytics();
            } else if (tabId === 'backup') {
                updateLastBackupInfo();
            }
        }
    } catch (error) {
        console.error('خطأ في تبديل تبويبات لوحة التحكم:', error);
    }
}

// إدارة الإعلانات
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
            createdAt: new Date().toISOString()
        };
        
        const adsRef = database.ref('ads');
        adsRef.set(adData)
            .then(() => {
                alert('تم حفظ الإعلان بنجاح');
                
                localStorage.setItem('currentAd', JSON.stringify(adData));
                currentAd = adData;
                
                loadAd();
                createAutoBackup();
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
        
        elements.previewAdTitle.textContent = title;
        elements.previewAdDescription.textContent = description;
    } catch (error) {
        console.error('خطأ في تحديث معاينة الإعلان:', error);
    }
}

// تحميل الإعلان
function loadAd() {
    try {
        const adsRef = database.ref('ads');
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
            elements.adTitle.textContent = ad.title;
            elements.adDescription.textContent = ad.description;
            elements.adContainer.style.display = 'block';
            
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

// النسخ الاحتياطي التلقائي
function createAutoBackup() {
    try {
        if (!autoBackupEnabled) return;
        
        console.log('جاري إنشاء نسخة احتياطية تلقائية...');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            sections: sections,
            subjects: subjects,
            lessons: lessons,
            sublessons: sublessons,
            userStats: {
                totalVisits: userStats.totalVisits,
                uniqueUsers: Array.from(userStats.uniqueUsers),
                dailyActiveUsers: Array.from(userStats.dailyActiveUsers),
                userSessions: userStats.userSessions,
                activeUsers: Array.from(userStats.activeUsers),
                permanentUsers: Array.from(userStats.permanentUsers),
                userActivities: userStats.userActivities
            },
            appSettings: {
                adminPassword: adminPassword,
                examActive: examActive,
                defaultExamTime: defaultExamTime,
                isDarkMode: isDarkMode,
                autoBackupEnabled: autoBackupEnabled
            }
        };
        
        const questionsRef = database.ref('questions');
        questionsRef.once('value', (snapshot) => {
            const questions = [];
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                questions.push(question);
            });
            
            backupData.questions = questions;
            
            const adsRef = database.ref('ads');
            adsRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    backupData.ad = snapshot.val();
                }
                
                const resultsRef = database.ref('quizResults');
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
                }, (error) => {
                    console.error('خطأ في الحصول على النتائج للنسخ الاحتياطي:', error);
                });
            }, (error) => {
                console.error('خطأ في الحصول على الإعلانات للنسخ الاحتياطي:', error);
            });
        }, (error) => {
            console.error('خطأ في الحصول على الأسئلة للنسخ الاحتياطي:', error);
        });
    } catch (error) {
        console.error('خطأ في النسخ الاحتياطي التلقائي:', error);
    }
}

// إنشاء نسخة احتياطية يدويًا
function createManualBackup() {
    try {
        elements.backupStatus.style.display = 'block';
        elements.backupStatus.className = 'backup-status';
        elements.backupStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء النسخة الاحتياطية...';
        
        const backupData = {
            timestamp: new Date().toISOString(),
            sections: sections,
            subjects: subjects,
            lessons: lessons,
            sublessons: sublessons,
            userStats: {
                totalVisits: userStats.totalVisits,
                uniqueUsers: Array.from(userStats.uniqueUsers),
                dailyActiveUsers: Array.from(userStats.dailyActiveUsers),
                userSessions: userStats.userSessions,
                activeUsers: Array.from(userStats.activeUsers),
                permanentUsers: Array.from(userStats.permanentUsers),
                userActivities: userStats.userActivities
            },
            appSettings: {
                adminPassword: adminPassword,
                examActive: examActive,
                defaultExamTime: defaultExamTime,
                isDarkMode: isDarkMode,
                autoBackupEnabled: autoBackupEnabled
            }
        };
        
        const questionsRef = database.ref('questions');
        questionsRef.once('value', (snapshot) => {
            const questions = [];
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val();
                question.id = childSnapshot.key;
                questions.push(question);
            });
            
            backupData.questions = questions;
            
            const adsRef = database.ref('ads');
            adsRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    backupData.ad = snapshot.val();
                }
                
                const resultsRef = database.ref('quizResults');
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
                    
                    elements.backupStatus.className = 'backup-status success';
                    elements.backupStatus.innerHTML = '<i class="fas fa-check"></i> تم إنشاء النسخة الاحتياطية بنجاح!';
                    
                    setTimeout(() => {
                        elements.backupStatus.style.display = 'none';
                    }, 3000);
                    
                    updateLastBackupInfo();
                }, (error) => {
                    console.error('خطأ في الحصول على النتائج للنسخ الاحتياطي:', error);
                    elements.backupStatus.className = 'backup-status error';
                    elements.backupStatus.innerHTML = '<i class="fas fa-times"></i> حدث خطأ أثناء إنشاء النسخة الاحتياطية';
                });
            }, (error) => {
                console.error('خطأ في الحصول على الإعلانات للنسخ الاحتياطي:', error);
                elements.backupStatus.className = 'backup-status error';
                elements.backupStatus.innerHTML = '<i class="fas fa-times"></i> حدث خطأ أثناء إنشاء النسخة الاحتياطية';
            });
        }, (error) => {
            console.error('خطأ في الحصول على الأسئلة للنسخ الاحتياطي:', error);
            elements.backupStatus.className = 'backup-status error';
            elements.backupStatus.innerHTML = '<i class="fas fa-times"></i> حدث خطأ أثناء إنشاء النسخة الاحتياطية';
        });
    } catch (error) {
        console.error('خطأ في النسخ الاحتياطي اليدوي:', error);
        elements.backupStatus.className = 'backup-status error';
        elements.backupStatus.innerHTML = '<i class="fas fa-times"></i> حدث خطأ أثناء إنشاء النسخة الاحتياطية';
    }
}

// استعادة نسخة احتياطية
function restoreBackup() {
    try {
        const fileInput = elements.backupFile;
        if (!fileInput.files.length) {
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
        
        deletePromises.push(database.ref('sections').remove());
        deletePromises.push(database.ref('subjects').remove());
        deletePromises.push(database.ref('lessons').remove());
        deletePromises.push(database.ref('sublessons').remove());
        deletePromises.push(database.ref('questions').remove());
        deletePromises.push(database.ref('ads').remove());
        deletePromises.push(database.ref('quizResults').remove());
        
        Promise.all(deletePromises).then(() => {
            console.log('تم حذف جميع البيانات القديمة');
            
            const restorePromises = [];
            
            if (backupData.sections && Array.isArray(backupData.sections)) {
                console.log('جاري استعادة الأقسام:', backupData.sections.length);
                backupData.sections.forEach(section => {
                    const sectionId = section.id;
                    const sectionData = { ...section };
                    delete sectionData.id;
                    
                    restorePromises.push(
                        database.ref('sections/' + sectionId).set(sectionData)
                    );
                });
            }
            
            if (backupData.subjects && Array.isArray(backupData.subjects)) {
                console.log('جاري استعادة المواد:', backupData.subjects.length);
                backupData.subjects.forEach(subject => {
                    const subjectId = subject.id;
                    const subjectData = { ...subject };
                    delete subjectData.id;
                    
                    restorePromises.push(
                        database.ref('subjects/' + subjectId).set(subjectData)
                    );
                });
            }
            
            if (backupData.lessons && Array.isArray(backupData.lessons)) {
                console.log('جاري استعادة الدروس:', backupData.lessons.length);
                backupData.lessons.forEach(lesson => {
                    const lessonId = lesson.id;
                    const lessonData = { ...lesson };
                    delete lessonData.id;
                    
                    restorePromises.push(
                        database.ref('lessons/' + lessonId).set(lessonData)
                    );
                });
            }
            
            if (backupData.sublessons && Array.isArray(backupData.sublessons)) {
                console.log('جاري استعادة الأقسام الفرعية:', backupData.sublessons.length);
                backupData.sublessons.forEach(sublesson => {
                    const sublessonId = sublesson.id;
                    const sublessonData = { ...sublesson };
                    delete sublessonData.id;
                    
                    restorePromises.push(
                        database.ref('sublessons/' + sublessonId).set(sublessonData)
                    );
                });
            }
            
            if (backupData.questions && Array.isArray(backupData.questions)) {
                console.log('جاري استعادة الأسئلة:', backupData.questions.length);
                backupData.questions.forEach(question => {
                    const questionId = question.id;
                    const questionData = { ...question };
                    delete questionData.id;
                    
                    restorePromises.push(
                        database.ref('questions/' + questionId).set(questionData)
                    );
                });
            }
            
            if (backupData.ad) {
                console.log('جاري استعادة الإعلانات');
                restorePromises.push(
                    database.ref('ads').set(backupData.ad)
                );
            }
            
            if (backupData.quizResults && Array.isArray(backupData.quizResults)) {
                console.log('جاري استعادة النتائج:', backupData.quizResults.length);
                backupData.quizResults.forEach(result => {
                    const resultId = result.id;
                    const resultData = { ...result };
                    delete resultData.id;
                    
                    restorePromises.push(
                        database.ref('quizResults/' + resultId).set(resultData)
                    );
                });
            }
            
            Promise.all(restorePromises).then(() => {
                console.log('تم استعادة جميع البيانات بنجاح');
                
                if (backupData.userStats) {
                    localStorage.setItem('userStats', JSON.stringify(backupData.userStats));
                    loadUserStats();
                }
                
                if (backupData.appSettings) {
                    if (backupData.appSettings.adminPassword) {
                        adminPassword = backupData.appSettings.adminPassword;
                        localStorage.setItem('adminPassword', backupData.appSettings.adminPassword);
                    }
                    
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
        if (lastBackup) {
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

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);