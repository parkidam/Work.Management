/**
 * 매출관리 JavaScript 파일
 */

// 전역 변수
let salesData = []; // 매출 데이터 저장 배열
let currentSalesId = null; // 현재 선택된 매출 ID
const itemsPerPage = 10; // 페이지당 항목 수
let currentPage = 1; // 현재 페이지

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 현재 날짜 표시
    displayCurrentDate();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 날짜 선택기 초기화
    initDatePickers();
    
    // 매출 데이터 로드
    loadSalesData();
    
    // 차트 초기화
    initCharts();
    
    // 사이드바 토글 기능 설정
    setupSidebar();
});

/**
 * 사이드바 토글 기능 설정
 */
function setupSidebar() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
            document.getElementById('content').classList.toggle('active');
        });
    }
}

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
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ko-KR', options);
}

/**
 * 이벤트 리스너 설정 함수
 */
function setupEventListeners() {
    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', searchSales);
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', resetSearchForm);
    
    // 매출 등록 모달이 열릴 때
    const salesModal = document.getElementById('salesModal');
    salesModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        if (!button || !button.id || button.id === 'addSalesBtn') {
            // 신규 등록 모드
            document.getElementById('salesModalLabel').textContent = '매출 등록';
            document.getElementById('salesForm').reset();
            currentSalesId = null;
        }
    });
    
    // 매출 저장 버튼
    document.getElementById('saveSalesBtn').addEventListener('click', saveSalesData);
    
    // 엑셀 다운로드 버튼
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    
    // 매출 상세 모달에서 수정 버튼
    document.getElementById('editSalesBtn').addEventListener('click', function() {
        // 상세 모달 닫기
        const detailModal = bootstrap.Modal.getInstance(document.getElementById('salesDetailModal'));
        detailModal.hide();
        
        // 수정 모달 열기
        const salesModal = new bootstrap.Modal(document.getElementById('salesModal'));
        document.getElementById('salesModalLabel').textContent = '매출 수정';
        
        // 선택된 매출 데이터 가져오기
        const selectedSales = salesData.find(item => item.id === currentSalesId);
        if (selectedSales) {
            fillSalesForm(selectedSales);
        }
        
        salesModal.show();
    });
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * 날짜 선택기 초기화 함수
 */
function initDatePickers() {
    const datePickerOptions = {
        locale: 'ko',
        dateFormat: 'Y-m-d',
        allowInput: true
    };
    
    // 검색 폼의 날짜 필드
    flatpickr('#contractDateStart', datePickerOptions);
    flatpickr('#contractDateEnd', datePickerOptions);
    
    // 모달 폼의 날짜 필드
    flatpickr('#modalContractStartDate', datePickerOptions);
    flatpickr('#modalContractEndDate', datePickerOptions);
    flatpickr('#modalTaxInvoiceDate', datePickerOptions);
    flatpickr('#modalCollectionDate', datePickerOptions);
}

/**
 * 차트 초기화 함수
 */
