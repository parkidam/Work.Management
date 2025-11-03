/**
 * 회사 문서관리 페이지 JavaScript
 * 
 * 이 파일은 회사 문서관리 페이지의 기능을 구현합니다.
 * - 문서 목록 조회 및 필터링
 * - 문서 등록/수정/삭제
 * - 문서 상세 조회
 * - 문서 다운로드
 * - 문서 목록 내보내기
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

    // 문서 검색 기능
    const documentSearchButton = document.getElementById('documentSearchButton');
    if (documentSearchButton) {
        documentSearchButton.addEventListener('click', searchDocuments);
    }

    // 엔터키로 검색
    const documentSearchInput = document.getElementById('documentSearchInput');
    if (documentSearchInput) {
        documentSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDocuments();
            }
        });
    }

    // 문서 유형 필터 변경 이벤트
    const documentTypeFilter = document.getElementById('documentTypeFilter');
    if (documentTypeFilter) {
        documentTypeFilter.addEventListener('change', filterDocumentsByType);
    }

    // 문서 등록 버튼 이벤트
    const saveDocumentBtn = document.getElementById('saveDocumentBtn');
    if (saveDocumentBtn) {
        saveDocumentBtn.addEventListener('click', saveDocument);
    }

    // 문서 내보내기 버튼 이벤트
    const exportDocumentBtn = document.getElementById('exportDocumentBtn');
    if (exportDocumentBtn) {
        exportDocumentBtn.addEventListener('click', exportDocuments);
    }

    // 문서 다운로드 버튼 이벤트
    const downloadDocumentBtn = document.getElementById('downloadDocumentBtn');
    if (downloadDocumentBtn) {
        downloadDocumentBtn.addEventListener('click', downloadDocument);
    }

    // 문서 상세 조회 버튼 이벤트
    setupViewDocumentButtons();

    // 문서 수정 버튼 이벤트
    setupEditDocumentButtons();

    // 문서 삭제 버튼 이벤트
    setupDeleteDocumentButtons();

    // 현재 날짜를 문서 작성일 기본값으로 설정
    const documentDateInput = document.getElementById('documentDate');
    if (documentDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        documentDateInput.value = formattedDate;
    }
});

/**
 * 문서 검색 함수
 */
