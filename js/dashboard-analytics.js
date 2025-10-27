/**
 * 영업 진행관리 JavaScript
 * 영업 진행 현황 조회, 상세 조회, 등록, 수정, 활동 추가 기능 구현
 */

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 현재 날짜 표시
    displayCurrentDate();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 초기 데이터 로드
    loadSalesData();
    
    // 차트 초기화
    initCharts();
});

/**
 * 현재 날짜를 표시하는 함수
 */
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
    const dateString = now.toLocaleDateString('ko-KR', options);
    document.querySelector('.current-date p').textContent = dateString;
}

/**
 * 이벤트 리스너 설정 함수
 */
function setupEventListeners() {
    // 사이드바 토글
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', function() {
        searchSalesData();
    });
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', function() {
        resetSearchForm();
    });
    
    // Excel 내보내기 버튼
    document.getElementById('exportExcelBtn').addEventListener('click', function() {
        exportToExcel();
    });
    
    // 신규 영업기회 버튼
    document.getElementById('createOpportunityBtn').addEventListener('click', function() {
        openSalesFormModal();
    });
    
    // 상세 보기 버튼들
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const salesId = this.getAttribute('data-id');
            openSalesDetailModal(salesId);
        });
    });
    
    // 수정 버튼들
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const salesId = this.getAttribute('data-id');
            openSalesFormModal(salesId);
        });
    });
    
    // 모달 내 수정 버튼
    document.getElementById('modal-edit-btn').addEventListener('click', function() {
        const salesId = document.querySelector('#salesDetailModal').getAttribute('data-sales-id');
        openSalesFormModal(salesId);
    });
    
    // 모달 내 활동 추가 버튼
    document.getElementById('modal-activity-btn').addEventListener('click', function() {
        const salesId = document.querySelector('#salesDetailModal').getAttribute('data-sales-id');
        openActivityModal(salesId);
    });
    
    // 영업 저장 버튼
    document.getElementById('save-sales-btn').addEventListener('click', function() {
        saveSalesData();
    });
    
    // 활동 저장 버튼
    document.getElementById('save-activity-btn').addEventListener('click', function() {
        saveActivityData();
    });
}

/**
 * 영업 데이터를 로드하는 함수 (실제 구현 시 API 호출로 대체)
 */
function loadSalesData() {
    // 실제 구현에서는 API 호출로 데이터를 가져와야 함
    // 현재는 이미 HTML에 하드코딩된 데이터를 사용
    console.log('영업 데이터 로드 완료');
}

/**
 * 영업 데이터를 검색하는 함수
 */
function searchSalesData() {
    const period = document.getElementById('period').value;
    const status = document.getElementById('status').value;
    const manager = document.getElementById('manager').value;
    const client = document.getElementById('client').value;
    const keyword = document.getElementById('keyword').value;
    
    console.log('검색 조건:', { period, status, manager, client, keyword });
    
    // 실제 구현에서는 API 호출로 검색 결과를 가져와야 함
    alert('검색 기능이 구현되었습니다. 실제 API 연동 필요.');
}

/**
 * 검색 폼을 초기화하는 함수
 */
function resetSearchForm() {
    document.getElementById('period').value = 'this_month';
    document.getElementById('status').value = 'all';
    document.getElementById('manager').value = 'all';
    document.getElementById('client').value = 'all';
    document.getElementById('keyword').value = '';
}

/**
 * Excel로 내보내는 함수
 */
function exportToExcel() {
    // 실제 구현에서는 서버에 요청하여 Excel 파일을 생성하고 다운로드해야 함
    alert('Excel 내보내기 기능이 구현되었습니다. 실제 API 연동 필요.');
}

/**
 * 영업 상세 모달을 여는 함수
 */
