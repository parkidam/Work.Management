document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const registerAlert = document.getElementById('register-alert');
    const registerSuccess = document.getElementById('register-success');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 알림 초기화
            if (registerAlert) registerAlert.style.display = 'none';
            if (registerSuccess) registerSuccess.style.display = 'none';
            
            // 입력값 가져오기
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const name = document.getElementById('name').value;
            
            // 유효성 검사
            if (password !== confirmPassword) {
                if (registerAlert) {
                    registerAlert.textContent = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
                    registerAlert.style.display = 'block';
                } else {
                    alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                }
                return;
            }
            
            try {
                // 서버에 회원가입 요청
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, name })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 회원가입 성공
                    if (registerSuccess) {
                        registerSuccess.style.display = 'block';
                        registerForm.reset();
                        
                        // 2초 후 로그인 페이지로 이동
                        setTimeout(() => {
                            window.location.href = '/html/login.html';
                        }, 2000);
                    } else {
                        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
                        window.location.href = '/html/login.html';
                    }
                } else {
                    // 회원가입 실패
                    if (registerAlert) {
                        registerAlert.textContent = data.message || '회원가입 중 오류가 발생했습니다.';
                        registerAlert.style.display = 'block';
                    } else {
                        alert(data.message || '회원가입 중 오류가 발생했습니다.');
                    }
                }
            } catch (error) {
                console.error('회원가입 오류:', error);
                if (registerAlert) {
                    registerAlert.textContent = '서버 연결 중 오류가 발생했습니다.';
                    registerAlert.style.display = 'block';
                } else {
                    alert('서버 연결 중 오류가 발생했습니다.');
                }
            }
        });
    }
});