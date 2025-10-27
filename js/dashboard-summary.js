/**
 * 사업계획 진행관리 페이지 JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 토글 버튼 설정
    const sidebarCollapseBtn = document.getElementById('sidebarCollapse');
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // 로그인 상태 확인
    checkLoginStatus();
    
    // 현재 날짜 표시
    updateCurrentDate();
    
    // 검색 버튼 이벤트 리스너
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchBusinessPlans);
    }
    
    // 초기화 버튼 이벤트 리스너
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSearchForm);
    }
    
    // 신규 사업계획 버튼 이벤트 리스너
    const addPlanBtn = document.getElementById('addPlanBtn');
    if (addPlanBtn) {
        addPlanBtn.addEventListener('click', showAddPlanModal);
    }
    
    // 상세보기 버튼 이벤트 리스너 설정
    setupViewButtons();
    
    // 수정 버튼 이벤트 리스너 설정
    setupEditButtons();
    
    // 모달 내 진행률 슬라이더 이벤트
    const progressSlider = document.getElementById('plan-progress');
    if (progressSlider) {
        progressSlider.addEventListener('input', function() {
            document.getElementById('progress-value').textContent = this.value + '%';
        });
    }
    
    // 마일스톤 추가 버튼 이벤트 리스너
    const addMilestoneBtn = document.getElementById('add-milestone-btn');
    if (addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', addMilestoneField);
    }
    
    // 이슈 추가 버튼 이벤트 리스너
    const addIssueBtn = document.getElementById('add-issue-btn');
    if (addIssueBtn) {
        addIssueBtn.addEventListener('click', addIssueField);
    }
    
    // 저장 버튼 이벤트 리스너
    const savePlanBtn = document.getElementById('save-plan-btn');
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', savePlan);
    }
    
    // 마일스톤 삭제 버튼 이벤트 리스너 설정
    setupRemoveButtons();
    
    // 모달 내 수정 버튼 이벤트 리스너
    const modalEditBtn = document.getElementById('modal-edit-btn');
    if (modalEditBtn) {
        modalEditBtn.addEventListener('click', function() {
            // 상세 모달 닫기
            const detailModal = bootstrap.Modal.getInstance(document.getElementById('planDetailModal'));
            detailModal.hide();
            
            // 수정 모달 열기 (데이터 로드 후)
            const planId = this.getAttribute('data-id');
            editBusinessPlan(planId);
        });
    }
});

/**
 * 현재 날짜를 표시하는 함수
 */
function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('ko-KR', options);
    
    const currentDateEl = document.querySelector('.current-date p');
    if (currentDateEl) {
        currentDateEl.textContent = dateString;
    }
}

/**
 * 사업계획 검색 함수
 */
function searchBusinessPlans() {
    const year = document.getElementById('year').value;
    const quarter = document.getElementById('quarter').value;
    const department = document.getElementById('department').value;
    const status = document.getElementById('status').value;
    const keyword = document.getElementById('keyword').value;
    
    console.log('검색 조건:', { year, quarter, department, status, keyword });
    
    // 실제 구현 시에는 API 호출로 데이터를 가져와 테이블을 업데이트
    // 현재는 콘솔에 검색 조건만 출력
    alert('검색 기능이 구현될 예정입니다.');
}

/**
 * 검색 폼 초기화 함수
 */
function resetSearchForm() {
    document.getElementById('year').value = '2025';
    document.getElementById('quarter').value = 'all';
    document.getElementById('department').value = 'all';
    document.getElementById('status').value = 'all';
    document.getElementById('keyword').value = '';
}

/**
 * 신규 사업계획 모달 표시 함수
 */
function showAddPlanModal() {
    // 폼 초기화
    document.getElementById('planForm').reset();
    document.getElementById('plan-id').value = '';
    document.getElementById('planFormModalLabel').textContent = '사업계획 등록';
    
    // 현재 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('plan-start-date').value = today;
    
    // 기본 마일스톤 하나만 남기고 초기화
    const milestonesContainer = document.getElementById('milestones-container');
    milestonesContainer.innerHTML = `
        <div class="milestone-item row mb-3">
            <div class="col-md-3">
                <input type="text" class="form-control milestone-name" placeholder="단계명">
            </div>
            <div class="col-md-3">
                <input type="date" class="form-control milestone-start">
            </div>
            <div class="col-md-3">
                <input type="date" class="form-control milestone-end">
            </div>
            <div class="col-md-2">
                <select class="form-select milestone-status">
                    <option value="planning">계획</option>
                    <option value="progress">진행 중</option>
                    <option value="completed">완료</option>
                    <option value="delayed">지연</option>
                </select>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-milestone">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // 기본 이슈 하나만 남기고 초기화
    const issuesContainer = document.getElementById('issues-container');
    issuesContainer.innerHTML = `
        <div class="issue-item row mb-2">
            <div class="col-md-11">
                <input type="text" class="form-control issue-text" placeholder="이슈 또는 리스크 사항">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-issue">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // 삭제 버튼 이벤트 리스너 다시 설정
    setupRemoveButtons();
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('planFormModal'));
    modal.show();
}

