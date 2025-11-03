/**
 * 영업 기회 관리 페이지 JavaScript
 * 
 * 이 파일은 영업 기회 관리 페이지의 기능을 구현합니다.
 * - 영업 기회 목록 조회 및 필터링
 * - 영업 기회 등록/수정/삭제
 * - 영업 기회 상세 조회
 * - 영업 활동 추가
 * - 영업 기회 내보내기
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 현재 날짜 표시
    displayCurrentDate();
    
    // 사이드바 토글 기능 설정
    setupSidebar();

    // 사이드바 토글 기능
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // 영업 기회 검색 기능
    const opportunitySearchButton = document.getElementById('opportunitySearchButton');
    if (opportunitySearchButton) {
        opportunitySearchButton.addEventListener('click', searchOpportunities);
    }

    // 엔터키로 검색
    const opportunitySearchInput = document.getElementById('opportunitySearchInput');
    if (opportunitySearchInput) {
        opportunitySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchOpportunities();
            }
        });
    }

    // 영업 기회 상태 필터 변경 이벤트
    const opportunityStatusFilter = document.getElementById('opportunityStatusFilter');
    if (opportunityStatusFilter) {
        opportunityStatusFilter.addEventListener('change', filterOpportunitiesByStatus);
    }

    // 영업 기회 등록 버튼 이벤트
    const saveOpportunityBtn = document.getElementById('saveOpportunityBtn');
    if (saveOpportunityBtn) {
        saveOpportunityBtn.addEventListener('click', saveOpportunity);
    }

    // 영업 기회 내보내기 버튼 이벤트
    const exportOpportunityBtn = document.getElementById('exportOpportunityBtn');
    if (exportOpportunityBtn) {
        exportOpportunityBtn.addEventListener('click', exportOpportunities);
    }

    // 활동 추가 버튼 이벤트
    const addActivityBtn = document.getElementById('addActivityBtn');
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', showAddActivityModal);
    }

    // 활동 저장 버튼 이벤트
    const saveActivityBtn = document.getElementById('saveActivityBtn');
    if (saveActivityBtn) {
        saveActivityBtn.addEventListener('click', saveActivity);
    }

    // 견적서 작성 버튼 이벤트
    const createQuotationBtn = document.getElementById('createQuotationBtn');
    if (createQuotationBtn) {
        createQuotationBtn.addEventListener('click', createQuotation);
    }

    // 영업 기회 상세 조회 버튼 이벤트
    setupViewOpportunityButtons();

    // 영업 기회 수정 버튼 이벤트
    setupEditOpportunityButtons();

    // 영업 기회 삭제 버튼 이벤트
    setupDeleteOpportunityButtons();

    // 현재 날짜를 예상 성사일 기본값으로 설정
    const expectedCloseDateInput = document.getElementById('expectedCloseDate');
    if (expectedCloseDateInput) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + 3); // 기본값으로 3개월 후 설정
        const formattedDate = futureDate.toISOString().substr(0, 10);
        expectedCloseDateInput.value = formattedDate;
    }
});

/**
 * 영업 기회 검색 함수
 */
