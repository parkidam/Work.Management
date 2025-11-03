/**
 * 견적서 관리 페이지 JavaScript
 * 
 * 이 파일은 견적서 관리 페이지의 기능을 구현합니다.
 * - 견적서 목록 조회 및 필터링
 * - 견적서 작성/수정/삭제
 * - 견적서 상세 조회
 * - 견적서 PDF 다운로드 및 이메일 발송
 * - 견적서 내보내기
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

    // 견적서 검색 기능
    const quotationSearchButton = document.getElementById('quotationSearchButton');
    if (quotationSearchButton) {
        quotationSearchButton.addEventListener('click', searchQuotations);
    }

    // 엔터키로 검색
    const quotationSearchInput = document.getElementById('quotationSearchInput');
    if (quotationSearchInput) {
        quotationSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchQuotations();
            }
        });
    }

    // 견적서 상태 필터 변경 이벤트
    const quotationStatusFilter = document.getElementById('quotationStatusFilter');
    if (quotationStatusFilter) {
        quotationStatusFilter.addEventListener('change', filterQuotationsByStatus);
    }

    // 견적서 저장 버튼 이벤트
    const saveQuotationBtn = document.getElementById('saveQuotationBtn');
    if (saveQuotationBtn) {
        saveQuotationBtn.addEventListener('click', saveQuotation);
    }

    // 임시저장 버튼 이벤트
    const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', saveAsDraft);
    }

    // 미리보기 버튼 이벤트
    const previewQuotationBtn = document.getElementById('previewQuotationBtn');
    if (previewQuotationBtn) {
        previewQuotationBtn.addEventListener('click', previewQuotation);
    }

    // 견적서 내보내기 버튼 이벤트
    const exportQuotationBtn = document.getElementById('exportQuotationBtn');
    if (exportQuotationBtn) {
        exportQuotationBtn.addEventListener('click', exportQuotations);
    }

    // 이메일 발송 버튼 이벤트
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', sendQuotationByEmail);
    }

    // PDF 다운로드 버튼 이벤트
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadQuotationAsPdf);
    }

    // 계약서 작성 버튼 이벤트
    const createContractBtn = document.getElementById('createContractBtn');
    if (createContractBtn) {
        createContractBtn.addEventListener('click', createContract);
    }

    // 견적서 상세 조회 버튼 이벤트
    setupViewQuotationButtons();

    // 견적서 수정 버튼 이벤트
    setupEditQuotationButtons();

    // 견적서 삭제 버튼 이벤트
    setupDeleteQuotationButtons();

    // 항목 추가 버튼 이벤트
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addQuotationItem);
    }

    // 항목 금액 계산 이벤트
    setupItemCalculation();

    // 현재 날짜를 견적일자 기본값으로 설정
    const quotationDateInput = document.getElementById('quotationDate');
    if (quotationDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        quotationDateInput.value = formattedDate;
    }

    // 유효기간 기본값 설정 (30일 후)
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        const formattedDate = futureDate.toISOString().substr(0, 10);
        expiryDateInput.value = formattedDate;
    }
});

/**
 * 견적서 검색 함수
 */