function initCharts() {
    // 월별 매출 추이 차트
    const monthlySalesCtx = document.getElementById('monthlySalesChart').getContext('2d');
    const monthlySalesChart = new Chart(monthlySalesCtx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '매출액 (백만원)',
                data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 90],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '매출액 (백만원)'
                    }
                }
            }
        }
    });
    
    // 부서별 매출 비율 차트
    const departmentSalesCtx = document.getElementById('departmentSalesChart').getContext('2d');
    const departmentSalesChart = new Chart(departmentSalesCtx, {
        type: 'pie',
        data: {
            labels: ['영업1팀', '영업2팀', '영업3팀', '마케팅팀'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * 매출 데이터를 로드하는 함수 (실제 구현 시 API 호출로 대체)
 */
function loadSalesData() {
    // 테스트 데이터 (실제 구현 시 API 호출로 대체)
    salesData = [
        {
            id: 1,
            contractNumber: 'CT-2025-001',
            clientName: '(주)ABC전자',
            contractName: '시스템 유지보수 계약',
            contractAmount: 50000000,
            contractStartDate: '2025-01-01',
            contractEndDate: '2025-12-31',
            taxInvoiceDate: '2025-01-15',
            collectionDate: '2025-02-15',
            department: '영업1팀',
            manager: '홍길동',
            note: '연간 유지보수 계약'
        },
        {
            id: 2,
            contractNumber: 'CT-2025-002',
            clientName: '(주)XYZ물산',
            contractName: 'ERP 시스템 구축',
            contractAmount: 120000000,
            contractStartDate: '2025-02-01',
            contractEndDate: '2025-07-31',
            taxInvoiceDate: '2025-02-15',
            collectionDate: '',
            department: '영업2팀',
            manager: '김철수',
            note: '6개월 프로젝트'
        },
        {
            id: 3,
            contractNumber: 'CT-2025-003',
            clientName: '(주)대한상사',
            contractName: '클라우드 서비스 제공',
            contractAmount: 36000000,
            contractStartDate: '2025-03-01',
            contractEndDate: '2026-02-28',
            taxInvoiceDate: '2025-03-10',
            collectionDate: '2025-04-10',
            department: '영업3팀',
            manager: '이영희',
            note: '연간 클라우드 서비스 계약'
        },
        {
            id: 4,
            contractNumber: 'CT-2025-004',
            clientName: '(주)미래기술',
            contractName: '보안 시스템 구축',
            contractAmount: 85000000,
            contractStartDate: '2025-04-01',
            contractEndDate: '2025-08-31',
            taxInvoiceDate: '2025-04-15',
            collectionDate: '2025-05-15',
            department: '영업1팀',
            manager: '박지성',
            note: '보안 시스템 구축 및 교육'
        },
        {
            id: 5,
            contractNumber: 'CT-2025-005',
            clientName: '(주)스마트솔루션',
            contractName: '모바일 앱 개발',
            contractAmount: 45000000,
            contractStartDate: '2025-05-01',
            contractEndDate: '2025-09-30',
            taxInvoiceDate: '2025-05-15',
            collectionDate: '',
            department: '마케팅팀',
            manager: '최수진',
            note: '안드로이드/iOS 앱 개발'
        }
    ];
    
    // 매출 데이터 표시
    displaySalesData();
    
    // 페이지네이션 업데이트
    updatePagination();
}

/**
 * 매출 데이터를 화면에 표시하는 함수
 */
function displaySalesData() {
    const tableBody = document.querySelector('#salesTable tbody');
    tableBody.innerHTML = '';
    
    // 현재 페이지에 해당하는 데이터만 표시
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, salesData.length);
    const currentPageData = salesData.slice(startIndex, endIndex);
    
    if (currentPageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="11" class="text-center">데이터가 없습니다.</td>';
        tableBody.appendChild(row);
        return;
    }
    
    currentPageData.forEach(item => {
        const row = document.createElement('tr');
        
        // 금액 포맷팅
        const formattedAmount = new Intl.NumberFormat('ko-KR').format(item.contractAmount);
        
        // 수금 상태 확인
        const collectionStatus = item.collectionDate ? '수금완료' : '미수금';
        const collectionDate = item.collectionDate || '-';
        
        row.innerHTML = `
            <td>${item.contractNumber}</td>
            <td>${item.clientName}</td>
            <td>${item.contractName}</td>
            <td class="text-end">${formattedAmount}</td>
            <td>${item.contractStartDate}</td>
            <td>${item.contractEndDate}</td>
            <td>${item.taxInvoiceDate || '-'}</td>
            <td>${collectionDate}</td>
            <td>${item.department}</td>
            <td>${item.manager}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary view-btn" data-id="${item.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 상세보기 버튼 이벤트 리스너
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const salesId = parseInt(this.getAttribute('data-id'));
            openSalesDetailModal(salesId);
        });
    });
    
    // 수정 버튼 이벤트 리스너
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const salesId = parseInt(this.getAttribute('data-id'));
            openSalesFormModal(salesId);
        });
    });
    
    // 삭제 버튼 이벤트 리스너
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const salesId = parseInt(this.getAttribute('data-id'));
            deleteSalesData(salesId);
        });
    });
}

/**
 * 페이지네이션을 업데이트하는 함수
 */
function updatePagination() {
    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // 이전 버튼
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = '<a class="page-link" href="#" tabindex="-1">이전</a>';
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displaySalesData();
            updatePagination();
        }
    });
    pagination.appendChild(prevLi);
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${currentPage === i ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            displaySalesData();
            updatePagination();
        });
        pagination.appendChild(pageLi);
    }
    
    // 다음 버튼
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`;
    nextLi.innerHTML = '<a class="page-link" href="#">다음</a>';
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displaySalesData();
            updatePagination();
        }
    });
    pagination.appendChild(nextLi);
}

/**
 * 매출 상세 모달을 여는 함수
 */
function openSalesDetailModal(salesId) {
    const selectedSales = salesData.find(item => item.id === salesId);
    if (!selectedSales) return;
    
    // 현재 선택된 매출 ID 저장
    currentSalesId = salesId;
    
    // 상세 정보 채우기
    document.getElementById('detailContractNumber').textContent = selectedSales.contractNumber;
    document.getElementById('detailClientName').textContent = selectedSales.clientName;
    document.getElementById('detailContractName').textContent = selectedSales.contractName;
    document.getElementById('detailContractAmount').textContent = new Intl.NumberFormat('ko-KR').format(selectedSales.contractAmount);
    document.getElementById('detailDepartment').textContent = selectedSales.department;
    document.getElementById('detailContractStartDate').textContent = selectedSales.contractStartDate;
    document.getElementById('detailContractEndDate').textContent = selectedSales.contractEndDate;
    document.getElementById('detailTaxInvoiceDate').textContent = selectedSales.taxInvoiceDate || '-';
    document.getElementById('detailCollectionDate').textContent = selectedSales.collectionDate || '-';
    document.getElementById('detailManager').textContent = selectedSales.manager;
    document.getElementById('detailCollectionStatus').textContent = selectedSales.collectionDate ? '수금완료' : '미수금';
    document.getElementById('detailNote').textContent = selectedSales.note || '-';
    
    // 모달 열기
    const modal = new bootstrap.Modal(document.getElementById('salesDetailModal'));
    modal.show();
}

/**
 * 매출 등록/수정 모달을 여는 함수
 */
function openSalesFormModal(salesId = null) {
    const modal = new bootstrap.Modal(document.getElementById('salesModal'));
    
    if (salesId) {
        // 수정 모드
        document.getElementById('salesModalLabel').textContent = '매출 수정';
        currentSalesId = salesId;
        
        // 선택된 매출 데이터 가져오기
        const selectedSales = salesData.find(item => item.id === salesId);
        if (selectedSales) {
            fillSalesForm(selectedSales);
        }
    } else {
        // 등록 모드
        document.getElementById('salesModalLabel').textContent = '매출 등록';
        document.getElementById('salesForm').reset();
        currentSalesId = null;
    }
    
    modal.show();
}

/**
 * 매출 폼에 데이터를 채우는 함수
 */
function fillSalesForm(salesData) {
    document.getElementById('modalContractNumber').value = salesData.contractNumber;
    document.getElementById('modalClientName').value = salesData.clientName;
    document.getElementById('modalContractName').value = salesData.contractName;
    document.getElementById('modalContractAmount').value = salesData.contractAmount;
    document.getElementById('modalDepartment').value = salesData.department;
    document.getElementById('modalContractStartDate').value = salesData.contractStartDate;
    document.getElementById('modalContractEndDate').value = salesData.contractEndDate;
    document.getElementById('modalTaxInvoiceDate').value = salesData.taxInvoiceDate || '';
    document.getElementById('modalCollectionDate').value = salesData.collectionDate || '';
    document.getElementById('modalManager').value = salesData.manager;
    document.getElementById('modalNote').value = salesData.note || '';
}

/**
 * 매출 데이터를 저장하는 함수
 */
function saveSalesData() {
    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }
    
    // 폼 데이터 수집
    const salesFormData = {
        contractNumber: document.getElementById('modalContractNumber').value,
        clientName: document.getElementById('modalClientName').value,
        contractName: document.getElementById('modalContractName').value,
        contractAmount: parseInt(document.getElementById('modalContractAmount').value),
        department: document.getElementById('modalDepartment').value,
        contractStartDate: document.getElementById('modalContractStartDate').value,
        contractEndDate: document.getElementById('modalContractEndDate').value,
        taxInvoiceDate: document.getElementById('modalTaxInvoiceDate').value,
        collectionDate: document.getElementById('modalCollectionDate').value,
        manager: document.getElementById('modalManager').value,
        note: document.getElementById('modalNote').value
    };
    
    if (currentSalesId) {
        // 수정 모드
        const index = salesData.findIndex(item => item.id === currentSalesId);
        if (index !== -1) {
            salesData[index] = {
                ...salesData[index],
                ...salesFormData
            };
        }
    } else {
        // 등록 모드
        const newId = salesData.length > 0 ? Math.max(...salesData.map(item => item.id)) + 1 : 1;
        salesData.push({
            id: newId,
            ...salesFormData
        });
    }
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('salesModal'));
    modal.hide();
    
    // 데이터 다시 표시
    displaySalesData();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 성공 메시지 표시
    alert(currentSalesId ? '매출 정보가 수정되었습니다.' : '매출 정보가 등록되었습니다.');
}