function openSalesDetailModal(salesId) {
    // 실제 구현에서는 API 호출로 해당 ID의 영업 데이터를 가져와야 함
    console.log('영업 ID:', salesId, '상세 정보 조회');
    
    // 테스트 데이터 (실제 구현 시 API 응답으로 대체)
    const salesData = {
        id: salesId,
        name: 'A사 ERP 시스템 구축',
        client: 'A전자',
        manager: '김영업',
        amount: '150,000,000원',
        stage: '제안',
        probability: '60%',
        expectedDate: '2025-12-15',
        lastContact: '2025-10-20',
        createdDate: '2025-09-15',
        updatedDate: '2025-10-20',
        description: 'A전자의 기존 ERP 시스템을 클라우드 기반으로 마이그레이션하고 신규 모듈을 추가하는 프로젝트입니다.',
        requirements: '1. 기존 데이터 마이그레이션\n2. 클라우드 환경 구축\n3. 모바일 접근성 개선\n4. 실시간 데이터 분석 기능',
        proposal: '클라우드 기반 ERP 시스템 구축 및 마이그레이션 서비스 제안. AWS 클라우드 환경에 최적화된 시스템 구성 및 모바일 앱 개발 포함.',
        activities: [
            { date: '2025-09-15', type: '미팅', content: '초기 미팅 진행, 요구사항 청취', manager: '김영업' },
            { date: '2025-09-30', type: '제안', content: '제안서 제출 및 설명', manager: '김영업' },
            { date: '2025-10-10', type: '데모', content: '시스템 데모 시연', manager: '박기술' },
            { date: '2025-10-20', type: '협상', content: '가격 및 일정 협의', manager: '김영업' }
        ],
        attachments: [
            { name: '제안서_A전자_ERP.pdf', size: '3.2MB', date: '2025-09-30' },
            { name: '시스템_구성도.pptx', size: '2.5MB', date: '2025-10-10' }
        ]
    };
    
    // 모달에 데이터 채우기
    document.querySelector('#salesDetailModal').setAttribute('data-sales-id', salesId);
    document.getElementById('modal-sales-name').textContent = salesData.name;
    document.getElementById('modal-client').textContent = salesData.client;
    document.getElementById('modal-manager').textContent = salesData.manager;
    document.getElementById('modal-amount').textContent = salesData.amount;
    document.getElementById('modal-stage').textContent = salesData.stage;
    document.getElementById('modal-probability').textContent = salesData.probability;
    document.getElementById('modal-expected-date').textContent = salesData.expectedDate;
    document.getElementById('modal-last-contact').textContent = salesData.lastContact;
    document.getElementById('modal-created-date').textContent = salesData.createdDate;
    document.getElementById('modal-updated-date').textContent = salesData.updatedDate;
    document.getElementById('modal-description').textContent = salesData.description;
    document.getElementById('modal-requirements').textContent = salesData.requirements;
    document.getElementById('modal-proposal').textContent = salesData.proposal;
    
    // 활동 이력 데이터 채우기
    const activitiesContainer = document.getElementById('modal-activities');
    activitiesContainer.innerHTML = '';
    salesData.activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.date}</td>
            <td>${activity.type}</td>
            <td>${activity.content}</td>
            <td>${activity.manager}</td>
        `;
        activitiesContainer.appendChild(row);
    });
    
    // 첨부 파일 데이터 채우기
    const attachmentsContainer = document.getElementById('modal-attachments');
    attachmentsContainer.innerHTML = '';
    salesData.attachments.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" class="attachment-link">${file.name}</a>
            <span class="text-muted ms-2">(${file.size}, ${file.date})</span>
        `;
        attachmentsContainer.appendChild(li);
    });
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('salesDetailModal'));
    modal.show();
}

/**
 * 영업 등록/수정 모달을 여는 함수
 */
function openSalesFormModal(salesId = null) {
    // 모달 제목 설정
    const modalTitle = salesId ? '영업 수정' : '신규 영업기회 등록';
    document.getElementById('salesFormModalLabel').textContent = modalTitle;
    
    // 폼 초기화
    document.getElementById('salesForm').reset();
    document.getElementById('sales-id').value = salesId || '';
    
    // 기존 데이터 로드 (수정 시)
    if (salesId) {
        // 실제 구현에서는 API 호출로 해당 ID의 영업 데이터를 가져와야 함
        console.log('영업 ID:', salesId, '데이터 로드 (수정)');
        
        // 테스트 데이터 (실제 구현 시 API 응답으로 대체)
        const salesData = {
            id: salesId,
            name: 'A사 ERP 시스템 구축',
            client: 'A',
            manager: 'kim',
            amount: 150000000,
            stage: 'proposal',
            probability: 60,
            expectedDate: '2025-12-15',
            description: 'A전자의 기존 ERP 시스템을 클라우드 기반으로 마이그레이션하고 신규 모듈을 추가하는 프로젝트입니다.',
            requirements: '1. 기존 데이터 마이그레이션\n2. 클라우드 환경 구축\n3. 모바일 접근성 개선\n4. 실시간 데이터 분석 기능',
            proposal: '클라우드 기반 ERP 시스템 구축 및 마이그레이션 서비스 제안. AWS 클라우드 환경에 최적화된 시스템 구성 및 모바일 앱 개발 포함.'
        };
        
        // 폼에 데이터 채우기
        document.getElementById('sales-name').value = salesData.name;
        document.getElementById('sales-client').value = salesData.client;
        document.getElementById('sales-manager').value = salesData.manager;
        document.getElementById('sales-amount').value = salesData.amount;
        document.getElementById('sales-stage').value = salesData.stage;
        document.getElementById('sales-probability').value = salesData.probability;
        document.getElementById('sales-expected-date').value = salesData.expectedDate;
        document.getElementById('sales-description').value = salesData.description;
        document.getElementById('sales-requirements').value = salesData.requirements;
        document.getElementById('sales-proposal').value = salesData.proposal;
    } else {
        // 신규 등록 시 기본값 설정
        document.getElementById('sales-stage').value = 'lead';
        document.getElementById('sales-probability').value = 10;
        document.getElementById('sales-expected-date').value = new Date().toISOString().split('T')[0];
    }
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('salesFormModal'));
    modal.show();
}

