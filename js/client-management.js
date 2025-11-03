/**
 * 거래처 관리 페이지 JavaScript
 * 
 * 이 파일은 거래처 관리 페이지의 기능을 구현합니다.
 * - 거래처 목록 조회 및 필터링
 * - 거래처 등록/수정/삭제
 * - 거래처 상세 조회
 * - 거래처 내보내기
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 토글 기능
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // 거래처 검색 기능
    const clientSearchButton = document.getElementById('clientSearchButton');
    if (clientSearchButton) {
        clientSearchButton.addEventListener('click', searchClients);
    }

    // 엔터키로 검색
    const clientSearchInput = document.getElementById('clientSearchInput');
    if (clientSearchInput) {
        clientSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchClients();
            }
        });
    }

    // 거래처 유형 필터 변경 이벤트
    const clientTypeFilter = document.getElementById('clientTypeFilter');
    if (clientTypeFilter) {
        clientTypeFilter.addEventListener('change', filterClientsByType);
    }

    // 거래처 등록 버튼 이벤트
    const saveClientBtn = document.getElementById('saveClientBtn');
    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', saveClient);
    }

    // 거래처 내보내기 버튼 이벤트
    const exportClientBtn = document.getElementById('exportClientBtn');
    if (exportClientBtn) {
        exportClientBtn.addEventListener('click', exportClients);
    }

    // 담당자 추가 버튼 이벤트
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', addContact);
    }

    // 영업기회 등록 버튼 이벤트
    const createOpportunityBtn = document.getElementById('createOpportunityBtn');
    if (createOpportunityBtn) {
        createOpportunityBtn.addEventListener('click', createOpportunity);
    }

    // 견적서 작성 버튼 이벤트
    const createQuotationBtn = document.getElementById('createQuotationBtn');
    if (createQuotationBtn) {
        createQuotationBtn.addEventListener('click', createQuotation);
    }

    // 거래처 상세 조회 버튼 이벤트
    setupViewClientButtons();

    // 거래처 수정 버튼 이벤트
    setupEditClientButtons();

    // 거래처 삭제 버튼 이벤트
    setupDeleteClientButtons();
});

/**
 * 거래처 검색 함수
 */
