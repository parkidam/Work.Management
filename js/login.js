document.addEventListener('DOMContentLoaded', function() {
    console.log('로그인 페이지 로드됨');
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('로그인 폼 찾음');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('로그인 폼 제출됨');
            
            // 로그인 알림 초기화
            const loginAlert = document.getElementById('login-alert');
            if (loginAlert) {
                loginAlert.style.display = 'none';
            }
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            console.log('로그인 시도:', { username, rememberMe });
            
            try {
                // 서버에 로그인 요청
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('로그인 응답 상태:', response.status);
                
                const data = await response.json();
                console.log('로그인 응답 데이터:', data);
                
                if (response.ok) {
                    // 로그인 성공
                    // JWT 토큰 저장
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('token', data.token);
                    storage.setItem('isLoggedIn', 'true');
                    storage.setItem('username', data.user.username);
                    storage.setItem('userData', JSON.stringify(data.user));
                    
                    console.log('로그인 성공, 리다이렉트 중...');
                    
                    // 대시보드로 이동
                    window.location.href = '/index.html';
                } else {
                    // 로그인 실패
                    console.error('로그인 실패:', data.message);
                    
                    if (loginAlert) {
                        loginAlert.textContent = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
                        loginAlert.style.display = 'block';
                    } else {
                        alert(data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
                    }
                }
            } catch (error) {
                console.error('로그인 오류:', error);
                
                if (loginAlert) {
                    loginAlert.textContent = '서버 연결 중 오류가 발생했습니다.';
                    loginAlert.style.display = 'block';
                } else {
                    alert('서버 연결 중 오류가 발생했습니다.');
                }
                
                // 개발 환경에서 임시 로그인 처리 (실제 운영에서는 제거)
                if (username === 'admin') {
                    console.log('개발 모드: 임시 로그인 처리');
                    
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('token', 'dev-token-' + Date.now());
                    storage.setItem('isLoggedIn', 'true');
                    storage.setItem('username', username);
                    storage.setItem('userData', JSON.stringify({
                        id: 1,
                        username: username,
                        name: '관리자',
                        role: 'admin'
                    }));
                    
                    // 대시보드로 이동
                    window.location.href = '/index.html';
                }
            }
        });
    } else {
        console.error('로그인 폼을 찾을 수 없음');
    }
    
    // 이미 로그인되어 있는 경우 대시보드로 리다이렉션
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn && window.location.pathname.includes('login.html')) {
        console.log('이미 로그인됨, 리다이렉트 중...');
        window.location.href = '/index.html';
    }
});