/**
 * 사업계획 상세 정보 표시 함수
 */
function viewBusinessPlan(planId) {
    console.log('사업계획 상세 보기:', planId);
    
    // 실제 구현 시에는 API 호출로 데이터를 가져옴
    // 현재는 테스트 데이터로 모달 채우기
    let planData;
    
    // 테스트 데이터 (실제로는 API에서 가져옴)
    if (planId === '1') {
        planData = {
            id: '1',
            name: 'A사 ERP 시스템 구축',
            department: '개발부',
            manager: '김개발',
            startDate: '2025-01-15',
            endDate: '2025-06-30',
            period: '2025.01.15 ~ 2025.06.30',
            budget: '320,000,000원',
            progress: '75%',
            status: '<span class="badge bg-success">진행 중</span>',
            lastUpdate: '2025-10-25',
            description: 'A사의 ERP 시스템 구축 프로젝트로, 회계, 인사, 생산, 영업 모듈을 포함합니다. 현재 설계 단계를 완료하고 개발 단계를 진행 중입니다.',
            milestones: [
                { stage: '요구사항 분석', startDate: '2025-01-15', endDate: '2025-02-15', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '설계', startDate: '2025-02-16', endDate: '2025-03-31', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '개발', startDate: '2025-04-01', endDate: '2025-05-15', progress: '50%', status: '<span class="badge bg-success">진행 중</span>' },
                { stage: '테스트', startDate: '2025-05-16', endDate: '2025-06-15', progress: '0%', status: '<span class="badge bg-secondary">예정</span>' },
                { stage: '배포', startDate: '2025-06-16', endDate: '2025-06-30', progress: '0%', status: '<span class="badge bg-secondary">예정</span>' }
            ],
            issues: [
                '클라이언트 측 담당자 변경으로 인한 요구사항 추가 검토 필요',
                '레거시 시스템 데이터 마이그레이션 이슈 발생',
                '인사 모듈 개발 지연 가능성 있음'
            ]
        };
    } else if (planId === '2') {
        planData = {
            id: '2',
            name: 'B사 웹사이트 리뉴얼',
            department: '개발부',
            manager: '박웹개발',
            startDate: '2025-02-01',
            endDate: '2025-04-30',
            period: '2025.02.01 ~ 2025.04.30',
            budget: '85,000,000원',
            progress: '100%',
            status: '<span class="badge bg-primary">완료</span>',
            lastUpdate: '2025-05-02',
            description: 'B사 기업 웹사이트 리뉴얼 프로젝트입니다. 반응형 웹 디자인을 적용하고 최신 트렌드에 맞게 UI/UX를 개선했습니다.',
            milestones: [
                { stage: '기획 및 요구사항 분석', startDate: '2025-02-01', endDate: '2025-02-15', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '디자인', startDate: '2025-02-16', endDate: '2025-03-15', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '개발', startDate: '2025-03-16', endDate: '2025-04-15', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '테스트 및 배포', startDate: '2025-04-16', endDate: '2025-04-30', progress: '100%', status: '<span class="badge bg-primary">완료</span>' }
            ],
            issues: [
                '초기 디자인 시안 수정 요청으로 일정 지연 있었으나 만회함',
                '모바일 최적화 과정에서 추가 작업 발생'
            ]
        };
    } else if (planId === '3') {
        planData = {
            id: '3',
            name: 'C그룹 그룹웨어 고도화',
            department: '개발부',
            manager: '이시스템',
            startDate: '2025-03-10',
            endDate: '2025-07-15',
            period: '2025.03.10 ~ 2025.07.15',
            budget: '210,000,000원',
            progress: '40%',
            status: '<span class="badge bg-danger">지연</span>',
            lastUpdate: '2025-10-20',
            description: 'C그룹의 기존 그룹웨어 시스템을 고도화하는 프로젝트입니다. 전자결재, 일정관리, 커뮤니케이션 기능을 개선하고 모바일 지원을 강화합니다.',
            milestones: [
                { stage: '요구사항 분석', startDate: '2025-03-10', endDate: '2025-03-31', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '설계', startDate: '2025-04-01', endDate: '2025-04-30', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '개발 1차', startDate: '2025-05-01', endDate: '2025-05-31', progress: '70%', status: '<span class="badge bg-danger">지연</span>' },
                { stage: '개발 2차', startDate: '2025-06-01', endDate: '2025-06-30', progress: '0%', status: '<span class="badge bg-secondary">예정</span>' },
                { stage: '테스트 및 배포', startDate: '2025-07-01', endDate: '2025-07-15', progress: '0%', status: '<span class="badge bg-secondary">예정</span>' }
            ],
            issues: [
                '클라이언트 내부 의사결정 지연으로 개발 일정 지연',
                '기존 시스템 연동 과정에서 예상치 못한 이슈 발생',
                '개발 인력 부족으로 추가 인력 투입 필요',
                '일정 만회를 위한 계획 수립 중'
            ]
        };
    } else {
        // 기본 데이터
        planData = {
            id: planId,
            name: '사업계획 ' + planId,
            department: '개발부',
            manager: '담당자',
            period: '2025.01.01 ~ 2025.12.31',
            budget: '100,000,000원',
            progress: '50%',
            status: '<span class="badge bg-success">진행 중</span>',
            lastUpdate: '2025-10-27',
            description: '사업 개요 내용입니다.',
            milestones: [
                { stage: '계획', startDate: '2025-01-01', endDate: '2025-01-31', progress: '100%', status: '<span class="badge bg-primary">완료</span>' },
                { stage: '실행', startDate: '2025-02-01', endDate: '2025-06-30', progress: '50%', status: '<span class="badge bg-success">진행 중</span>' },
                { stage: '완료', startDate: '2025-07-01', endDate: '2025-12-31', progress: '0%', status: '<span class="badge bg-secondary">예정</span>' }
            ],
            issues: [
                '이슈 사항 1',
                '이슈 사항 2'
            ]
        };
    }
    
    // 모달에 데이터 채우기
    document.getElementById('modal-project-name').textContent = planData.name;
    document.getElementById('modal-department').textContent = planData.department;
    document.getElementById('modal-manager').textContent = planData.manager;
    document.getElementById('modal-period').textContent = planData.period;
    document.getElementById('modal-budget').textContent = planData.budget;
    document.getElementById('modal-progress').textContent = planData.progress;
    document.getElementById('modal-status').innerHTML = planData.status;
    document.getElementById('modal-last-update').textContent = planData.lastUpdate;
    document.getElementById('modal-description').textContent = planData.description;
    
    // 마일스톤 테이블 채우기
    let milestonesHTML = '';
    planData.milestones.forEach(milestone => {
        milestonesHTML += `
            <tr>
                <td>${milestone.stage}</td>
                <td>${milestone.startDate}</td>
                <td>${milestone.endDate}</td>
                <td>${milestone.progress}</td>
                <td>${milestone.status}</td>
            </tr>
        `;
    });
    document.getElementById('modal-milestones').innerHTML = milestonesHTML;
    
    // 이슈 목록 채우기
    let issuesHTML = '';
    planData.issues.forEach(issue => {
        issuesHTML += `<li>${issue}</li>`;
    });
    document.getElementById('modal-issues').innerHTML = issuesHTML;
    
    // 수정 버튼에 ID 설정
    document.getElementById('modal-edit-btn').setAttribute('data-id', planId);
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('planDetailModal'));
    modal.show();
}

