/**
 * 계약 관리 페이지 JavaScript
 * 
 * 이 파일은 계약 관리 페이지의 기능을 구현합니다.
 * - 계약 목록 조회 및 필터링
 * - 계약 등록/수정/삭제
 * - 계약 상세 조회
 * - 계약 내보내기
 * - 계약 갱신 및 해지
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

    // 계약 검색 기능
    const contractSearchButton = document.getElementById('contractSearchButton');
    if (contractSearchButton) {
        contractSearchButton.addEventListener('click', searchContracts);
    }

    // 엔터키로 검색
    const contractSearchInput = document.getElementById('contractSearchInput');
    if (contractSearchInput) {
        contractSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchContracts();
            }
        });
    }

    // 계약 상태 필터 변경 이벤트
    const contractStatusFilter = document.getElementById('contractStatusFilter');
    if (contractStatusFilter) {
        contractStatusFilter.addEventListener('change', filterContractsByStatus);
    }

    // 계약 등록 버튼 이벤트
    const saveContractBtn = document.getElementById('saveContractBtn');
    if (saveContractBtn) {
        saveContractBtn.addEventListener('click', saveContract);
    }

    // 임시저장 버튼 이벤트
    const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', saveAsDraft);
    }

    // 계약 내보내기 버튼 이벤트
    const exportContractBtn = document.getElementById('exportContractBtn');
    if (exportContractBtn) {
        exportContractBtn.addEventListener('click', exportContracts);
    }

    // 계약 갱신 버튼 이벤트
    const renewContractBtn = document.getElementById('renewContractBtn');
    if (renewContractBtn) {
        renewContractBtn.addEventListener('click', renewContract);
    }

    // 계약 해지 버튼 이벤트
    const terminateContractBtn = document.getElementById('terminateContractBtn');
    if (terminateContractBtn) {
        terminateContractBtn.addEventListener('click', terminateContract);
    }

    // 계약서 다운로드 버튼 이벤트
    const downloadContractBtn = document.getElementById('downloadContractBtn');
    if (downloadContractBtn) {
        downloadContractBtn.addEventListener('click', downloadContract);
    }

    // 이력 추가 버튼 이벤트
    const addHistoryBtn = document.getElementById('addHistoryBtn');
    if (addHistoryBtn) {
        addHistoryBtn.addEventListener('click', addHistory);
    }

    // 지급 일정 추가 버튼 이벤트
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', addPaymentSchedule);
    }

    // 대금 지급 방식 라디오 버튼 이벤트
    const paymentTypeRadios = document.querySelectorAll('input[name="paymentType"]');
    paymentTypeRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentSchedule);
    });

    // 계약 상세 조회 버튼 이벤트
    setupViewContractButtons();

    // 계약 수정 버튼 이벤트
    setupEditContractButtons();

    // 계약 삭제 버튼 이벤트
    setupDeleteContractButtons();

    // 현재 날짜를 계약일자 기본값으로 설정
    const contractDateInput = document.getElementById('contractDate');
    if (contractDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        contractDateInput.value = formattedDate;
    }

    // 계약 시작일 기본값 설정
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        startDateInput.value = formattedDate;
    }

    // 계약 종료일 기본값 설정 (6개월 후)
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + 6);
        const formattedDate = futureDate.toISOString().substr(0, 10);
        endDateInput.value = formattedDate;
    }
});

/**
 * 계약 검색 함수
 */