function searchOpportunities() {
    const searchInput = document.getElementById('opportunitySearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('opportunityStatusFilter').value;
    
    const tableRows = document.querySelectorAll('#opportunityTable tbody tr');
    
    tableRows.forEach(row => {
        const opportunityName = row.cells[1].textContent.toLowerCase();
        const clientName = row.cells[2].textContent.toLowerCase();
        const assignedTo = row.cells[3].textContent.toLowerCase();
        const stage = row.cells[6].textContent.toLowerCase();
        
        // 검색어와 상태 필터 모두 적용
        const matchesSearch = opportunityName.includes(searchInput) || 
                             clientName.includes(searchInput) || 
                             assignedTo.includes(searchInput);
                             
        const matchesStatus = statusFilter === 'all' || stage.includes(statusFilter);
        
        // 두 조건 모두 만족할 때만 표시
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 영업 기회 상태별 필터링 함수
 */
function filterOpportunitiesByStatus() {
    const statusFilter = document.getElementById('opportunityStatusFilter').value;
    const tableRows = document.querySelectorAll('#opportunityTable tbody tr');
    
    if (statusFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    tableRows.forEach(row => {
        const stage = row.cells[6].textContent.toLowerCase();
        if (stage.includes(statusFilter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 영업 기회 등록/수정 저장 함수
 */
function saveOpportunity() {
    // 폼 유효성 검사
    if (!validateOpportunityForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('영업 기회가 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addOpportunityModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addOpportunityToTable();
}

/**
 * 영업 기회 폼 유효성 검사 함수
 */
function validateOpportunityForm() {
    const requiredFields = [
        'opportunityName',
        'clientCompany',
        'assignedTo',
        'expectedAmount',
        'expectedCloseDate',
        'opportunityStage',
        'successProbability'
    ];
    
    for (const field of requiredFields) {
        const element = document.getElementById(field);
        if (!element.value) {
            element.focus();
            return false;
        }
    }
    
    return true;
}

/**
 * 임시로 영업 기회를 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addOpportunityToTable() {
    const table = document.getElementById('opportunityTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 영업 기회명
    const cell2 = newRow.insertCell(1);
    cell2.textContent = document.getElementById('opportunityName').value;
    
    // 거래처
    const cell3 = newRow.insertCell(2);
    const clientCompany = document.getElementById('clientCompany');
    cell3.textContent = clientCompany.options[clientCompany.selectedIndex].text;
    
    // 담당자
    const cell4 = newRow.insertCell(3);
    const assignedTo = document.getElementById('assignedTo');
    cell4.textContent = assignedTo.options[assignedTo.selectedIndex].text;
    
    // 예상 금액
    const cell5 = newRow.insertCell(4);
    cell5.textContent = '₩' + document.getElementById('expectedAmount').value;
    
    // 예상 성사일
    const cell6 = newRow.insertCell(5);
    cell6.textContent = document.getElementById('expectedCloseDate').value;
    
    // 단계
    const cell7 = newRow.insertCell(6);
    const opportunityStage = document.getElementById('opportunityStage');
    const stageName = opportunityStage.options[opportunityStage.selectedIndex].text;
    const stageValue = opportunityStage.value;
    
    let badgeClass = 'bg-info'; // 기본값
    
    // 단계에 따라 배지 색상 변경
    switch (stageValue) {
        case 'lead':
            badgeClass = 'bg-info';
            break;
        case 'qualification':
            badgeClass = 'bg-primary';
            break;
        case 'proposal':
            badgeClass = 'bg-primary';
            break;
        case 'negotiation':
            badgeClass = 'bg-warning';
            break;
        case 'closed-won':
            badgeClass = 'bg-success';
            break;
        case 'closed-lost':
            badgeClass = 'bg-danger';
            break;
    }
    
    cell7.innerHTML = `<span class="badge ${badgeClass}">${stageName}</span>`;
    
    // 성공 확률
    const cell8 = newRow.insertCell(7);
    cell8.textContent = document.getElementById('successProbability').value + '%';
    
    // 관리 버튼
    const cell9 = newRow.insertCell(8);
    cell9.innerHTML = `
        <button class="btn btn-sm btn-info view-opportunity" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-opportunity" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-opportunity" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewOpportunityButtons();
    setupEditOpportunityButtons();
    setupDeleteOpportunityButtons();
}

/**
 * 영업 기회 상세 조회 버튼 이벤트 설정
 */
function setupViewOpportunityButtons() {
    const viewButtons = document.querySelectorAll('.view-opportunity');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const opportunityId = this.getAttribute('data-id');
            viewOpportunity(opportunityId);
        });
    });
}

/**
 * 영업 기회 수정 버튼 이벤트 설정
 */
function setupEditOpportunityButtons() {
    const editButtons = document.querySelectorAll('.edit-opportunity');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const opportunityId = this.getAttribute('data-id');
            editOpportunity(opportunityId);
        });
    });
}

/**
 * 영업 기회 삭제 버튼 이벤트 설정
 */
function setupDeleteOpportunityButtons() {
    const deleteButtons = document.querySelectorAll('.delete-opportunity');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const opportunityId = this.getAttribute('data-id');
            deleteOpportunity(opportunityId);
        });
    });
}

