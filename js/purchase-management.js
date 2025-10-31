/**
 * 매입관리 JavaScript 파일
 */

// 전역 변수
let purchaseData = []; // 매입 데이터 저장 배열
let currentPurchaseId = null; // 현재 선택된 매입 ID
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
    
    // 매입 데이터 로드
    loadPurchaseData();
    
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
    document.getElementById('searchBtn').addEventListener('click', searchPurchases);
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', resetSearchForm);
    
    // 매입 등록 모달이 열릴 때
    const purchaseModal = document.getElementById('purchaseModal');
    purchaseModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        if (!button || !button.id || button.id === 'addPurchaseBtn') {
            // 신규 등록 모드
            document.getElementById('purchaseModalLabel').textContent = '매입 등록';
            document.getElementById('purchaseForm').reset();
            currentPurchaseId = null;
        }
    });
    
    // 단가와 수량이 변경될 때 총 매입금액 계산
    document.getElementById('modalUnitPrice').addEventListener('input', calculateTotalAmount);
    document.getElementById('modalQuantity').addEventListener('input', calculateTotalAmount);
    
    // 매입 저장 버튼
    document.getElementById('savePurchaseBtn').addEventListener('click', savePurchaseData);
    
    // 엑셀 다운로드 버튼
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    
    // 매입 상세 모달에서 수정 버튼
    document.getElementById('editPurchaseBtn').addEventListener('click', function() {
        // 상세 모달 닫기
        const detailModal = bootstrap.Modal.getInstance(document.getElementById('purchaseDetailModal'));
        detailModal.hide();
        
        // 수정 모달 열기
        const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
        document.getElementById('purchaseModalLabel').textContent = '매입 수정';
        
        // 선택된 매입 데이터 가져오기
        const selectedPurchase = purchaseData.find(item => item.id === currentPurchaseId);
        if (selectedPurchase) {
            fillPurchaseForm(selectedPurchase);
        }
        
        purchaseModal.show();
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
 * 총 매입금액 계산 함수
 */
function calculateTotalAmount() {
    const unitPrice = parseFloat(document.getElementById('modalUnitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('modalQuantity').value) || 0;
    const totalAmount = unitPrice * quantity;
    document.getElementById('modalTotalAmount').value = totalAmount;
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
    flatpickr('#purchaseDateStart', datePickerOptions);
    flatpickr('#purchaseDateEnd', datePickerOptions);
    
    // 모달 폼의 날짜 필드
    flatpickr('#modalPurchaseDate', datePickerOptions);
    flatpickr('#modalTaxInvoiceDate', datePickerOptions);
    flatpickr('#modalPaymentDueDate', datePickerOptions);
    flatpickr('#modalPaymentDate', datePickerOptions);
}

/**
 * 차트 초기화 함수
 */
function initCharts() {
    // 월별 매입 추이 차트
    const monthlyPurchaseCtx = document.getElementById('monthlyPurchaseChart').getContext('2d');
    const monthlyPurchaseChart = new Chart(monthlyPurchaseCtx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '매입액 (백만원)',
                data: [45, 52, 38, 60, 56, 65, 70, 65, 58, 63, 60, 72],
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
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
                        text: '매입액 (백만원)'
                    }
                }
            }
        }
    });
    
    // 품목별 매입 비율 차트
    const categoryPurchaseCtx = document.getElementById('categoryPurchaseChart').getContext('2d');
    const categoryPurchaseChart = new Chart(categoryPurchaseCtx, {
        type: 'pie',
        data: {
            labels: ['하드웨어', '소프트웨어', '서비스', '소모품', '기타'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
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
 * 매입 데이터를 로드하는 함수 (실제 구현 시 API 호출로 대체)
 */
function loadPurchaseData() {
    // 테스트 데이터 (실제 구현 시 API 호출로 대체)
    purchaseData = [
        {
            id: 1,
            purchaseNumber: 'PO-2025-001',
            supplierName: '(주)서버테크',
            itemName: '서버 장비 구매',
            category: '하드웨어',
            quantity: 5,
            unitPrice: 8000000,
            totalAmount: 40000000,
            purchaseDate: '2025-01-10',
            taxInvoiceDate: '2025-01-15',
            paymentDueDate: '2025-02-10',
            paymentDate: '2025-02-08',
            department: '구매팀',
            manager: '김구매',
            note: '신규 프로젝트용 서버 구매'
        },
        {
            id: 2,
            purchaseNumber: 'PO-2025-002',
            supplierName: '소프트솔루션',
            itemName: '개발 소프트웨어 라이선스',
            category: '소프트웨어',
            quantity: 20,
            unitPrice: 1200000,
            totalAmount: 24000000,
            purchaseDate: '2025-01-20',
            taxInvoiceDate: '2025-01-25',
            paymentDueDate: '2025-02-20',
            paymentDate: '',
            department: '개발팀',
            manager: '박개발',
            note: '개발팀 라이선스 갱신'
        },
        {
            id: 3,
            purchaseNumber: 'PO-2025-003',
            supplierName: '클라우드서비스',
            itemName: '클라우드 인프라 구축 서비스',
            category: '서비스',
            quantity: 1,
            unitPrice: 15000000,
            totalAmount: 15000000,
            purchaseDate: '2025-02-05',
            taxInvoiceDate: '2025-02-10',
            paymentDueDate: '2025-03-05',
            paymentDate: '2025-03-03',
            department: '구매팀',
            manager: '이클라우드',
            note: '신규 클라우드 인프라 구축'
        },
        {
            id: 4,
            purchaseNumber: 'PO-2025-004',
            supplierName: '오피스마트',
            itemName: '사무용품 일괄 구매',
            category: '소모품',
            quantity: 1,
            unitPrice: 5000000,
            totalAmount: 5000000,
            purchaseDate: '2025-02-15',
            taxInvoiceDate: '2025-02-18',
            paymentDueDate: '2025-03-15',
            paymentDate: '2025-03-12',
            department: '관리팀',
            manager: '최관리',
            note: '분기별 사무용품 구매'
        },
        {
            id: 5,
            purchaseNumber: 'PO-2025-005',
            supplierName: '네트워크시스템',
            itemName: '네트워크 장비 업그레이드',
            category: '하드웨어',
            quantity: 10,
            unitPrice: 1500000,
            totalAmount: 15000000,
            purchaseDate: '2025-03-01',
            taxInvoiceDate: '2025-03-05',
            paymentDueDate: '2025-04-01',
            paymentDate: '',
            department: '구매팀',
            manager: '김구매',
            note: '네트워크 인프라 업그레이드'
        }
    ];
    
    // 매입 데이터 표시
    displayPurchaseData();
    
    // 페이지네이션 업데이트
    updatePagination();
}

/**
 * 매입 데이터를 화면에 표시하는 함수
 */
function displayPurchaseData() {
    const tableBody = document.querySelector('#purchaseTable tbody');
    tableBody.innerHTML = '';
    
    // 현재 페이지에 해당하는 데이터만 표시
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, purchaseData.length);
    const currentPageData = purchaseData.slice(startIndex, endIndex);
    
    if (currentPageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="11" class="text-center">데이터가 없습니다.</td>';
        tableBody.appendChild(row);
        return;
    }
    
    currentPageData.forEach(item => {
        const row = document.createElement('tr');
        
        // 금액 포맷팅
        const formattedAmount = new Intl.NumberFormat('ko-KR').format(item.totalAmount);
        
        // 지급 상태 확인
        const paymentStatus = item.paymentDate ? '지급완료' : '미지급';
        const paymentDate = item.paymentDate || '-';
        
        row.innerHTML = `
            <td>${item.purchaseNumber}</td>
            <td>${item.supplierName}</td>
            <td>${item.itemName}</td>
            <td class="text-end">${formattedAmount}</td>
            <td>${item.purchaseDate}</td>
            <td>${item.taxInvoiceDate || '-'}</td>
            <td>${item.paymentDueDate}</td>
            <td>${paymentDate}</td>
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
            const purchaseId = parseInt(this.getAttribute('data-id'));
            openPurchaseDetailModal(purchaseId);
        });
    });
    
    // 수정 버튼 이벤트 리스너
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const purchaseId = parseInt(this.getAttribute('data-id'));
            openPurchaseFormModal(purchaseId);
        });
    });
    
    // 삭제 버튼 이벤트 리스너
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const purchaseId = parseInt(this.getAttribute('data-id'));
            deletePurchaseData(purchaseId);
        });
    });
}

/**
 * 페이지네이션을 업데이트하는 함수
 */
function updatePagination() {
    const totalPages = Math.ceil(purchaseData.length / itemsPerPage);
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
            displayPurchaseData();
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
            displayPurchaseData();
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
            displayPurchaseData();
            updatePagination();
        }
    });
    pagination.appendChild(nextLi);
}

/**
 * 매입 상세 모달을 여는 함수
 */
function openPurchaseDetailModal(purchaseId) {
    const selectedPurchase = purchaseData.find(item => item.id === purchaseId);
    if (!selectedPurchase) return;
    
    // 현재 선택된 매입 ID 저장
    currentPurchaseId = purchaseId;
    
    // 상세 정보 채우기
    document.getElementById('detailPurchaseNumber').textContent = selectedPurchase.purchaseNumber;
    document.getElementById('detailSupplierName').textContent = selectedPurchase.supplierName;
    document.getElementById('detailItemName').textContent = selectedPurchase.itemName;
    document.getElementById('detailCategory').textContent = selectedPurchase.category;
    document.getElementById('detailQuantity').textContent = selectedPurchase.quantity;
    document.getElementById('detailUnitPrice').textContent = new Intl.NumberFormat('ko-KR').format(selectedPurchase.unitPrice);
    document.getElementById('detailTotalAmount').textContent = new Intl.NumberFormat('ko-KR').format(selectedPurchase.totalAmount);
    document.getElementById('detailPurchaseDate').textContent = selectedPurchase.purchaseDate;
    document.getElementById('detailTaxInvoiceDate').textContent = selectedPurchase.taxInvoiceDate || '-';
    document.getElementById('detailPaymentDueDate').textContent = selectedPurchase.paymentDueDate;
    document.getElementById('detailPaymentDate').textContent = selectedPurchase.paymentDate || '-';
    document.getElementById('detailDepartment').textContent = selectedPurchase.department;
    document.getElementById('detailManager').textContent = selectedPurchase.manager;
    document.getElementById('detailPaymentStatus').textContent = selectedPurchase.paymentDate ? '지급완료' : '미지급';
    document.getElementById('detailNote').textContent = selectedPurchase.note || '-';
    
    // 모달 열기
    const modal = new bootstrap.Modal(document.getElementById('purchaseDetailModal'));
    modal.show();
}

/**
 * 매입 등록/수정 모달을 여는 함수
 */
function openPurchaseFormModal(purchaseId = null) {
    const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    
    if (purchaseId) {
        // 수정 모드
        document.getElementById('purchaseModalLabel').textContent = '매입 수정';
        currentPurchaseId = purchaseId;
        
        // 선택된 매입 데이터 가져오기
        const selectedPurchase = purchaseData.find(item => item.id === purchaseId);
        if (selectedPurchase) {
            fillPurchaseForm(selectedPurchase);
        }
    } else {
        // 등록 모드
        document.getElementById('purchaseModalLabel').textContent = '매입 등록';
        document.getElementById('purchaseForm').reset();
        currentPurchaseId = null;
    }
    
    modal.show();
}

/**
 * 매입 폼에 데이터를 채우는 함수
 */
function fillPurchaseForm(purchaseData) {
    document.getElementById('modalPurchaseNumber').value = purchaseData.purchaseNumber;
    document.getElementById('modalSupplierName').value = purchaseData.supplierName;
    document.getElementById('modalItemName').value = purchaseData.itemName;
    document.getElementById('modalCategory').value = purchaseData.category;
    document.getElementById('modalQuantity').value = purchaseData.quantity;
    document.getElementById('modalUnitPrice').value = purchaseData.unitPrice;
    document.getElementById('modalTotalAmount').value = purchaseData.totalAmount;
    document.getElementById('modalDepartment').value = purchaseData.department;
    document.getElementById('modalPurchaseDate').value = purchaseData.purchaseDate;
    document.getElementById('modalTaxInvoiceDate').value = purchaseData.taxInvoiceDate || '';
    document.getElementById('modalPaymentDueDate').value = purchaseData.paymentDueDate;
    document.getElementById('modalPaymentDate').value = purchaseData.paymentDate || '';
    document.getElementById('modalManager').value = purchaseData.manager;
    document.getElementById('modalNote').value = purchaseData.note || '';
}

/**
 * 매입 데이터를 저장하는 함수
 */
function savePurchaseData() {
    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }
    
    // 폼 데이터 수집
    const purchaseFormData = {
        purchaseNumber: document.getElementById('modalPurchaseNumber').value,
        supplierName: document.getElementById('modalSupplierName').value,
        itemName: document.getElementById('modalItemName').value,
        category: document.getElementById('modalCategory').value,
        quantity: parseInt(document.getElementById('modalQuantity').value),
        unitPrice: parseFloat(document.getElementById('modalUnitPrice').value),
        totalAmount: parseFloat(document.getElementById('modalTotalAmount').value),
        purchaseDate: document.getElementById('modalPurchaseDate').value,
        taxInvoiceDate: document.getElementById('modalTaxInvoiceDate').value,
        paymentDueDate: document.getElementById('modalPaymentDueDate').value,
        paymentDate: document.getElementById('modalPaymentDate').value,
        department: document.getElementById('modalDepartment').value,
        manager: document.getElementById('modalManager').value,
        note: document.getElementById('modalNote').value
    };
    
    if (currentPurchaseId) {
        // 수정 모드
        const index = purchaseData.findIndex(item => item.id === currentPurchaseId);
        if (index !== -1) {
            purchaseData[index] = {
                ...purchaseData[index],
                ...purchaseFormData
            };
        }
    } else {
        // 등록 모드
        const newId = purchaseData.length > 0 ? Math.max(...purchaseData.map(item => item.id)) + 1 : 1;
        purchaseData.push({
            id: newId,
            ...purchaseFormData
        });
    }
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
    modal.hide();
    
    // 데이터 다시 표시
    displayPurchaseData();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 성공 메시지 표시
    alert(currentPurchaseId ? '매입 정보가 수정되었습니다.' : '매입 정보가 등록되었습니다.');
}

/**
 * 매입 데이터를 삭제하는 함수
 */
function deletePurchaseData(purchaseId) {
    if (confirm('정말로 이 매입 정보를 삭제하시겠습니까?')) {
        // 데이터 삭제
        purchaseData = purchaseData.filter(item => item.id !== purchaseId);
        
        // 데이터 다시 표시
        displayPurchaseData();
        
        // 페이지네이션 업데이트
        updatePagination();
        
        // 성공 메시지 표시
        alert('매입 정보가 삭제되었습니다.');
    }
}

/**
 * 매입 데이터를 검색하는 함수
 */
function searchPurchases() {
    const purchaseNumber = document.getElementById('purchaseNumber').value.trim().toLowerCase();
    const supplierName = document.getElementById('supplierName').value.trim().toLowerCase();
    const itemName = document.getElementById('itemName').value.trim().toLowerCase();
    const department = document.getElementById('department').value;
    const purchaseDateStart = document.getElementById('purchaseDateStart').value;
    const purchaseDateEnd = document.getElementById('purchaseDateEnd').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const manager = document.getElementById('manager').value.trim().toLowerCase();
    
    // 원본 데이터 로드 (실제 구현 시 API 호출로 대체)
    loadPurchaseData();
    
    // 필터링
    purchaseData = purchaseData.filter(item => {
        // 매입번호 필터링
        if (purchaseNumber && !item.purchaseNumber.toLowerCase().includes(purchaseNumber)) {
            return false;
        }
        
        // 공급처명 필터링
        if (supplierName && !item.supplierName.toLowerCase().includes(supplierName)) {
            return false;
        }
        
        // 품목명 필터링
        if (itemName && !item.itemName.toLowerCase().includes(itemName)) {
            return false;
        }
        
        // 담당부서 필터링
        if (department && item.department !== department) {
            return false;
        }
        
        // 매입일자 시작일 필터링
        if (purchaseDateStart && item.purchaseDate < purchaseDateStart) {
            return false;
        }
        
        // 매입일자 종료일 필터링
        if (purchaseDateEnd && item.purchaseDate > purchaseDateEnd) {
            return false;
        }
        
        // 지급상태 필터링
        if (paymentStatus === '완료' && !item.paymentDate) {
            return false;
        }
        
        if (paymentStatus === '미지급' && item.paymentDate) {
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
    displayPurchaseData();
    
    // 페이지네이션 업데이트
    updatePagination();
}

/**
 * 검색 폼을 초기화하는 함수
 */
function resetSearchForm() {
    document.getElementById('searchForm').reset();
    
    // 원본 데이터 다시 로드
    loadPurchaseData();
}

/**
 * 폼 유효성 검사 함수
 */
function validateForm() {
    const purchaseNumber = document.getElementById('modalPurchaseNumber').value.trim();
    const supplierName = document.getElementById('modalSupplierName').value.trim();
    const itemName = document.getElementById('modalItemName').value.trim();
    const category = document.getElementById('modalCategory').value;
    const quantity = document.getElementById('modalQuantity').value.trim();
    const unitPrice = document.getElementById('modalUnitPrice').value.trim();
    const purchaseDate = document.getElementById('modalPurchaseDate').value.trim();
    const paymentDueDate = document.getElementById('modalPaymentDueDate').value.trim();
    const department = document.getElementById('modalDepartment').value;
    const manager = document.getElementById('modalManager').value.trim();
    
    if (!purchaseNumber) {
        alert('매입번호를 입력하세요.');
        return false;
    }
    
    if (!supplierName) {
        alert('공급처명을 입력하세요.');
        return false;
    }
    
    if (!itemName) {
        alert('품목명을 입력하세요.');
        return false;
    }
    
    if (!category) {
        alert('품목 분류를 선택하세요.');
        return false;
    }
    
    if (!quantity || quantity <= 0) {
        alert('수량을 올바르게 입력하세요.');
        return false;
    }
    
    if (!unitPrice || unitPrice <= 0) {
        alert('단가를 올바르게 입력하세요.');
        return false;
    }
    
    if (!purchaseDate) {
        alert('매입일자를 입력하세요.');
        return false;
    }
    
    if (!paymentDueDate) {
        alert('지급예정일을 입력하세요.');
        return false;
    }
    
    if (!department) {
        alert('담당부서를 선택하세요.');
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
    const exportData = purchaseData.map(item => ({
        '매입번호': item.purchaseNumber,
        '공급처명': item.supplierName,
        '품목명': item.itemName,
        '품목 분류': item.category,
        '수량': item.quantity,
        '단가': item.unitPrice,
        '총 매입금액': item.totalAmount,
        '매입일자': item.purchaseDate,
        '세금계산서 수령일': item.taxInvoiceDate || '',
        '지급예정일': item.paymentDueDate,
        '지급일': item.paymentDate || '',
        '지급상태': item.paymentDate ? '지급완료' : '미지급',
        '담당부서': item.department,
        '담당자': item.manager,
        '비고': item.note || ''
    }));
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '매입관리');
    
    // 파일 저장
    const fileName = `매입관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * 로그인 상태 확인 함수
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
    const userNameElement = document.querySelector('.user-profile .user-name');
    if (userNameElement) {
        userNameElement.textContent = username;
    }
}

/**
 * 로그아웃 함수
 */
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
    
    // 로그인 페이지로 이동
    const currentPath = window.location.pathname;
    if (currentPath.includes('/html/')) {
        // html 폴더 내에 있는 경우
        window.location.href = '../html/login.html';
    } else {
        // 루트 디렉토리에 있는 경우
        window.location.href = 'html/login.html';
    }
}