function searchDocuments() {
    const searchInput = document.getElementById('documentSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('documentTypeFilter').value;
    
    const tableRows = document.querySelectorAll('#documentTable tbody tr');
    
    tableRows.forEach(row => {
        const documentType = row.cells[1].textContent.toLowerCase();
        const documentTitle = row.cells[2].textContent.toLowerCase();
        const documentNumber = row.cells[3].textContent.toLowerCase();
        const documentDate = row.cells[4].textContent.toLowerCase();
        const documentAuthor = row.cells[5].textContent.toLowerCase();
        
        // 검색어와 문서 유형 필터 모두 적용
        const matchesSearch = documentTitle.includes(searchInput) || 
                             documentNumber.includes(searchInput) || 
                             documentAuthor.includes(searchInput);
                             
        const matchesType = typeFilter === 'all' || documentType.includes(typeFilter.toLowerCase());
        
        // 두 조건 모두 만족할 때만 표시
        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 문서 유형별 필터링 함수
 */
function filterDocumentsByType() {
    const typeFilter = document.getElementById('documentTypeFilter').value;
    const tableRows = document.querySelectorAll('#documentTable tbody tr');
    
    if (typeFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    tableRows.forEach(row => {
        const documentType = row.cells[1].textContent.toLowerCase();
        if (documentType.includes(typeFilter.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 문서 등록/수정 저장 함수
 */
function saveDocument() {
    // 폼 유효성 검사
    const documentForm = document.getElementById('documentForm');
    if (!validateForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('문서가 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocumentModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addDocumentToTable();
}

/**
 * 폼 유효성 검사 함수
 */
function validateForm() {
    const requiredFields = [
        'documentType',
        'documentNumber',
        'documentTitle',
        'documentDate',
        'documentAuthor',
        'retentionPeriod',
        'securityLevel',
        'documentFile'
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
 * 임시로 문서를 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addDocumentToTable() {
    const table = document.getElementById('documentTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 문서 분류
    const cell2 = newRow.insertCell(1);
    const documentType = document.getElementById('documentType');
    cell2.textContent = documentType.options[documentType.selectedIndex].text;
    
    // 문서명
    const cell3 = newRow.insertCell(2);
    cell3.textContent = document.getElementById('documentTitle').value;
    
    // 문서번호
    const cell4 = newRow.insertCell(3);
    cell4.textContent = document.getElementById('documentNumber').value;
    
    // 작성일
    const cell5 = newRow.insertCell(4);
    cell5.textContent = document.getElementById('documentDate').value;
    
    // 작성자
    const cell6 = newRow.insertCell(5);
    cell6.textContent = document.getElementById('documentAuthor').value;
    
    // 보존기한
    const cell7 = newRow.insertCell(6);
    const retentionPeriod = document.getElementById('retentionPeriod');
    cell7.textContent = retentionPeriod.options[retentionPeriod.selectedIndex].text;
    
    // 관리 버튼
    const cell8 = newRow.insertCell(7);
    cell8.innerHTML = `
        <button class="btn btn-sm btn-info view-document" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-document" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-document" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewDocumentButtons();
    setupEditDocumentButtons();
    setupDeleteDocumentButtons();
}

/**
 * 문서 상세 조회 버튼 이벤트 설정
 */
function setupViewDocumentButtons() {
    const viewButtons = document.querySelectorAll('.view-document');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.getAttribute('data-id');
            viewDocument(documentId);
        });
    });
}

/**
 * 문서 수정 버튼 이벤트 설정
 */
function setupEditDocumentButtons() {
    const editButtons = document.querySelectorAll('.edit-document');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.getAttribute('data-id');
            editDocument(documentId);
        });
    });
}

/**
 * 문서 삭제 버튼 이벤트 설정
 */
function setupDeleteDocumentButtons() {
    const deleteButtons = document.querySelectorAll('.delete-document');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.getAttribute('data-id');
            deleteDocument(documentId);
        });
    });
}

/**
 * 문서 상세 조회 함수
 */
function viewDocument(documentId) {
    // 실제로는 서버에서 해당 ID의 문서 정보를 가져와야 함
    // 여기서는 예시 데이터로 모달을 채움
    
    // 예시 데이터 (실제로는 서버에서 가져와야 함)
    const documentData = {
        type: '계약서',
        number: 'CT-2025-001',
        title: '2025년 소프트웨어 개발 용역 계약서',
        date: '2025-10-15',
        author: '김영수',
        retentionPeriod: '5년',
        securityLevel: '중요',
        description: '2025년도 소프트웨어 개발 용역에 대한 계약서입니다. 계약 기간은 2025년 1월부터 12월까지이며, 개발 범위와 일정, 비용 등이 포함되어 있습니다.',
        relatedDepartment: '영업팀, 개발팀',
        fileName: '2025년_소프트웨어_개발_용역_계약서.pdf',
        history: [
            { date: '2025-10-15 14:30', user: '김영수', action: '문서 등록' },
            { date: '2025-10-16 09:15', user: '이미영', action: '문서 검토' },
            { date: '2025-10-17 11:20', user: '박재현', action: '문서 승인' }
        ]
    };
    
    // 모달에 데이터 표시
    document.getElementById('viewDocumentType').textContent = documentData.type;
    document.getElementById('viewDocumentNumber').textContent = documentData.number;
    document.getElementById('viewDocumentTitle').textContent = documentData.title;
    document.getElementById('viewDocumentDate').textContent = documentData.date;
    document.getElementById('viewDocumentAuthor').textContent = documentData.author;
    document.getElementById('viewRetentionPeriod').textContent = documentData.retentionPeriod;
    document.getElementById('viewSecurityLevel').textContent = documentData.securityLevel;
    document.getElementById('viewDocumentDescription').textContent = documentData.description;
    document.getElementById('viewRelatedDepartment').textContent = documentData.relatedDepartment;
    
    // 파일 링크 설정
    const fileLink = document.getElementById('viewDocumentFileLink');
    fileLink.textContent = documentData.fileName;
    fileLink.href = '#'; // 실제로는 파일 다운로드 URL로 설정해야 함
    
    // 문서 이력 표시
    const historyContainer = document.getElementById('viewDocumentHistory');
    historyContainer.innerHTML = '';
    
    documentData.history.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        const historyText = document.createElement('small');
        historyText.textContent = `${item.date} - ${item.user}: ${item.action}`;
        listItem.appendChild(historyText);
        historyContainer.appendChild(listItem);
    });
    
    // 모달 표시
    const viewDocumentModal = new bootstrap.Modal(document.getElementById('viewDocumentModal'));
    viewDocumentModal.show();
}

/**
 * 문서 수정 함수
 */
function editDocument(documentId) {
    // 실제로는 서버에서 해당 ID의 문서 정보를 가져와야 함
    // 여기서는 예시 데이터로 모달을 채움
    
    // 예시 데이터 (실제로는 서버에서 가져와야 함)
    let documentData;
    
    // 테이블에서 해당 행의 데이터 가져오기
    const table = document.getElementById('documentTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const firstCell = rows[i].cells[0];
        if (firstCell && firstCell.textContent == documentId) {
            documentData = {
                type: rows[i].cells[1].textContent,
                number: rows[i].cells[3].textContent,
                title: rows[i].cells[2].textContent,
                date: rows[i].cells[4].textContent,
                author: rows[i].cells[5].textContent,
                retentionPeriod: rows[i].cells[6].textContent
            };
            break;
        }
    }
    
    if (!documentData) {
        alert('문서 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 문서 등록 모달의 제목 변경
    document.getElementById('addDocumentModalLabel').textContent = '문서 수정';
    
    // 모달에 데이터 표시
    const documentTypeSelect = document.getElementById('documentType');
    for (let i = 0; i < documentTypeSelect.options.length; i++) {
        if (documentTypeSelect.options[i].text === documentData.type) {
            documentTypeSelect.selectedIndex = i;
            break;
        }
    }
    
    document.getElementById('documentNumber').value = documentData.number;
    document.getElementById('documentTitle').value = documentData.title;
    document.getElementById('documentDate').value = documentData.date;
    document.getElementById('documentAuthor').value = documentData.author;
    
    const retentionPeriodSelect = document.getElementById('retentionPeriod');
    for (let i = 0; i < retentionPeriodSelect.options.length; i++) {
        if (retentionPeriodSelect.options[i].text === documentData.retentionPeriod) {
            retentionPeriodSelect.selectedIndex = i;
            break;
        }
    }
    
    // 모달 표시
    const addDocumentModal = new bootstrap.Modal(document.getElementById('addDocumentModal'));
    addDocumentModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addDocumentModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addDocumentModalLabel').textContent = '문서 등록';
    });
}

/**
 * 문서 삭제 함수
 */
function deleteDocument(documentId) {
    if (confirm('정말로 이 문서를 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('documentTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == documentId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('문서가 삭제되었습니다.');
    }
}

/**
 * 문서 다운로드 함수
 */
function downloadDocument() {
    // 실제로는 서버에서 파일을 다운로드 받아야 함
    alert('문서 다운로드가 시작됩니다.');
}

/**
 * 문서 목록 내보내기 함수
 */
function exportDocuments() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('문서 목록 내보내기가 시작됩니다.');
}