function searchQuotations() {
    const searchInput = document.getElementById('quotationSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('quotationStatusFilter').value;
    
    const tableRows = document.querySelectorAll('#quotationTable tbody tr');
    
    tableRows.forEach(row => {
        const quotationNumber = row.cells[1].textContent.toLowerCase();
        const clientName = row.cells[2].textContent.toLowerCase();
        const assignedTo = row.cells[3].textContent.toLowerCase();
        const status = row.cells[7].textContent.toLowerCase();
        
        // 검색어와 상태 필터 모두 적용
        const matchesSearch = quotationNumber.includes(searchInput) || 
                             clientName.includes(searchInput) || 
                             assignedTo.includes(searchInput);
                             
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
 * 견적서 상태별 필터링 함수
 */
function filterQuotationsByStatus() {
    const statusFilter = document.getElementById('quotationStatusFilter').value;
    const tableRows = document.querySelectorAll('#quotationTable tbody tr');
    
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
 * 견적서 저장 함수
 */
function saveQuotation() {
    // 폼 유효성 검사
    if (!validateQuotationForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('견적서가 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addQuotationModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addQuotationToTable();
}

/**
 * 견적서 임시저장 함수
 */
function saveAsDraft() {
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('견적서가 임시저장되었습니다.');
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
}

/**
 * 견적서 미리보기 함수
 */
function previewQuotation() {
    // 실제로는 견적서 미리보기 페이지를 표시하거나 모달을 표시해야 함
    alert('견적서 미리보기를 표시합니다.');
    
    // 여기서는 임시로 견적서 상세 조회 모달을 표시
    const viewQuotationModal = new bootstrap.Modal(document.getElementById('viewQuotationModal'));
    viewQuotationModal.show();
}

/**
 * 견적서 폼 유효성 검사 함수
 */
function validateQuotationForm() {
    const requiredFields = [
        'quotationNumber',
        'quotationDate',
        'expiryDate',
        'clientCompany',
        'assignedTo'
    ];
    
    for (const field of requiredFields) {
        const element = document.getElementById(field);
        if (!element.value) {
            element.focus();
            return false;
        }
    }
    
    // 견적 항목이 하나 이상 있는지 확인
    const itemRows = document.querySelectorAll('#quotationItemTable tbody tr');
    if (itemRows.length === 0) {
        alert('최소 하나 이상의 견적 항목이 필요합니다.');
        return false;
    }
    
    // 각 견적 항목의 필수 필드 확인
    let isValid = true;
    itemRows.forEach(row => {
        const itemName = row.querySelector('.item-name').value;
        const itemQuantity = row.querySelector('.item-quantity').value;
        const itemPrice = row.querySelector('.item-price').value;
        
        if (!itemName || !itemQuantity || !itemPrice) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('모든 견적 항목의 항목명, 수량, 단가를 입력해주세요.');
        return false;
    }
    
    return true;
}

/**
 * 견적 항목 추가 함수
 */
function addQuotationItem() {
    const tbody = document.querySelector('#quotationItemTable tbody');
    const rowCount = tbody.rows.length;
    
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>${rowCount + 1}</td>
        <td>
            <input type="text" class="form-control item-name" required>
        </td>
        <td>
            <input type="number" class="form-control item-quantity" min="1" value="1" required>
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text">₩</span>
                <input type="text" class="form-control item-price" required>
            </div>
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text">₩</span>
                <input type="text" class="form-control item-amount" readonly>
            </div>
        </td>
        <td>
            <input type="text" class="form-control item-note">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-item">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    // 항목 삭제 버튼 이벤트
    const removeButton = newRow.querySelector('.remove-item');
    removeButton.addEventListener('click', function() {
        tbody.removeChild(newRow);
        recalculateItemNumbers();
        calculateTotals();
    });
    
    // 항목 금액 계산 이벤트
    setupItemCalculationForRow(newRow);
}

/**
 * 견적 항목 번호 재계산 함수
 */
function recalculateItemNumbers() {
    const rows = document.querySelectorAll('#quotationItemTable tbody tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

/**
 * 견적 항목 금액 계산 이벤트 설정 함수
 */
function setupItemCalculation() {
    const rows = document.querySelectorAll('#quotationItemTable tbody tr');
    rows.forEach(row => {
        setupItemCalculationForRow(row);
    });
}

/**
 * 특정 행의 견적 항목 금액 계산 이벤트 설정 함수
 */
function setupItemCalculationForRow(row) {
    const quantityInput = row.querySelector('.item-quantity');
    const priceInput = row.querySelector('.item-price');
    const amountInput = row.querySelector('.item-amount');
    
    const calculateAmount = function() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value.replace(/,/g, '')) || 0;
        const amount = quantity * price;
        
        // 천 단위 쉼표 포맷팅
        amountInput.value = amount.toLocaleString();
        
        // 전체 합계 계산
        calculateTotals();
    };
    
    quantityInput.addEventListener('input', calculateAmount);
    priceInput.addEventListener('input', calculateAmount);
    
    // 초기 계산
    calculateAmount();
}

/**
 * 견적서 합계 계산 함수
 */
function calculateTotals() {
    const amountInputs = document.querySelectorAll('.item-amount');
    let subtotal = 0;
    
    amountInputs.forEach(input => {
        subtotal += parseFloat(input.value.replace(/,/g, '')) || 0;
    });
    
    const tax = subtotal * 0.1; // 10% 부가세
    const total = subtotal + tax;
    
    // 천 단위 쉼표 포맷팅
    document.getElementById('subtotal').textContent = '₩' + subtotal.toLocaleString();
    document.getElementById('tax').textContent = '₩' + tax.toLocaleString();
    document.getElementById('totalAmount').textContent = '₩' + total.toLocaleString();
}

/**
 * 임시로 견적서를 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addQuotationToTable() {
    const table = document.getElementById('quotationTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 견적번호
    const cell2 = newRow.insertCell(1);
    cell2.textContent = document.getElementById('quotationNumber').value;
    
    // 거래처
    const cell3 = newRow.insertCell(2);
    const clientCompany = document.getElementById('clientCompany');
    cell3.textContent = clientCompany.options[clientCompany.selectedIndex].text;
    
    // 담당자
    const cell4 = newRow.insertCell(3);
    const assignedTo = document.getElementById('assignedTo');
    cell4.textContent = assignedTo.options[assignedTo.selectedIndex].text;
    
    // 견적일자
    const cell5 = newRow.insertCell(4);
    cell5.textContent = document.getElementById('quotationDate').value;
    
    // 유효기간
    const cell6 = newRow.insertCell(5);
    cell6.textContent = document.getElementById('expiryDate').value;
    
    // 견적금액
    const cell7 = newRow.insertCell(6);
    cell7.textContent = document.getElementById('totalAmount').textContent;
    
    // 상태
    const cell8 = newRow.insertCell(7);
    cell8.innerHTML = '<span class="badge bg-info">작성중</span>';
    
    // 관리 버튼
    const cell9 = newRow.insertCell(8);
    cell9.innerHTML = `
        <button class="btn btn-sm btn-info view-quotation" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-quotation" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-quotation" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewQuotationButtons();
    setupEditQuotationButtons();
    setupDeleteQuotationButtons();
}

/**
 * 견적서 상세 조회 버튼 이벤트 설정
 */
function setupViewQuotationButtons() {
    const viewButtons = document.querySelectorAll('.view-quotation');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quotationId = this.getAttribute('data-id');
            viewQuotation(quotationId);
        });
    });
}

/**
 * 견적서 수정 버튼 이벤트 설정
 */
function setupEditQuotationButtons() {
    const editButtons = document.querySelectorAll('.edit-quotation');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quotationId = this.getAttribute('data-id');
            editQuotation(quotationId);
        });
    });
}