/**
 * 영업 기회 상세 조회 함수
 */
function viewOpportunity(opportunityId) {
    // 실제로는 서버에서 해당 ID의 영업 기회 정보를 가져와야 함
    
    // 모달 표시
    const viewOpportunityModal = new bootstrap.Modal(document.getElementById('viewOpportunityModal'));
    viewOpportunityModal.show();
}

/**
 * 영업 기회 수정 함수
 */
function editOpportunity(opportunityId) {
    // 실제로는 서버에서 해당 ID의 영업 기회 정보를 가져와야 함
    
    // 모달 제목 변경
    document.getElementById('addOpportunityModalLabel').textContent = '영업 기회 수정';
    
    // 모달 표시
    const addOpportunityModal = new bootstrap.Modal(document.getElementById('addOpportunityModal'));
    addOpportunityModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addOpportunityModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addOpportunityModalLabel').textContent = '영업 기회 등록';
    });
}

/**
 * 영업 기회 삭제 함수
 */
function deleteOpportunity(opportunityId) {
    if (confirm('정말로 이 영업 기회를 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('opportunityTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == opportunityId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('영업 기회가 삭제되었습니다.');
    }
}

/**
 * 활동 추가 모달 표시 함수
 */
function showAddActivityModal() {
    // 현재 날짜를 활동 일자 기본값으로 설정
    const activityDateInput = document.getElementById('activityDate');
    if (activityDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        activityDateInput.value = formattedDate;
    }
    
    // 모달 표시
    const addActivityModal = new bootstrap.Modal(document.getElementById('addActivityModal'));
    addActivityModal.show();
    
    // 영업 기회 상세 조회 모달 닫기
    const viewOpportunityModal = bootstrap.Modal.getInstance(document.getElementById('viewOpportunityModal'));
    viewOpportunityModal.hide();
}

/**
 * 활동 저장 함수
 */
function saveActivity() {
    // 폼 유효성 검사
    const activityTitle = document.getElementById('activityTitle').value;
    const activityDate = document.getElementById('activityDate').value;
    const activityDescription = document.getElementById('activityDescription').value;
    const activityAssignedTo = document.getElementById('activityAssignedTo').value;
    
    if (!activityTitle || !activityDate || !activityDescription || !activityAssignedTo) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('활동이 성공적으로 저장되었습니다.');
    
    // 활동 추가 모달 닫기
    const addActivityModal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    addActivityModal.hide();
    
    // 영업 기회 상세 조회 모달 다시 표시
    const viewOpportunityModal = new bootstrap.Modal(document.getElementById('viewOpportunityModal'));
    viewOpportunityModal.show();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addActivityToHistory();
}

/**
 * 활동을 이력에 추가하는 함수
 */
function addActivityToHistory() {
    const activityHistory = document.getElementById('viewActivityHistory');
    const activityTitle = document.getElementById('activityTitle').value;
    const activityDate = document.getElementById('activityDate').value;
    const activityDescription = document.getElementById('activityDescription').value;
    const activityAssignedTo = document.getElementById('activityAssignedTo');
    const assignedToName = activityAssignedTo.options[activityAssignedTo.selectedIndex].text;
    
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    
    listItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${activityTitle}</h6>
            <small>${activityDate}</small>
        </div>
        <p class="mb-1">${activityDescription}</p>
        <small>담당: ${assignedToName}</small>
    `;
    
    // 가장 최근 활동을 맨 위에 추가
    activityHistory.insertBefore(listItem, activityHistory.firstChild);
}

/**
 * 견적서 작성 함수
 */
function createQuotation() {
    // 실제로는 영업 기회 정보를 가지고 견적서 작성 페이지로 이동하거나 모달을 표시해야 함
    alert('견적서 작성 페이지로 이동합니다.');
    window.location.href = 'quotation.html';
}

/**
 * 영업 기회 내보내기 함수
 */
function exportOpportunities() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('영업 기회 목록 내보내기가 시작됩니다.');
}