function searchContracts() {
    const searchInput = document.getElementById('contractSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('contractStatusFilter').value;
    
    const tableRows = document.querySelectorAll('#contractTable tbody tr');
    
    tableRows.forEach(row => {
        const contractNumber = row.cells[1].textContent.toLowerCase();
        const contractName = row.cells[2].textContent.toLowerCase();
        const clientName = row.cells[3].textContent.toLowerCase();
        const status = row.cells[7].textContent.toLowerCase();
        
        // 검색어와 상태 필터 모두 적용
        const matchesSearch = contractNumber.includes(searchInput) || 
                             contractName.includes(searchInput) || 
                             clientName.includes(searchInput);
                             
        const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
        
        // 두 조건 모두 만족할 때만 표시
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 계약 상태별 필터링 함수
 */
function filterContractsByStatus() {
    const statusFilter = document.getElementById('contractStatusFilter').value;
    const tableRows = document.querySelectorAll('#contractTable tbody tr');
    
    if (statusFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    tableRows.forEach(row => {
        const status = row.cells[7].textContent.toLowerCase();
        if (status.includes(statusFilter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 계약 등록/수정 저장 함수
 */
function saveContract() {
    // 폼 유효성 검사
    if (!validateContractForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('계약이 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addContractModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addContractToTable();
}

/**
 * 계약 임시저장 함수
 */
function saveAsDraft() {
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('계약이 임시저장되었습니다.');
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
}

/**
 * 계약 폼 유효성 검사 함수
 */
function validateContractForm() {
    const requiredFields = [
        'contractNumber',
        'contractType',
        'contractName',
        'clientCompany',
        'contractDate',
        'contractStatus',
        'startDate',
        'endDate',
        'totalAmount',
        'assignedTo'
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
 * 임시로 계약을 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addContractToTable() {
    const table = document.getElementById('contractTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 계약번호
    const cell2 = newRow.insertCell(1);
    cell2.textContent = document.getElementById('contractNumber').value;
    
    // 계약명
    const cell3 = newRow.insertCell(2);
    cell3.textContent = document.getElementById('contractName').value;
    
    // 거래처
    const cell4 = newRow.insertCell(3);
    const clientCompany = document.getElementById('clientCompany');
    cell4.textContent = clientCompany.options[clientCompany.selectedIndex].text;
    
    // 계약일자
    const cell5 = newRow.insertCell(4);
    cell5.textContent = document.getElementById('contractDate').value;
    
    // 계약기간
    const cell6 = newRow.insertCell(5);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    cell6.textContent = startDate + ' ~ ' + endDate;
    
    // 계약금액
    const cell7 = newRow.insertCell(6);
    const amount = parseFloat(document.getElementById('totalAmount').value.replace(/,/g, '')) || 0;
    cell7.textContent = '₩' + amount.toLocaleString();
    
    // 상태
    const cell8 = newRow.insertCell(7);
    const contractStatus = document.getElementById('contractStatus');
    const statusValue = contractStatus.value;
    const statusText = contractStatus.options[contractStatus.selectedIndex].text;
    
    let badgeClass = 'bg-info'; // 기본값
    
    // 상태에 따라 배지 색상 변경
    switch (statusValue) {
        case 'draft':
            badgeClass = 'bg-secondary';
            break;
        case 'review':
            badgeClass = 'bg-info';
            break;
        case 'signed':
            badgeClass = 'bg-primary';
            break;
        case 'active':
            badgeClass = 'bg-success';
            break;
        case 'completed':
            badgeClass = 'bg-secondary';
            break;
        case 'terminated':
            badgeClass = 'bg-danger';
            break;
        case 'expired':
            badgeClass = 'bg-warning';
            break;
    }
    
    cell8.innerHTML = `<span class="badge ${badgeClass}">${statusText}</span>`;
    
    // 관리 버튼
    const cell9 = newRow.insertCell(8);
    cell9.innerHTML = `
        <button class="btn btn-sm btn-info view-contract" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-contract" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-contract" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewContractButtons();
    setupEditContractButtons();
    setupDeleteContractButtons();
}

/**
 * 계약 상세 조회 버튼 이벤트 설정
 */
function setupViewContractButtons() {
    const viewButtons = document.querySelectorAll('.view-contract');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contractId = this.getAttribute('data-id');
            viewContract(contractId);
        });
    });
}

/**
 * 계약 수정 버튼 이벤트 설정
 */
function setupEditContractButtons() {
    const editButtons = document.querySelectorAll('.edit-contract');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contractId = this.getAttribute('data-id');
            editContract(contractId);
        });
    });
}

/**
 * 계약 삭제 버튼 이벤트 설정
 */
function setupDeleteContractButtons() {
    const deleteButtons = document.querySelectorAll('.delete-contract');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contractId = this.getAttribute('data-id');
            deleteContract(contractId);
        });
    });
}

/**
 * 계약 상세 조회 함수
 */
function viewContract(contractId) {
    // 실제로는 서버에서 해당 ID의 계약 정보를 가져와야 함
    
    // 모달 표시
    const viewContractModal = new bootstrap.Modal(document.getElementById('viewContractModal'));
    viewContractModal.show();
}

/**
 * 계약 수정 함수
 */
function editContract(contractId) {
    // 실제로는 서버에서 해당 ID의 계약 정보를 가져와야 함
    
    // 모달 제목 변경
    document.getElementById('addContractModalLabel').textContent = '계약 수정';
    
    // 모달 표시
    const addContractModal = new bootstrap.Modal(document.getElementById('addContractModal'));
    addContractModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addContractModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addContractModalLabel').textContent = '계약 등록';
    });
}

/**
 * 계약 삭제 함수
 */
function deleteContract(contractId) {
    if (confirm('정말로 이 계약을 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('contractTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == contractId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('계약이 삭제되었습니다.');
    }
}

/**
 * 대금 지급 방식에 따라 지급 일정 표시 토글 함수
 */
function togglePaymentSchedule() {
    const installmentSchedule = document.getElementById('installmentSchedule');
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    
    if (paymentType === 'installment' || paymentType === 'milestone') {
        installmentSchedule.style.display = 'block';
    } else {
        installmentSchedule.style.display = 'none';
    }
}

/**
 * 지급 일정 추가 함수
 */
function addPaymentSchedule() {
    const tbody = document.querySelector('#paymentScheduleTable tbody');
    const rowCount = tbody.rows.length;
    
    const newRow = tbody.insertRow();
    
    newRow.innerHTML = `
        <td>${rowCount + 1}</td>
        <td>
            <input type="text" class="form-control payment-title">
        </td>
        <td>
            <input type="date" class="form-control payment-date">
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text">₩</span>
                <input type="text" class="form-control payment-amount">
            </div>
        </td>
        <td>
            <div class="input-group">
                <input type="number" class="form-control payment-percentage" min="0" max="100">
                <span class="input-group-text">%</span>
            </div>
        </td>
        <td>
            <input type="text" class="form-control payment-note">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-payment">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    // 항목 삭제 버튼 이벤트
    const removeButton = newRow.querySelector('.remove-payment');
    removeButton.addEventListener('click', function() {
        tbody.removeChild(newRow);
        recalculatePaymentNumbers();
    });
}

/**
 * 지급 일정 번호 재계산 함수
 */
function recalculatePaymentNumbers() {
    const rows = document.querySelectorAll('#paymentScheduleTable tbody tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

/**
 * 이력 추가 함수
 */
function addHistory() {
    const historyTitle = document.getElementById('historyTitle').value;
    const historyNote = document.getElementById('historyNote').value;
    
    if (!historyTitle || !historyNote) {
        alert('이력 제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    const contractHistory = document.getElementById('contractHistory');
    const now = new Date();
    const formattedDate = now.toISOString().substr(0, 10) + ' ' + 
                         now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
    
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    
    listItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${historyTitle}</h6>
            <small>${formattedDate}</small>
        </div>
        <p class="mb-1">${historyNote}</p>
        <small>담당: 현재 사용자</small>
    `;
    
    contractHistory.appendChild(listItem);
    
    // 입력 필드 초기화
    document.getElementById('historyTitle').value = '';
    document.getElementById('historyNote').value = '';
}

/**
 * 계약 갱신 함수
 */
function renewContract() {
    if (confirm('이 계약을 갱신하시겠습니까?')) {
        // 실제로는 서버에 갱신 요청을 보내야 함
        alert('계약 갱신 페이지로 이동합니다.');
        
        // 계약 등록 모달 표시 (기존 계약 정보 복사)
        document.getElementById('addContractModalLabel').textContent = '계약 갱신';
        
        const addContractModal = new bootstrap.Modal(document.getElementById('addContractModal'));
        addContractModal.show();
        
        // 모달이 닫힐 때 제목 원래대로 변경
        document.getElementById('addContractModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('addContractModalLabel').textContent = '계약 등록';
        });
    }
}

/**
 * 계약 해지 함수
 */
function terminateContract() {
    if (confirm('정말로 이 계약을 해지하시겠습니까?')) {
        // 실제로는 서버에 해지 요청을 보내야 함
        alert('계약이 해지되었습니다.');
        
        // 계약 상태 변경 (실제로는 서버에서 처리 후 화면 갱신)
        document.getElementById('viewContractStatus').textContent = '해지';
        document.getElementById('viewContractStatus').className = 'badge bg-danger';
    }
}

/**
 * 계약서 다운로드 함수
 */
function downloadContract() {
    // 실제로는 서버에서 계약서 파일을 다운로드해야 함
    alert('계약서 다운로드가 시작됩니다.');
}

/**
 * 계약 내보내기 함수
 */
function exportContracts() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('계약 목록 내보내기가 시작됩니다.');
}