/**
 * 견적서 삭제 버튼 이벤트 설정
 */
function setupDeleteQuotationButtons() {
    const deleteButtons = document.querySelectorAll('.delete-quotation');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quotationId = this.getAttribute('data-id');
            deleteQuotation(quotationId);
        });
    });
}

/**
 * 견적서 상세 조회 함수
 */
function viewQuotation(quotationId) {
    // 실제로는 서버에서 해당 ID의 견적서 정보를 가져와야 함
    
    // 모달 표시
    const viewQuotationModal = new bootstrap.Modal(document.getElementById('viewQuotationModal'));
    viewQuotationModal.show();
}

/**
 * 견적서 수정 함수
 */
function editQuotation(quotationId) {
    // 실제로는 서버에서 해당 ID의 견적서 정보를 가져와야 함
    
    // 모달 제목 변경
    document.getElementById('addQuotationModalLabel').textContent = '견적서 수정';
    
    // 모달 표시
    const addQuotationModal = new bootstrap.Modal(document.getElementById('addQuotationModal'));
    addQuotationModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addQuotationModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addQuotationModalLabel').textContent = '견적서 작성';
    });
}

/**
 * 견적서 삭제 함수
 */
function deleteQuotation(quotationId) {
    if (confirm('정말로 이 견적서를 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('quotationTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == quotationId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('견적서가 삭제되었습니다.');
    }
}

/**
 * 견적서 이메일 발송 함수
 */
function sendQuotationByEmail() {
    // 실제로는 서버에 이메일 발송 요청을 보내야 함
    alert('견적서 이메일 발송이 시작됩니다.');
}

/**
 * 견적서 PDF 다운로드 함수
 */
function downloadQuotationAsPdf() {
    // 실제로는 서버에서 PDF 파일을 생성하고 다운로드해야 함
    alert('견적서 PDF 다운로드가 시작됩니다.');
}

/**
 * 계약서 작성 함수
 */
function createContract() {
    // 실제로는 견적서 정보를 가지고 계약서 작성 페이지로 이동하거나 모달을 표시해야 함
    alert('계약서 작성 페이지로 이동합니다.');
    window.location.href = 'contract-management.html';
}

/**
 * 견적서 내보내기 함수
 */
function exportQuotations() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('견적서 목록 내보내기가 시작됩니다.');
}