/**
 * 사업계획 수정 모달 표시 함수
 */
function editBusinessPlan(planId) {
    console.log('사업계획 수정:', planId);
    
    // 실제 구현 시에는 API 호출로 데이터를 가져옴
    // 현재는 테스트 데이터로 모달 채우기
    
    // 모달 타이틀 변경
    document.getElementById('planFormModalLabel').textContent = '사업계획 수정';
    
    // ID 설정
    document.getElementById('plan-id').value = planId;
    
    // 테스트 데이터 (실제로는 API에서 가져옴)
    let planData;
    if (planId === '1') {
        planData = {
            name: 'A사 ERP 시스템 구축',
            department: 'development',
            manager: '김개발',
            startDate: '2025-01-15',
            endDate: '2025-06-30',
            budget: 320000000,
            status: 'progress',
            progress: 75,
            description: 'A사의 ERP 시스템 구축 프로젝트로, 회계, 인사, 생산, 영업 모듈을 포함합니다. 현재 설계 단계를 완료하고 개발 단계를 진행 중입니다.',
            milestones: [
                { name: '요구사항 분석', startDate: '2025-01-15', endDate: '2025-02-15', status: 'completed' },
                { name: '설계', startDate: '2025-02-16', endDate: '2025-03-31', status: 'completed' },
                { name: '개발', startDate: '2025-04-01', endDate: '2025-05-15', status: 'progress' },
                { name: '테스트', startDate: '2025-05-16', endDate: '2025-06-15', status: 'planning' },
                { name: '배포', startDate: '2025-06-16', endDate: '2025-06-30', status: 'planning' }
            ],
            issues: [
                '클라이언트 측 담당자 변경으로 인한 요구사항 추가 검토 필요',
                '레거시 시스템 데이터 마이그레이션 이슈 발생',
                '인사 모듈 개발 지연 가능성 있음'
            ]
        };
    } else {
        // 기본 데이터
        planData = {
            name: '사업계획 ' + planId,
            department: 'development',
            manager: '담당자',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            budget: 100000000,
            status: 'progress',
            progress: 50,
            description: '사업 개요 내용입니다.',
            milestones: [
                { name: '계획', startDate: '2025-01-01', endDate: '2025-01-31', status: 'completed' },
                { name: '실행', startDate: '2025-02-01', endDate: '2025-06-30', status: 'progress' },
                { name: '완료', startDate: '2025-07-01', endDate: '2025-12-31', status: 'planning' }
            ],
            issues: [
                '이슈 사항 1',
                '이슈 사항 2'
            ]
        };
    }
    
    // 폼에 데이터 채우기
    document.getElementById('plan-name').value = planData.name;
    document.getElementById('plan-department').value = planData.department;
    document.getElementById('plan-manager').value = planData.manager;
    document.getElementById('plan-start-date').value = planData.startDate;
    document.getElementById('plan-end-date').value = planData.endDate;
    document.getElementById('plan-budget').value = planData.budget;
    document.getElementById('plan-status').value = planData.status;
    document.getElementById('plan-progress').value = planData.progress;
    document.getElementById('progress-value').textContent = planData.progress + '%';
    document.getElementById('plan-description').value = planData.description;
    
    // 마일스톤 필드 생성
    const milestonesContainer = document.getElementById('milestones-container');
    milestonesContainer.innerHTML = '';
    
    planData.milestones.forEach((milestone, index) => {
        const milestoneHTML = `
            <div class="milestone-item row mb-3">
                <div class="col-md-3">
                    <input type="text" class="form-control milestone-name" placeholder="단계명" value="${milestone.name}">
                </div>
                <div class="col-md-3">
                    <input type="date" class="form-control milestone-start" value="${milestone.startDate}">
                </div>
                <div class="col-md-3">
                    <input type="date" class="form-control milestone-end" value="${milestone.endDate}">
                </div>
                <div class="col-md-2">
                    <select class="form-select milestone-status">
                        <option value="planning" ${milestone.status === 'planning' ? 'selected' : ''}>계획</option>
                        <option value="progress" ${milestone.status === 'progress' ? 'selected' : ''}>진행 중</option>
                        <option value="completed" ${milestone.status === 'completed' ? 'selected' : ''}>완료</option>
                        <option value="delayed" ${milestone.status === 'delayed' ? 'selected' : ''}>지연</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-milestone">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        milestonesContainer.insertAdjacentHTML('beforeend', milestoneHTML);
    });
    
    // 이슈 필드 생성
    const issuesContainer = document.getElementById('issues-container');
    issuesContainer.innerHTML = '';
    
    planData.issues.forEach((issue, index) => {
        const issueHTML = `
            <div class="issue-item row mb-2">
                <div class="col-md-11">
                    <input type="text" class="form-control issue-text" placeholder="이슈 또는 리스크 사항" value="${issue}">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-issue">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        issuesContainer.insertAdjacentHTML('beforeend', issueHTML);
    });
    
    // 삭제 버튼 이벤트 리스너 다시 설정
    setupRemoveButtons();
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('planFormModal'));
    modal.show();
}