/**
 * 매출 데이터를 삭제하는 함수
 */
function deleteSalesData(salesId) {
    if (confirm('정말로 이 매출 정보를 삭제하시겠습니까?')) {
        // 데이터 삭제
        salesData = salesData.filter(item => item.id !== salesId);
        
        // 데이터 다시 표시
        displaySalesData();
        
        // 페이지네이션 업데이트
        updatePagination();
        
        // 성공 메시지 표시
        alert('매출 정보가 삭제되었습니다.');
    }
}

/**
 * 매출 데이터를 검색하는 함수
 */
function searchSales() {
    const contractNumber = document.getElementById('contractNumber').value.trim().toLowerCase();
    const clientName = document.getElementById('clientName').value.trim().toLowerCase();
    const contractName = document.getElementById('contractName').value.trim().toLowerCase();
    const department = document.getElementById('department').value;
    const contractDateStart = document.getElementById('contractDateStart').value;
    const contractDateEnd = document.getElementById('contractDateEnd').value;
    const collectionStatus = document.getElementById('collectionStatus').value;
    const manager = document.getElementById('manager').value.trim().toLowerCase();
    
    // 원본 데이터 로드 (실제 구현 시 API 호출로 대체)
    loadSalesData();
    
    // 필터링
    salesData = salesData.filter(item => {
        // 계약번호 필터링
        if (contractNumber && !item.contractNumber.toLowerCase().includes(contractNumber)) {
            return false;
        }
        
        // 거래처명 필터링
        if (clientName && !item.clientName.toLowerCase().includes(clientName)) {
            return false;
        }
        
        // 계약명 필터링
        if (contractName && !item.contractName.toLowerCase().includes(contractName)) {
            return false;
        }
        
        // 담당부서 필터링
        if (department && item.department !== department) {
            return false;
        }
        
        // 계약 시작일 필터링
        if (contractDateStart && item.contractStartDate < contractDateStart) {
            return false;
        }
        
        // 계약 종료일 필터링
        if (contractDateEnd && item.contractEndDate > contractDateEnd) {
            return false;
        }
        
        // 수금상태 필터링
        if (collectionStatus === '완료' && !item.collectionDate) {
            return false;
        }
        
        if (collectionStatus === '미수금' && item.collectionDate) {
            return false;
        }
        
        // 담당자 필터링
        if (manager && !item.manager.toLowerCase().includes(manager)) {
            return false;
        }
        
        return true;
    });
    
    // 현재 페이지 초기화
    currentPage = 1;
    
    // 데이터 다시 표시
    displaySalesData();
    
    // 페이지네이션 업데이트
    updatePagination();
}

