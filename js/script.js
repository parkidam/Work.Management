// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {

    // 로그아웃 버튼 이벤트 리스너 추가
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    // 로그인 상태 확인
    checkLoginStatus();
    
    
    // 현재 URL 기반으로 메뉴 활성화
    const currentPath = window.location.pathname;
    
    // 서브메뉴 항목 확인 및 활성화
    const submenuItems = document.querySelectorAll('.submenu-item');
    submenuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (currentPath.includes(href.substring(1))) {
            // 서브메뉴 항목 활성화
            item.parentElement.classList.add('active');
            
            // 상위 드롭다운 메뉴 펼치기
            const parentCollapse = item.closest('.collapse');
            if (parentCollapse) {
                parentCollapse.classList.add('show');
                const parentToggle = document.querySelector(`[data-bs-toggle="collapse"][href="#${parentCollapse.id}"]`);
                if (parentToggle) {
                    parentToggle.setAttribute('aria-expanded', 'true');
                }
            }
        }
    });

    // 현재 날짜 표시
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('ko-KR', options);

    const currentDateEl = document.querySelector('.current-date p');
    if (currentDateEl) {
    currentDateEl.textContent = dateString;
    }

    // 드롭다운 메뉴 초기화 (Bootstrap)
    var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
    
    // 사이드바 드롭다운 메뉴 이벤트
    const sidebarDropdowns = document.querySelectorAll('#sidebar [data-bs-toggle="collapse"]');
    sidebarDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            const submenuId = this.getAttribute('href');
            const submenu = document.querySelector(submenuId);
            
            // 다른 열린 서브메뉴 닫기 (선택 사항)
            const openSubmenus = document.querySelectorAll('#sidebar .collapse.show');
            openSubmenus.forEach(menu => {
                if (menu.id !== submenuId.substring(1)) {
                    menu.classList.remove('show');
                    const toggle = document.querySelector(`[href="#${menu.id}"]`);
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });
});

// 로그아웃 함수
function logout() {
    // 로컬 스토리지에서 인증 관련 데이터 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
    
    // 세션 스토리지에서도 삭제
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userData');
    
    // 쿠키 삭제 (필요한 경우)
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // 로그인 페이지로 이동 - 상대 경로 수정
    // 현재 경로에 따라 적절한 로그인 페이지 경로 결정
    const currentPath = window.location.pathname;
    if (currentPath.includes('/html/')) {
        // html 폴더 내에 있는 경우
        window.location.href = '../html/login.html';
    } else {
        // 루트 디렉토리에 있는 경우
        window.location.href = 'html/login.html';
    }
}


/**
 * 로그인 상태를 확인하는 함수
 * localStorage 또는 sessionStorage에 저장된 로그인 정보를 확인하여
 * 로그인되지 않은 상태라면 로그인 페이지로 리다이렉트
 */
function checkLoginStatus() {
    // 로그인 페이지인 경우 확인 건너뛰기
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // localStorage 또는 sessionStorage에서 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                      sessionStorage.getItem('isLoggedIn') === 'true';
    
    // 로그인되지 않은 상태라면 로그인 페이지로 리다이렉트
    if (!isLoggedIn) {
        // 현재 경로에 따라 적절한 로그인 페이지 경로 결정
        const currentPath = window.location.pathname;
        if (currentPath.includes('/html/')) {
            // html 폴더 내에 있는 경우
            window.location.href = '../html/login.html';
        } else {
            // 루트 디렉토리에 있는 경우
            window.location.href = 'html/login.html';
        }
        return;
    }
    
    // 로그인된 사용자 정보 표시
    updateUserInfo();
}

/**
 * 로그인된 사용자 정보를 화면에 표시하는 함수
 */
function updateUserInfo() {
    // localStorage 또는 sessionStorage에서 사용자명 가져오기
    const username = localStorage.getItem('username') || sessionStorage.getItem('username') || '관리자';
    
    // 사용자명 표시 요소 찾기
    const userNameElement = document.querySelector('.user-profile .d-none.d-md-inline');
    if (userNameElement) {
        userNameElement.textContent = username;
    }
    
    // employee-management.html 페이지의 사용자 정보 표시 요소
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        userInfoElement.textContent = '사용자: ' + username;
    }
}

/**
 * 로그아웃 버튼에 이벤트 리스너를 설정하는 함수
 */
function setupLogoutButton() {
    // 로그아웃 버튼 찾기 (index.html의 버튼)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // 로그아웃 버튼 클릭 시 로그아웃 함수 호출
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // employee-management.html의 로그아웃 버튼
    const employeeLogoutBtn = document.getElementById('logoutBtn');
    if (employeeLogoutBtn) {
        employeeLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}