/**
 * 활동 추가 모달을 여는 함수
 */
function openActivityModal(salesId) {
    // 폼 초기화
    document.getElementById('activityForm').reset();
    document.getElementById('activity-sales-id').value = salesId;
    
    // 기본값 설정
    document.getElementById('activity-date').value = new Date().toISOString().split('T')[0];
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('activityModal'));
    modal.show();
}

/**
 * 영업 데이터를 저장하는 함수
 */
function saveSalesData() {
    // 폼 유효성 검사
    const form = document.getElementById('salesForm');
    if (!validateForm('salesForm')) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 영업 데이터 수집
    const salesId = document.getElementById('sales-id').value;
    const salesData = {
        id: salesId || null,
        name: document.getElementById('sales-name').value,
        client: document.getElementById('sales-client').value,
        manager: document.getElementById('sales-manager').value,
        amount: document.getElementById('sales-amount').value,
        stage: document.getElementById('sales-stage').value,
        probability: document.getElementById('sales-probability').value,
        expectedDate: document.getElementById('sales-expected-date').value,
        description: document.getElementById('sales-description').value,
        requirements: document.getElementById('sales-requirements').value,
        proposal: document.getElementById('sales-proposal').value
    };
    
    console.log('저장할 영업 데이터:', salesData);
    
    // 실제 구현에서는 API 호출로 데이터를 서버에 저장해야 함
    alert(`영업 데이터가 ${salesId ? '수정' : '등록'}되었습니다. 실제 API 연동 필요.`);
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('salesFormModal'));
    modal.hide();
    
    // 페이지 새로고침 (실제 구현에서는 필요에 따라 조정)
    // location.reload();
}

/**
 * 활동 데이터를 저장하는 함수
 */
function saveActivityData() {
    // 폼 유효성 검사
    if (!validateForm('activityForm')) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 활동 데이터 수집
    const activityData = {
        salesId: document.getElementById('activity-sales-id').value,
        date: document.getElementById('activity-date').value,
        type: document.getElementById('activity-type').value,
        content: document.getElementById('activity-content').value,
        manager: document.getElementById('activity-manager').value
    };
    
    console.log('저장할 활동 데이터:', activityData);
    
    // 실제 구현에서는 API 호출로 데이터를 서버에 저장해야 함
    alert('활동이 추가되었습니다. 실제 API 연동 필요.');
    
    // 모달 닫기
    const activityModal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
    activityModal.hide();
    
    // 영업 상세 모달 업데이트 (실제 구현에서는 API로 새로운 데이터를 가져와서 업데이트)
    const salesId = activityData.salesId;
    
    // 임시로 활동 추가 (실제 구현에서는 API 응답으로 대체)
    const newActivity = document.createElement('tr');
    newActivity.innerHTML = `
        <td>${activityData.date}</td>
        <td>${getActivityTypeName(activityData.type)}</td>
        <td>${activityData.content}</td>
        <td>${getManagerName(activityData.manager)}</td>
    `;
    document.getElementById('modal-activities').appendChild(newActivity);
    
    // 최종 접촉일 업데이트
    document.getElementById('modal-last-contact').textContent = activityData.date;
}

/**
 * 활동 유형 코드를 이름으로 변환하는 함수
 */
function getActivityTypeName(typeCode) {
    const types = {
        'call': '전화',
        'email': '이메일',
        'meeting': '미팅',
        'proposal': '제안',
        'negotiation': '협상',
        'demo': '데모',
        'etc': '기타'
    };
    return types[typeCode] || typeCode;
}

/**
 * 담당자 코드를 이름으로 변환하는 함수
 */
function getManagerName(managerCode) {
    const managers = {
        'kim': '김영업',
        'park': '박영업',
        'lee': '이영업'
    };
    return managers[managerCode] || managerCode;
}

/**
 * 폼 유효성 검사 함수
 */
function validateForm(formId) {
    const form = document.getElementById(formId);
    const requiredElements = form.querySelectorAll('[required]');
    
    for (const element of requiredElements) {
        if (!element.value.trim()) {
            element.focus();
            return false;
        }
    }
    
    return true;
}

/**
 * 차트를 초기화하는 함수
 */
function initCharts() {
    // 실제 구현에서는 Chart.js 등의 라이브러리를 사용하여 차트 구현
    console.log('차트 초기화 (미구현)');
}