/**
 * 검색 폼을 초기화하는 함수
 */
function resetSearchForm() {
    document.getElementById('searchForm').reset();
    
    // 원본 데이터 다시 로드
    loadSalesData();
}

/**
 * 폼 유효성 검사 함수
 */
function validateForm() {
    const contractNumber = document.getElementById('modalContractNumber').value.trim();
    const clientName = document.getElementById('modalClientName').value.trim();
    const contractName = document.getElementById('modalContractName').value.trim();
    const contractAmount = document.getElementById('modalContractAmount').value.trim();
    const department = document.getElementById('modalDepartment').value;
    const contractStartDate = document.getElementById('modalContractStartDate').value.trim();
    const contractEndDate = document.getElementById('modalContractEndDate').value.trim();
    const manager = document.getElementById('modalManager').value.trim();
    
    if (!contractNumber) {
        alert('계약번호를 입력하세요.');
        return false;
    }
    
    if (!clientName) {
        alert('거래처명을 입력하세요.');
        return false;
    }
    
    if (!contractName) {
        alert('계약명을 입력하세요.');
        return false;
    }
    
    if (!contractAmount) {
        alert('계약금액을 입력하세요.');
        return false;
    }
    
    if (!department) {
        alert('담당부서를 선택하세요.');
        return false;
    }
    
    if (!contractStartDate) {
        alert('계약 시작일을 입력하세요.');
        return false;
    }
    
    if (!contractEndDate) {
        alert('계약 완료일을 입력하세요.');
        return false;
    }
    
    if (contractStartDate > contractEndDate) {
        alert('계약 시작일은 계약 완료일보다 빨라야 합니다.');
        return false;
    }
    
    if (!manager) {
        alert('담당자를 입력하세요.');
        return false;
    }
    
    return true;
}

/**
 * Excel로 내보내는 함수
 */
function exportToExcel() {
    // 내보낼 데이터 준비
    const exportData = salesData.map(item => ({
        '계약번호': item.contractNumber,
        '거래처명': item.clientName,
        '계약명': item.contractName,
        '계약금액': item.contractAmount,
        '계약 시작일': item.contractStartDate,
        '계약 완료일': item.contractEndDate,
        '세금계산서 발행일': item.taxInvoiceDate || '',
        '수금일': item.collectionDate || '',
        '수금상태': item.collectionDate ? '수금완료' : '미수금',
        '담당부서': item.department,
        '담당자': item.manager,
        '비고': item.note || ''
    }));
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '매출관리');
    
    // 파일 저장
    const fileName = `매출관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
}