function searchClients() {
    const searchInput = document.getElementById('clientSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('clientTypeFilter').value;
    
    const tableRows = document.querySelectorAll('#clientTable tbody tr');
    
    tableRows.forEach(row => {
        const clientName = row.cells[1].textContent.toLowerCase();
        const clientType = row.cells[2].textContent.toLowerCase();
        const ceoName = row.cells[3].textContent.toLowerCase();
        const phone = row.cells[4].textContent.toLowerCase();
        const email = row.cells[5].textContent.toLowerCase();
        const assignedTo = row.cells[6].textContent.toLowerCase();
        
        // 검색어와 유형 필터 모두 적용
        const matchesSearch = clientName.includes(searchInput) || 
                             ceoName.includes(searchInput) || 
                             phone.includes(searchInput) || 
                             email.includes(searchInput) || 
                             assignedTo.includes(searchInput);
                             
        const matchesType = typeFilter === 'all' || clientType.includes(typeFilter);
        
        // 두 조건 모두 만족할 때만 표시
        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 거래처 유형별 필터링 함수
 */
function filterClientsByType() {
    const typeFilter = document.getElementById('clientTypeFilter').value;
    const tableRows = document.querySelectorAll('#clientTable tbody tr');
    
    if (typeFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    tableRows.forEach(row => {
        const clientType = row.cells[2].textContent.toLowerCase();
        if (clientType.includes(typeFilter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 거래처 등록/수정 저장 함수
 */
function saveClient() {
    // 폼 유효성 검사
    if (!validateClientForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('거래처가 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addClientToTable();
}

/**
 * 거래처 폼 유효성 검사 함수
 */
function validateClientForm() {
    const requiredFields = [
        'clientName',
        'clientType',
        'ceoName',
        'phone',
        'assignedTo'
    ];
    
    // 현재 활성화된 탭이 기본 정보 탭인 경우에만 검사
    const basicTab = document.querySelector('#basic.active');
    if (!basicTab) {
        return true;
    }
    
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
 * 임시로 거래처를 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addClientToTable() {
    const table = document.getElementById('clientTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 거래처명
    const cell2 = newRow.insertCell(1);
    cell2.textContent = document.getElementById('clientName').value;
    
    // 유형
    const cell3 = newRow.insertCell(2);
    const clientType = document.getElementById('clientType');
    const typeValue = clientType.value;
    const typeText = clientType.options[clientType.selectedIndex].text;
    
    let badgeClass = 'bg-info'; // 기본값
    
    // 유형에 따라 배지 색상 변경
    switch (typeValue) {
        case 'customer':
            badgeClass = 'bg-success';
            break;
        case 'partner':
        case 'supplier':
            badgeClass = 'bg-warning';
            break;
        case 'prospect':
            badgeClass = 'bg-info';
            break;
    }
    
    cell3.innerHTML = `<span class="badge ${badgeClass}">${typeText}</span>`;
    
    // 대표자
    const cell4 = newRow.insertCell(3);
    cell4.textContent = document.getElementById('ceoName').value;
    
    // 연락처
    const cell5 = newRow.insertCell(4);
    cell5.textContent = document.getElementById('phone').value;
    
    // 이메일
    const cell6 = newRow.insertCell(5);
    cell6.textContent = document.getElementById('email').value;
    
    // 담당자
    const cell7 = newRow.insertCell(6);
    const assignedTo = document.getElementById('assignedTo');
    cell7.textContent = assignedTo.options[assignedTo.selectedIndex].text;
    
    // 관리 버튼
    const cell8 = newRow.insertCell(7);
    cell8.innerHTML = `
        <button class="btn btn-sm btn-info view-client" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-client" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-client" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewClientButtons();
    setupEditClientButtons();
    setupDeleteClientButtons();
}

/**
 * 거래처 상세 조회 버튼 이벤트 설정
 */
function setupViewClientButtons() {
    const viewButtons = document.querySelectorAll('.view-client');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            viewClient(clientId);
        });
    });
}

/**
 * 거래처 수정 버튼 이벤트 설정
 */
function setupEditClientButtons() {
    const editButtons = document.querySelectorAll('.edit-client');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            editClient(clientId);
        });
    });
}

/**
 * 거래처 삭제 버튼 이벤트 설정
 */
function setupDeleteClientButtons() {
    const deleteButtons = document.querySelectorAll('.delete-client');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            deleteClient(clientId);
        });
    });
}

/**
 * 거래처 상세 조회 함수
 */
function viewClient(clientId) {
    // 실제로는 서버에서 해당 ID의 거래처 정보를 가져와야 함
    
    // 모달 표시
    const viewClientModal = new bootstrap.Modal(document.getElementById('viewClientModal'));
    viewClientModal.show();
}

/**
 * 거래처 수정 함수
 */
function editClient(clientId) {
    // 실제로는 서버에서 해당 ID의 거래처 정보를 가져와야 함
    
    // 모달 제목 변경
    document.getElementById('addClientModalLabel').textContent = '거래처 수정';
    
    // 모달 표시
    const addClientModal = new bootstrap.Modal(document.getElementById('addClientModal'));
    addClientModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addClientModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addClientModalLabel').textContent = '거래처 등록';
    });
}

/**
 * 거래처 삭제 함수
 */
function deleteClient(clientId) {
    if (confirm('정말로 이 거래처를 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('clientTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == clientId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('거래처가 삭제되었습니다.');
    }
}

/**
 * 담당자 추가 함수
 */
function addContact() {
    alert('담당자 추가 기능은 아직 구현되지 않았습니다.');
    
    // 실제 구현에서는 담당자 추가 폼을 표시하거나 모달을 표시해야 함
}

/**
 * 영업기회 등록 함수
 */
function createOpportunity() {
    // 실제로는 거래처 정보를 가지고 영업기회 등록 페이지로 이동하거나 모달을 표시해야 함
    alert('영업기회 등록 페이지로 이동합니다.');
    window.location.href = 'sales-opportunity.html';
}

/**
 * 견적서 작성 함수
 */
function createQuotation() {
    // 실제로는 거래처 정보를 가지고 견적서 작성 페이지로 이동하거나 모달을 표시해야 함
    alert('견적서 작성 페이지로 이동합니다.');
    window.location.href = 'quotation.html';
}

/**
 * 거래처 내보내기 함수
 */
function exportClients() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('거래처 목록 내보내기가 시작됩니다.');
}