/**
 * 마일스톤 입력 필드 추가 함수
 */
function addMilestoneField() {
    const milestonesContainer = document.getElementById('milestones-container');
    const milestoneHTML = `
        <div class="milestone-item row mb-3">
            <div class="col-md-3">
                <input type="text" class="form-control milestone-name" placeholder="단계명">
            </div>
            <div class="col-md-3">
                <input type="date" class="form-control milestone-start">
            </div>
            <div class="col-md-3">
                <input type="date" class="form-control milestone-end">
            </div>
            <div class="col-md-2">
                <select class="form-select milestone-status">
                    <option value="planning">계획</option>
                    <option value="progress">진행 중</option>
                    <option value="completed">완료</option>
                    <option value="delayed">지연</option>
                </select>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-milestone">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    milestonesContainer.insertAdjacentHTML('beforeend', milestoneHTML);
    
    // 새로 추가된 삭제 버튼에 이벤트 리스너 설정
    const newMilestoneItem = milestonesContainer.lastElementChild;
    const removeBtn = newMilestoneItem.querySelector('.remove-milestone');
    removeBtn.addEventListener('click', function() {
        this.closest('.milestone-item').remove();
    });
}

/**
 * 이슈 입력 필드 추가 함수
 */
function addIssueField() {
    const issuesContainer = document.getElementById('issues-container');
    const issueHTML = `
        <div class="issue-item row mb-2">
            <div class="col-md-11">
                <input type="text" class="form-control issue-text" placeholder="이슈 또는 리스크 사항">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-issue">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    issuesContainer.insertAdjacentHTML('beforeend', issueHTML);
    
    // 새로 추가된 삭제 버튼에 이벤트 리스너 설정
    const newIssueItem = issuesContainer.lastElementChild;
    const removeBtn = newIssueItem.querySelector('.remove-issue');
    removeBtn.addEventListener('click', function() {
        this.closest('.issue-item').remove();
    });
}

