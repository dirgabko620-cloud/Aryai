(function() {
    'use strict';

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const heroSection = $('#heroSection');
    const dashboard = $('#dashboard');
    const authOverlay = $('#authOverlay');
    const closeAuth = $('#closeAuth');
    const authForm = $('#authForm');
    const authEmail = $('#authEmail');
    const authPassword = $('#authPassword');
    const authError = $('#authError');
    const authTitle = $('#authTitle');
    const authSub = $('#authSub');
    const authBtnText = $('#authBtnText');
    const authSubmitBtn = $('#authSubmitBtn');
    const authToggleLink = $('#authToggleLink');
    const authSwitch = $('#authSwitch');
    const loginNavBtn = $('#loginNavBtn');
    const heroLoginBtn = $('#heroLoginBtn');
    const heroLearnBtn = $('#heroLearnBtn');
    const logoutBtn = $('#logoutBtn');
    const dashLogoutBtn = $('#dashLogoutBtn');
    const userBadge = $('#userBadge');
    const userNameDisplay = $('#userNameDisplay');
    const dashUserName = $('#dashUserName');

    const tabBtns = $$('.tab-btn');
    const tabPanels = {
        chatbot: $('#tabChatbot'),
        summarizer: $('#tabSummarizer'),
        codegen: $('#tabCodeGen'),
    };

    const chatbotInput = $('#chatbotInput');
    const chatbotSendBtn = $('#chatbotSendBtn');
    const chatbotResponse = $('#chatbotResponse');
    const chatbotResponseText = $('#chatbotResponseText');
    const chatbotExampleBtn = $('#chatbotExampleBtn');

    const summarizerInput = $('#summarizerInput');
    const summarizerBtn = $('#summarizerBtn');
    const summarizerResponse = $('#summarizerResponse');
    const summarizerResponseText = $('#summarizerResponseText');

    const codeGenInput = $('#codeGenInput');
    const codeGenBtn = $('#codeGenBtn');
    const codeGenResponse = $('#codeGenResponse');
    const codeGenResponseText = $('#codeGenResponseText');

    const todoInput = $('#todoInput');
    const addTodoBtn = $('#addTodoBtn');
    const todoList = $('#todoList');
    const aiScheduleBtn = $('#aiScheduleBtn');

    const typedTextEl = $('#typedText');

    let currentUser = null;
    let isLoginMode = true;

    function init() {
        currentUser = getCurrentUser();
        if (currentUser) {
            showDashboard();
        } else {
            showHero();
        }

        window.loadTodos();
        bindEvents();
        initParticles();
        startTyping();
    }

    function showDashboard() {
        heroSection.style.display = 'none';
        dashboard.classList.add('active');
        userBadge.style.display = 'flex';
        loginNavBtn.style.display = 'none';
        if (currentUser) {
            const name = currentUser.name || currentUser.email.split('@')[0];
            userNameDisplay.textContent = name;
            dashUserName.textContent = name;
        }
        authOverlay.classList.remove('active');
    }

    function showHero() {
        heroSection.style.display = 'flex';
        dashboard.classList.remove('active');
        userBadge.style.display = 'none';
        loginNavBtn.style.display = 'inline-block';
    }

    function bindEvents() {
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });

        loginNavBtn.addEventListener('click', () => openAuth('login'));
        heroLoginBtn.addEventListener('click', () => openAuth('login'));
        heroLearnBtn.addEventListener('click', () => {
            document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
        });

        closeAuth.addEventListener('click', closeAuthOverlay);
        authOverlay.addEventListener('click', (e) => {
            if (e.target === authOverlay) closeAuthOverlay();
        });

        authForm.addEventListener('submit', handleAuthSubmit);

        logoutBtn.addEventListener('click', handleLogout);
        dashLogoutBtn.addEventListener('click', handleLogout);

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        chatbotSendBtn.addEventListener('click', handleChatbot);
        chatbotInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatbot();
            }
        });
        chatbotExampleBtn.addEventListener('click', showExampleQuestions);

        summarizerBtn.addEventListener('click', handleSummarizer);

        codeGenBtn.addEventListener('click', handleCodeGen);
        codeGenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCodeGen();
            }
        });

        addTodoBtn.addEventListener('click', window.addTodo);
        todoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.addTodo();
            }
        });
        aiScheduleBtn.addEventListener('click', window.runAIScheduler);
    }

    function openAuth(mode) {
        isLoginMode = (mode === 'login');
        updateAuthUI();
        authOverlay.classList.add('active');
        authEmail.value = '';
        authPassword.value = '';
        authError.classList.remove('show');
    }

    function closeAuthOverlay() {
        authOverlay.classList.remove('active');
    }

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        updateAuthUI();
        authError.classList.remove('show');
        authEmail.value = '';
        authPassword.value = '';
    }

    function updateAuthUI() {
        if (isLoginMode) {
            authTitle.textContent = 'Masuk';
            authSub.textContent = 'Akses semua fitur AI canggih';
            authBtnText.textContent = 'Masuk';
            authSubmitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> <span id="authBtnText">Masuk</span>';
            authSwitch.innerHTML = 'Belum punya akun? <a id="authToggleLink">Daftar Sekarang</a>';
        } else {
            authTitle.textContent = 'Daftar';
            authSub.textContent = 'Buat akun untuk mulai menggunakan AI';
            authBtnText.textContent = 'Daftar';
            authSubmitBtn.innerHTML = '<i class="fas fa-user-plus"></i> <span id="authBtnText">Daftar</span>';
            authSwitch.innerHTML = 'Sudah punya akun? <a id="authToggleLink">Masuk</a>';
        }
        const toggleLink = document.querySelector('#authSwitch a');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthMode();
            });
        }
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();

        if (!email || !password) {
            authError.textContent = 'Harap isi semua bidang.';
            authError.classList.add('show');
            return;
        }
        if (!isValidEmail(email)) {
            authError.textContent = 'Format email tidak valid.';
            authError.classList.add('show');
            return;
        }
        if (password.length < 6) {
            authError.textContent = 'Kata sandi minimal 6 karakter.';
            authError.classList.add('show');
            return;
        }

        let user = null;
        if (isLoginMode) {
            user = loginUser(email, password);
            if (!user) {
                authError.textContent = 'Email atau kata sandi salah.';
                authError.classList.add('show');
                return;
            }
        } else {
            user = registerUser(email, password);
            if (!user) {
                authError.textContent = 'Email sudah terdaftar. Silakan masuk.';
                authError.classList.add('show');
                return;
            }
        }

        currentUser = user;
        closeAuthOverlay();
        showDashboard();
        window.loadTodos();
        authError.classList.remove('show');
    }

    function handleLogout() {
        logoutUser();
        currentUser = null;
        showHero();
        dashboard.classList.remove('active');
        userBadge.style.display = 'none';
        loginNavBtn.style.display = 'inline-block';
        chatbotResponse.classList.remove('show');
        summarizerResponse.classList.remove('show');
        codeGenResponse.classList.remove('show');
    }

    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        Object.keys(tabPanels).forEach(key => {
            const el = tabPanels[key];
            const isActive = (key === tabId.replace('tab', '').toLowerCase());
            el.classList.toggle('active', isActive);
        });
    }

    function startTyping() {
        const words = ['Digital Masa Depan', 'AI untuk Semua', 'Belajar & Berkarya', 'Masa Depan Digital'];
        let wordIndex = 0,
            charIndex = 0,
            isDeleting = false,
            speed = 120;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typedTextEl.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                speed = 60;
            } else {
                typedTextEl.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                speed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                speed = 1800;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 400;
            }
            setTimeout(type, speed);
        }
        type();
    }

    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];
        const COUNT = 70;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2.2 + 0.6;
                this.speedX = (Math.random() - 0.5) * 0.35;
                this.speedY = (Math.random() - 0.5) * 0.35;
                this.opacity = Math.random() * 0.6 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w) this.speedX *= -1;
                if (this.y < 0 || this.y > h) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
                gradient.addColorStop(0, `rgba(0, 229, 255, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(179, 136, 255, ${this.opacity * 0.2})`);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        for (let i = 0; i < COUNT; i++) {
            particles.push(new Particle());
        }

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update();
                p.draw(); });
            drawLines();
            requestAnimationFrame(animate);
        }
        animate();
    }

    async function handleChatbot() {
        const input = chatbotInput.value.trim();
        if (!input) {
            chatbotResponse.classList.add('show');
            chatbotResponseText.textContent = 'Silakan tulis pertanyaan terlebih dahulu.';
            return;
        }

        chatbotSendBtn.disabled = true;
        chatbotSendBtn.innerHTML = '<span class="spinner"></span> Memikirkan...';
        chatbotResponse.classList.add('show');
        chatbotResponseText.textContent = '⏳ Sedang memproses...';

        try {
            let answer = await callGemini(input);
            if (!answer) answer = getFallbackResponse(input);
            chatbotResponseText.textContent = answer;
        } catch (_) {
            chatbotResponseText.textContent = 'Maaf, terjadi gangguan. Coba lagi nanti.';
        } finally {
            chatbotSendBtn.disabled = false;
            chatbotSendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim';
        }
    }

    function showExampleQuestions() {
        const examples = [
            'Bagaimana cara membuat kue bolu yang lembut?',
            'Bantu saya mengerjakan PR matematika tentang pecahan',
            'Tips sukses wawancara kerja untuk fresh graduate',
            'Ide bisnis rumahan modal kecil',
            'Cara belajar coding dari nol',
            'Resep masakan sederhana untuk pemula',
            'Bagaimana mengatur waktu antara kerja dan kuliah?',
            'Motivasi untuk tetap semangat berwirausaha',
            'Cara menulis essay yang baik dan benar',
            'Tips berkomunikasi yang efektif di tempat kerja'
        ];
        const random = examples[Math.floor(Math.random() * examples.length)];
        chatbotInput.value = random;
        chatbotInput.focus();
        handleChatbot();
    }

    function handleSummarizer() {
        const text = summarizerInput.value.trim();
        if (!text) {
            summarizerResponse.classList.add('show');
            summarizerResponseText.textContent = 'Silakan tempel teks terlebih dahulu.';
            return;
        }
        if (text.length < 20) {
            summarizerResponse.classList.add('show');
            summarizerResponseText.textContent = 'Teks terlalu pendek. Minimal 20 karakter.';
            return;
        }

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        let points = [];
        if (sentences.length >= 3) {
            const mid = Math.floor(sentences.length / 2);
            points = [
                sentences[0]?.trim() || 'Poin pertama tidak tersedia.',
                sentences[mid]?.trim() || 'Poin kedua tidak tersedia.',
                sentences[sentences.length - 1]?.trim() || 'Poin ketiga tidak tersedia.'
            ];
        } else {
            const words = text.split(/\s+/).filter(w => w.length > 3);
            const unique = [...new Set(words)];
            const top = unique.slice(0, 6);
            points = [
                `Teks membahas tentang "${top.slice(0, 2).join(' ')}".`,
                `Topik utama: "${top.slice(2, 4).join(' ')}".`,
                `Kesimpulan: "${top.slice(4, 6).join(' ')}".`
            ];
        }

        const formatted = points.map((p, i) => `${i + 1}. ${p}`).join('\n');
        summarizerResponse.classList.add('show');
        summarizerResponseText.textContent = formatted || 'Tidak dapat merangkum teks ini.';
    }

    function handleCodeGen() {
        const input = codeGenInput.value.trim();
        if (!input) {
            codeGenResponse.classList.add('show');
            codeGenResponseText.textContent = 'Silakan deskripsikan komponen yang kamu inginkan.';
            return;
        }

        let snippet = '';
        const lower = input.toLowerCase();

        if (lower.includes('tombol') || lower.includes('button')) {
            snippet = `<button class="btn-neon">✨ Klik Saya</button>\n\n<style>\n  .btn-neon {\n    padding: 14px 36px;\n    border: none;\n    border-radius: 60px;\n    background: linear-gradient(135deg, #00e5ff, #4dabf7);\n    color: #0b0d1a;\n    font-weight: 700;\n    font-size: 1rem;\n    cursor: pointer;\n    box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);\n    transition: 0.3s;\n  }\n  .btn-neon:hover {\n    transform: scale(1.05);\n    box-shadow: 0 0 60px rgba(0, 229, 255, 0.5);\n  }\n</style>`;
        } else if (lower.includes('kartu') || lower.includes('card')) {
            snippet = `<div class="card-glass">\n  <h3>Judul Kartu</h3>\n  <p>Ini adalah kartu dengan efek glassmorphism yang elegan.</p>\n</div>\n\n<style>\n  .card-glass {\n    background: rgba(15, 20, 40, 0.65);\n    backdrop-filter: blur(18px);\n    border: 1px solid rgba(120, 180, 255, 0.15);\n    border-radius: 20px;\n    padding: 28px 30px;\n    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);\n    color: #f0f4ff;\n    max-width: 400px;\n  }\n  .card-glass h3 {\n    color: #00e5ff;\n    margin-bottom: 8px;\n  }\n</style>`;
        } else if (lower.includes('input') || lower.includes('form')) {
            snippet = `<input type="text" class="input-cyber" placeholder="Ketik di sini..." />\n\n<style>\n  .input-cyber {\n    padding: 14px 18px;\n    border-radius: 16px;\n    border: 1px solid rgba(255, 255, 255, 0.06);\n    background: rgba(255, 255, 255, 0.04);\n    color: #f0f4ff;\n    font-size: 1rem;\n    width: 100%;\n    outline: none;\n    transition: 0.3s;\n  }\n  .input-cyber:focus {\n    border-color: #00e5ff;\n    box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.08);\n  }\n</style>`;
        } else if (lower.includes('header') || lower.includes('navbar')) {
            snippet = `<nav class="navbar-cyber">\n  <div class="logo">Brand</div>\n  <ul>\n    <li><a href="#">Beranda</a></li>\n    <li><a href="#">Fitur</a></li>\n    <li><a href="#">Kontak</a></li>\n  </ul>\n</nav>\n\n<style>\n  .navbar-cyber {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 16px 40px;\n    background: rgba(11, 13, 26, 0.6);\n    backdrop-filter: blur(16px);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  }\n  .navbar-cyber .logo {\n    font-size: 1.6rem;\n    font-weight: 800;\n    color: #00e5ff;\n  }\n  .navbar-cyber ul {\n    display: flex;\n    gap: 24px;\n    list-style: none;\n  }\n  .navbar-cyber ul a {\n    color: #a0b4d9;\n    text-decoration: none;\n    transition: 0.3s;\n  }\n  .navbar-cyber ul a:hover {\n    color: #00e5ff;\n  }\n</style>`;
        } else {
            snippet = `<div class="cyber-container">\n  <h2>✨ Komponen Kustom</h2>\n  <p>Deskripsi: ${input.slice(0, 60)}</p>\n</div>\n\n<style>\n  .cyber-container {\n    padding: 32px;\n    border-radius: 20px;\n    background: rgba(15, 20, 40, 0.5);\n    border: 1px solid rgba(0, 229, 255, 0.1);\n    color: #f0f4ff;\n  }\n  .cyber-container h2 {\n    color: #b388ff;\n    margin-bottom: 8px;\n  }\n</style>`;
        }

        codeGenResponse.classList.add('show');
        codeGenResponseText.textContent = snippet;
    }

    document.addEventListener('DOMContentLoaded', init);

})();