/**
 * 삭제 버튼 이벤트 리스너 설정 함수
 */
function setupRemoveButtons() {
    // 마일스톤 삭제 버튼
    const removeMilestoneButtons = document.querySelectorAll('.remove-milestone');
    removeMilestoneButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.milestone-item').remove();
        });
    });
    
    // 이슈 삭제 버튼
    const removeIssueButtons = document.querySelectorAll('.remove-issue');
    removeIssueButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.issue-item').remove();
        });
    });
}

/**
 * 상세보기 버튼 이벤트 리스너 설정 함수
 */
function setupViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planId = this.getAttribute('data-id');
            viewBusinessPlan(planId);
        });
    });
}

/**
 * 수정 버튼 이벤트 리스너 설정 함수
 */
function setupEditButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planId = this.getAttribute('data-id');
            editBusinessPlan(planId);
        });
    });
}

/**
 * 사업계획 저장 함수
 */
function savePlan() {
    // 폼 데이터 수집
    const planId = document.getElementById('plan-id').value;
    const planName = document.getElementById('plan-name').value;
    const department = document.getElementById('plan-department').value;
    const manager = document.getElementById('plan-manager').value;
    const startDate = document.getElementById('plan-start-date').value;
    const endDate = document.getElementById('plan-end-date').value;
    const budget = document.getElementById('plan-budget').value;
    const status = document.getElementById('plan-status').value;
    const progress = document.getElementById('plan-progress').value;
    const description = document.getElementById('plan-description').value;
    
    // 마일스톤 데이터 수집
    const milestones = [];
    const milestoneItems = document.querySelectorAll('.milestone-item');
    milestoneItems.forEach(item => {
        const name = item.querySelector('.milestone-name').value;
        const startDate = item.querySelector('.milestone-start').value;
        const endDate = item.querySelector('.milestone-end').value;
        const status = item.querySelector('.milestone-status').value;
        
        if (name) {  // 이름이 있는 경우만 추가
            milestones.push({ name, startDate, endDate, status });
        }
    });
    
    // 이슈 데이터 수집
    const issues = [];
    const issueItems = document.querySelectorAll('.issue-item');
    issueItems.forEach(item => {
        const text = item.querySelector('.issue-text').value;
        if (text) {  // 텍스트가 있는 경우만 추가
            issues.push(text);
        }
    });
    
    // 데이터 유효성 검사
    if (!planName) {
        alert('사업명을 입력하세요.');
        return;
    }
    
    if (!department) {
        alert('담당 부서를 선택하세요.');
        return;
    }
    
    if (!manager) {
        alert('담당자를 입력하세요.');
        return;
    }
    
    if (!startDate || !endDate) {
        alert('시작일과 종료일을 입력하세요.');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('종료일은 시작일보다 이후여야 합니다.');
        return;
    }
    
    if (!budget) {
        alert('예산을 입력하세요.');
        return;
    }
    
    // 데이터 객체 생성
    const planData = {
        id: planId,
        name: planName,
        department,
        manager,
        startDate,
        endDate,
        budget,
        status,
        progress,
        description,
        milestones,
        issues
    };
    
    console.log('저장할 사업계획 데이터:', planData);
    
    // 실제 구현 시에는 API 호출로 데이터 저장
    // 현재는 콘솔에 데이터만 출력하고 성공 메시지 표시
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('planFormModal'));
    modal.hide();
    
    // 성공 메시지
    alert('사업계획이 저장되었습니다. (실제 저장은 구현 예정)');
}