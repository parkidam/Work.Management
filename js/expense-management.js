/**
 * 경비관리 JavaScript 파일
 */

// 전역 변수
let expenseData = []; // 경비 데이터 저장 배열
let currentExpenseId = null; // 현재 선택된 경비 ID
const itemsPerPage = 10; // 페이지당 항목 수
let currentPage = 1; // 현재 페이지
let receiptFile = null; // 영수증 파일

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
    
    // 경비 데이터 로드
    loadExpenseData();
    
    // 차트 초기화
    initCharts();
    
    // 사이드바 토글 기능 설정
    setupSidebar();
    
    // 요약 정보 업데이트
    updateSummaryInfo();
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
    document.getElementById('searchBtn').addEventListener('click', searchExpenses);
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', resetSearchForm);
    
    // 경비 등록 모달이 열릴 때
    const expenseModal = document.getElementById('expenseModal');
    expenseModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        if (!button || !button.id || button.id === 'addExpenseBtn') {
            // 신규 등록 모드
            document.getElementById('expenseModalLabel').textContent = '경비 등록';
            document.getElementById('expenseForm').reset();
            document.getElementById('modalExpenseNumber').value = generateExpenseNumber();
            currentExpenseId = null;
            
            // 영수증 미리보기 초기화
            document.getElementById('receiptPreviewContainer').style.display = 'none';
            receiptFile = null;
        }
    });
    
    // 영수증 파일 선택 시 미리보기
    document.getElementById('modalReceipt').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            receiptFile = file;
            
            // 이미지 파일인 경우만 미리보기
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('receiptPreview').src = e.target.result;
                    document.getElementById('receiptPreviewContainer').style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                // PDF 파일인 경우 아이콘 표시
                document.getElementById('receiptPreview').src = '../images/pdf-icon.png'; // PDF 아이콘 경로
                document.getElementById('receiptPreviewContainer').style.display = 'block';
            }
        }
    });
    
    // 경비 저장 버튼
    document.getElementById('saveExpenseBtn').addEventListener('click', saveExpenseData);
    
    // 엑셀 다운로드 버튼
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    
    // 경비 상세 모달에서 수정 버튼
    document.getElementById('editExpenseBtn').addEventListener('click', function() {
        // 상세 모달 닫기
        const detailModal = bootstrap.Modal.getInstance(document.getElementById('expenseDetailModal'));
        detailModal.hide();
        
        // 수정 모달 열기
        const expenseModal = new bootstrap.Modal(document.getElementById('expenseModal'));
        document.getElementById('expenseModalLabel').textContent = '경비 수정';
        
        // 선택된 경비 데이터 가져오기
        const selectedExpense = expenseData.find(item => item.id === currentExpenseId);
        if (selectedExpense) {
            fillExpenseForm(selectedExpense);
        }
        
        expenseModal.show();
    });
    
    // 승인 버튼
    document.getElementById('approveExpenseBtn').addEventListener('click', function() {
        openApprovalModal('승인');
    });
    
    // 반려 버튼
    document.getElementById('rejectExpenseBtn').addEventListener('click', function() {
        openApprovalModal('반려');
    });
    
    // 승인/반려 확인 버튼
    document.getElementById('submitApprovalBtn').addEventListener('click', processApproval);
    
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
 * 경비번호 생성 함수
 */
function generateExpenseNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // 현재 경비 데이터에서 가장 큰 번호 찾기
    let maxNumber = 0;
    expenseData.forEach(item => {
        if (item.expenseNumber.startsWith(`EXP-${year}${month}`)) {
            const num = parseInt(item.expenseNumber.split('-')[2]);
            if (num > maxNumber) {
                maxNumber = num;
            }
        }
    });
    
    // 새 번호 생성
    const newNumber = maxNumber + 1;
    return `EXP-${year}${month}-${String(newNumber).padStart(3, '0')}`;
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
    flatpickr('#expenseDateStart', datePickerOptions);
    flatpickr('#expenseDateEnd', datePickerOptions);
    
    // 모달 폼의 날짜 필드
    flatpickr('#modalExpenseDate', datePickerOptions);
}

/**
 * 차트 초기화 함수
 */
function initCharts() {
    // 유형별 경비 비율 차트
    const expenseTypeCtx = document.getElementById('expenseTypeChart').getContext('2d');
    const expenseTypeChart = new Chart(expenseTypeCtx, {
        type: 'pie',
        data: {
            labels: ['출장비', '접대비', '사무용품비', '교통비', '통신비', '회의비', '복리후생비', '기타'],
            datasets: [{
                data: [25, 15, 12, 8, 5, 10, 20, 5],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)'
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
    
    // 월별 경비 추이 차트
    const monthlyExpenseCtx = document.getElementById('monthlyExpenseChart').getContext('2d');
    const monthlyExpenseChart = new Chart(monthlyExpenseCtx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '경비 총액 (만원)',
                data: [1200, 1350, 1100, 1450, 1300, 1550, 1650, 1500, 1400, 1525, 1600, 1700],
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
                        text: '경비 총액 (만원)'
                    }
                }
            }
        }
    });
}

/**
 * 요약 정보 업데이트 함수
 */
function updateSummaryInfo() {
    // 이번 달 총 경비 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let monthlyTotal = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    
    expenseData.forEach(item => {
        const expenseDate = new Date(item.expenseDate);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth() + 1;
        
        // 이번 달 경비 합산
        if (expenseYear === currentYear && expenseMonth === currentMonth) {
            monthlyTotal += item.amount;
        }
        
        // 승인 상태별 카운트
        if (item.approvalStatus === '대기') {
            pendingCount++;
        } else if (item.approvalStatus === '승인') {
            approvedCount++;
        } else if (item.approvalStatus === '반려') {
            rejectedCount++;
        }
    });
    
    // 요약 정보 업데이트
    document.getElementById('monthlyTotal').textContent = new Intl.NumberFormat('ko-KR').format(monthlyTotal) + '원';
    document.getElementById('pendingCount').textContent = pendingCount + '건';
    document.getElementById('approvedCount').textContent = approvedCount + '건';
    document.getElementById('rejectedCount').textContent = rejectedCount + '건';
}

/**
 * 경비 데이터를 로드하는 함수 (실제 구현 시 API 호출로 대체)
 */
function loadExpenseData() {
    // 테스트 데이터 (실제 구현 시 API 호출로 대체)
    expenseData = [
        {
            id: 1,
            expenseNumber: 'EXP-202510-001',
            expenseType: '출장비',
            title: '서울 고객사 방문 출장',
            amount: 250000,
            expenseDate: '2025-10-15',
            department: '영업팀',
            employeeName: '김영업',
            paymentMethod: '법인카드',
            accountNumber: '',
            description: '서울 소재 고객사 방문을 위한 출장비 (교통비, 숙박비, 식비 포함)',
            receipt: '../images/sample-receipt-1.jpg',
            approvalStatus: '승인',
            paymentStatus: '완료',
            approvalHistory: [
                {
                    date: '2025-10-16 09:30:15',
                    approver: '박부장',
                    status: '승인',
                    comment: '출장 목적 및 비용 적정함'
                }
            ]
        },
        {
            id: 2,
            expenseNumber: 'EXP-202510-002',
            expenseType: '접대비',
            title: '신규 고객사 미팅 접대',
            amount: 350000,
            expenseDate: '2025-10-18',
            department: '영업팀',
            employeeName: '이영업',
            paymentMethod: '법인카드',
            accountNumber: '',
            description: '신규 고객사 미팅을 위한 저녁 식사 접대비',
            receipt: '../images/sample-receipt-2.jpg',
            approvalStatus: '대기',
            paymentStatus: '미지급',
            approvalHistory: []
        },
        {
            id: 3,
            expenseNumber: 'EXP-202510-003',
            expenseType: '사무용품비',
            title: '사무용품 구매',
            amount: 120000,
            expenseDate: '2025-10-20',
            department: '경영지원팀',
            employeeName: '최지원',
            paymentMethod: '법인카드',
            accountNumber: '',
            description: '사무실 내 필요 사무용품 구매 (프린터 토너, 복사용지, 필기구 등)',
            receipt: '../images/sample-receipt-3.jpg',
            approvalStatus: '승인',
            paymentStatus: '완료',
            approvalHistory: [
                {
                    date: '2025-10-20 16:45:22',
                    approver: '김부장',
                    status: '승인',
                    comment: '필요 물품 확인 완료'
                }
            ]
        },
        {
            id: 4,
            expenseNumber: 'EXP-202510-004',
            expenseType: '교통비',
            title: '외부 미팅 교통비',
            amount: 35000,
            expenseDate: '2025-10-22',
            department: '개발팀',
            employeeName: '박개발',
            paymentMethod: '개인카드',
            accountNumber: '110-123-456789',
            description: '외부 협력업체 미팅을 위한 택시 이용 비용',
            receipt: '../images/sample-receipt-4.jpg',
            approvalStatus: '반려',
            paymentStatus: '미지급',
            approvalHistory: [
                {
                    date: '2025-10-23 11:20:45',
                    approver: '정부장',
                    status: '반려',
                    comment: '택시 이용 사유가 불충분함. 대중교통 이용 권장'
                }
            ]
        },
        {
            id: 5,
            expenseNumber: 'EXP-202510-005',
            expenseType: '회의비',
            title: '프로젝트 킥오프 미팅 다과',
            amount: 85000,
            expenseDate: '2025-10-25',
            department: '개발팀',
            employeeName: '김개발',
            paymentMethod: '법인카드',
            accountNumber: '',
            description: '신규 프로젝트 킥오프 미팅을 위한 다과 및 식사 비용',
            receipt: '../images/sample-receipt-5.jpg',
            approvalStatus: '대기',
            paymentStatus: '미지급',
            approvalHistory: []
        }
    ];
    
    // 경비 데이터 표시
    displayExpenseData();
    
    // 페이지네이션 업데이트
    updatePagination();
}

/**
 * 경비 데이터를 화면에 표시하는 함수
 */
function displayExpenseData() {
    const tableBody = document.querySelector('#expenseTable tbody');
    tableBody.innerHTML = '';
    
    // 현재 페이지에 해당하는 데이터만 표시
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, expenseData.length);
    const currentPageData = expenseData.slice(startIndex, endIndex);
    
    if (currentPageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="10" class="text-center">데이터가 없습니다.</td>';
        tableBody.appendChild(row);
        return;
    }
    
    currentPageData.forEach(item => {
        const row = document.createElement('tr');
        
        // 금액 포맷팅
        const formattedAmount = new Intl.NumberFormat('ko-KR').format(item.amount);
        
        // 승인 상태에 따른 배지 색상
        let approvalBadgeClass = '';
        if (item.approvalStatus === '승인') {
            approvalBadgeClass = 'bg-success';
        } else if (item.approvalStatus === '반려') {
            approvalBadgeClass = 'bg-danger';
        } else {
            approvalBadgeClass = 'bg-warning text-dark';
        }
        
        // 지급 상태에 따른 배지 색상
        const paymentBadgeClass = item.paymentStatus === '완료' ? 'bg-primary' : 'bg-secondary';
        
        row.innerHTML = `
            <td>${item.expenseNumber}</td>
            <td>${item.expenseType}</td>
            <td>${item.title}</td>
            <td class="text-end">${formattedAmount}</td>
            <td>${item.expenseDate}</td>
            <td>${item.department}</td>
            <td>${item.employeeName}</td>
            <td><span class="badge ${approvalBadgeClass}">${item.approvalStatus}</span></td>
            <td><span class="badge ${paymentBadgeClass}">${item.paymentStatus}</span></td>
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
            const expenseId = parseInt(this.getAttribute('data-id'));
            openExpenseDetailModal(expenseId);
        });
    });
    
    // 수정 버튼 이벤트 리스너
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-id'));
            openExpenseFormModal(expenseId);
        });
    });
    
    // 삭제 버튼 이벤트 리스너
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-id'));
            deleteExpenseData(expenseId);
        });
    });
}

/**
 * 페이지네이션을 업데이트하는 함수
 */
function updatePagination() {
    const totalPages = Math.ceil(expenseData.length / itemsPerPage);
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
            displayExpenseData();
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
            displayExpenseData();
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
            displayExpenseData();
            updatePagination();
        }
    });
    pagination.appendChild(nextLi);
}

/**
 * 경비 상세 모달을 여는 함수
 */
function openExpenseDetailModal(expenseId) {
    const selectedExpense = expenseData.find(item => item.id === expenseId);
    if (!selectedExpense) return;
    
    // 현재 선택된 경비 ID 저장
    currentExpenseId = expenseId;
    
    // 상세 정보 채우기
    document.getElementById('detailExpenseNumber').textContent = selectedExpense.expenseNumber;
    document.getElementById('detailExpenseType').textContent = selectedExpense.expenseType;
    document.getElementById('detailTitle').textContent = selectedExpense.title;
    document.getElementById('detailAmount').textContent = new Intl.NumberFormat('ko-KR').format(selectedExpense.amount);
    document.getElementById('detailExpenseDate').textContent = selectedExpense.expenseDate;
    document.getElementById('detailDepartment').textContent = selectedExpense.department;
    document.getElementById('detailEmployeeName').textContent = selectedExpense.employeeName;
    document.getElementById('detailPaymentMethod').textContent = selectedExpense.paymentMethod;
    document.getElementById('detailAccountNumber').textContent = selectedExpense.accountNumber || '-';
    document.getElementById('detailApprovalStatus').textContent = selectedExpense.approvalStatus;
    document.getElementById('detailPaymentStatus').textContent = selectedExpense.paymentStatus;
    document.getElementById('detailDescription').textContent = selectedExpense.description;
    
    // 영수증 이미지 표시
    const receiptContainer = document.getElementById('detailReceiptContainer');
    const receiptImage = document.getElementById('detailReceipt');
    
    if (selectedExpense.receipt) {
        receiptImage.src = selectedExpense.receipt;
        receiptContainer.style.display = 'block';
    } else {
        receiptContainer.style.display = 'none';
    }
    
    // 승인 이력 표시
    const approvalHistoryTable = document.getElementById('approvalHistory');
    approvalHistoryTable.innerHTML = '';
    
    if (selectedExpense.approvalHistory && selectedExpense.approvalHistory.length > 0) {
        selectedExpense.approvalHistory.forEach(history => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${history.date}</td>
                <td>${history.approver}</td>
                <td>${history.status}</td>
                <td>${history.comment}</td>
            `;
            approvalHistoryTable.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">승인 이력이 없습니다.</td>';
        approvalHistoryTable.appendChild(row);
    }
    
    // 승인 상태에 따라 버튼 표시 조정
    const approveBtn = document.getElementById('approveExpenseBtn');
    const rejectBtn = document.getElementById('rejectExpenseBtn');
    const editBtn = document.getElementById('editExpenseBtn');
    
    if (selectedExpense.approvalStatus === '대기') {
        approveBtn.style.display = 'block';
        rejectBtn.style.display = 'block';
        editBtn.style.display = 'block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
        
        // 반려된 경우에만 수정 가능
        editBtn.style.display = selectedExpense.approvalStatus === '반려' ? 'block' : 'none';
    }
    
    // 모달 열기
    const modal = new bootstrap.Modal(document.getElementById('expenseDetailModal'));
    modal.show();
}

/**
 * 경비 등록/수정 모달을 여는 함수
 */
function openExpenseFormModal(expenseId = null) {
    const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
    
    if (expenseId) {
        // 수정 모드
        document.getElementById('expenseModalLabel').textContent = '경비 수정';
        currentExpenseId = expenseId;
        
        // 선택된 경비 데이터 가져오기
        const selectedExpense = expenseData.find(item => item.id === expenseId);
        if (selectedExpense) {
            fillExpenseForm(selectedExpense);
        }
    } else {
        // 등록 모드
        document.getElementById('expenseModalLabel').textContent = '경비 등록';
        document.getElementById('expenseForm').reset();
        document.getElementById('modalExpenseNumber').value = generateExpenseNumber();
        currentExpenseId = null;
        
        // 영수증 미리보기 초기화
        document.getElementById('receiptPreviewContainer').style.display = 'none';
        receiptFile = null;
    }
    
    modal.show();
}

/**
 * 경비 폼에 데이터를 채우는 함수
 */
function fillExpenseForm(expenseData) {
    document.getElementById('modalExpenseNumber').value = expenseData.expenseNumber;
    document.getElementById('modalExpenseType').value = expenseData.expenseType;
    document.getElementById('modalTitle').value = expenseData.title;
    document.getElementById('modalAmount').value = expenseData.amount;
    document.getElementById('modalExpenseDate').value = expenseData.expenseDate;
    document.getElementById('modalDepartment').value = expenseData.department;
    document.getElementById('modalEmployeeName').value = expenseData.employeeName;
    document.getElementById('modalPaymentMethod').value = expenseData.paymentMethod;
    document.getElementById('modalAccountNumber').value = expenseData.accountNumber || '';
    document.getElementById('modalDescription').value = expenseData.description;
    
    // 영수증 이미지가 있는 경우 미리보기 표시
    if (expenseData.receipt) {
        document.getElementById('receiptPreview').src = expenseData.receipt;
        document.getElementById('receiptPreviewContainer').style.display = 'block';
    } else {
        document.getElementById('receiptPreviewContainer').style.display = 'none';
    }
}

/**
 * 경비 데이터를 저장하는 함수
 */
function saveExpenseData() {
    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }
    
    // 폼 데이터 수집
    const expenseFormData = {
        expenseNumber: document.getElementById('modalExpenseNumber').value,
        expenseType: document.getElementById('modalExpenseType').value,
        title: document.getElementById('modalTitle').value,
        amount: parseInt(document.getElementById('modalAmount').value),
        expenseDate: document.getElementById('modalExpenseDate').value,
        department: document.getElementById('modalDepartment').value,
        employeeName: document.getElementById('modalEmployeeName').value,
        paymentMethod: document.getElementById('modalPaymentMethod').value,
        accountNumber: document.getElementById('modalAccountNumber').value,
        description: document.getElementById('modalDescription').value,
        approvalStatus: '대기', // 신규 등록 시 항상 '대기' 상태
        paymentStatus: '미지급', // 신규 등록 시 항상 '미지급' 상태
        approvalHistory: []
    };
    
    // 영수증 이미지 처리 (실제 구현 시 파일 업로드 API 호출로 대체)
    if (receiptFile) {
        // 예시: 파일 경로 설정 (실제로는 서버에 업로드 후 URL을 받아야 함)
        expenseFormData.receipt = URL.createObjectURL(receiptFile);
    } else if (currentExpenseId) {
        // 수정 시 기존 영수증 유지
        const existingExpense = expenseData.find(item => item.id === currentExpenseId);
        if (existingExpense) {
            expenseFormData.receipt = existingExpense.receipt;
        }
    }
    
    if (currentExpenseId) {
        // 수정 모드
        const index = expenseData.findIndex(item => item.id === currentExpenseId);
        if (index !== -1) {
            // 기존 승인 상태와 지급 상태, 승인 이력 유지
            const existingExpense = expenseData[index];
            expenseFormData.approvalStatus = existingExpense.approvalStatus;
            expenseFormData.paymentStatus = existingExpense.paymentStatus;
            expenseFormData.approvalHistory = existingExpense.approvalHistory;
            
            // 반려된 경비를 수정하는 경우 상태를 '대기'로 변경
            if (existingExpense.approvalStatus === '반려') {
                expenseFormData.approvalStatus = '대기';
                
                // 새로운 승인 이력 추가
                expenseFormData.approvalHistory.push({
                    date: new Date().toLocaleString('ko-KR'),
                    approver: '시스템',
                    status: '상태변경',
                    comment: '반려된 경비가 수정되어 승인 대기 상태로 변경됨'
                });
            }
            
            expenseData[index] = {
                ...expenseData[index],
                ...expenseFormData
            };
        }
    } else {
        // 등록 모드
        const newId = expenseData.length > 0 ? Math.max(...expenseData.map(item => item.id)) + 1 : 1;
        expenseData.push({
            id: newId,
            ...expenseFormData
        });
    }
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('expenseModal'));
    modal.hide();
    
    // 데이터 다시 표시
    displayExpenseData();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 요약 정보 업데이트
    updateSummaryInfo();
    
    // 성공 메시지 표시
    alert(currentExpenseId ? '경비 정보가 수정되었습니다.' : '경비 정보가 등록되었습니다.');
}

/**
 * 경비 데이터를 삭제하는 함수
 */
function deleteExpenseData(expenseId) {
    const selectedExpense = expenseData.find(item => item.id === expenseId);
    
    // 승인된 경비는 삭제 불가
    if (selectedExpense && selectedExpense.approvalStatus === '승인') {
        alert('승인된 경비는 삭제할 수 없습니다.');
        return;
    }
    
    if (confirm('정말로 이 경비 정보를 삭제하시겠습니까?')) {
        // 데이터 삭제
        expenseData = expenseData.filter(item => item.id !== expenseId);
        
        // 데이터 다시 표시
        displayExpenseData();
        
        // 페이지네이션 업데이트
        updatePagination();
        
        // 요약 정보 업데이트
        updateSummaryInfo();
        
        // 성공 메시지 표시
        alert('경비 정보가 삭제되었습니다.');
    }
}

/**
 * 승인/반려 모달을 여는 함수
 */
function openApprovalModal(action) {
    document.getElementById('approvalAction').value = action;
    document.getElementById('approvalExpenseId').value = currentExpenseId;
    document.getElementById('approvalComment').value = '';
    document.getElementById('approvalModalLabel').textContent = `경비 ${action}`;
    
    // 상세 모달 닫기
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('expenseDetailModal'));
    detailModal.hide();
    
    // 승인/반려 모달 열기
    const approvalModal = new bootstrap.Modal(document.getElementById('approvalModal'));
    approvalModal.show();
}

/**
 * 승인/반려 처리 함수
 */
function processApproval() {
    const action = document.getElementById('approvalAction').value;
    const expenseId = parseInt(document.getElementById('approvalExpenseId').value);
    const comment = document.getElementById('approvalComment').value.trim();
    
    if (!comment) {
        alert('코멘트를 입력해주세요.');
        return;
    }
    
    // 경비 데이터 찾기
    const index = expenseData.findIndex(item => item.id === expenseId);
    if (index === -1) return;
    
    // 승인 상태 변경
    expenseData[index].approvalStatus = action;
    
    // 승인인 경우 지급 상태도 변경
    if (action === '승인') {
        expenseData[index].paymentStatus = '완료';
    }
    
    // 승인 이력 추가
    if (!expenseData[index].approvalHistory) {
        expenseData[index].approvalHistory = [];
    }
    
    // 로그인한 사용자 이름 가져오기
    const username = localStorage.getItem('username') || sessionStorage.getItem('username') || '관리자';
    
    expenseData[index].approvalHistory.push({
        date: new Date().toLocaleString('ko-KR'),
        approver: username,
        status: action,
        comment: comment
    });
    
    // 모달 닫기
    const approvalModal = bootstrap.Modal.getInstance(document.getElementById('approvalModal'));
    approvalModal.hide();
    
    // 데이터 다시 표시
    displayExpenseData();
    
    // 요약 정보 업데이트
    updateSummaryInfo();
    
    // 성공 메시지 표시
    alert(`경비가 ${action}되었습니다.`);
}

/**
 * 경비 데이터를 검색하는 함수
 */
function searchExpenses() {
    const expenseNumber = document.getElementById('expenseNumber').value.trim().toLowerCase();
    const expenseType = document.getElementById('expenseType').value;
    const department = document.getElementById('department').value;
    const employeeName = document.getElementById('employeeName').value.trim().toLowerCase();
    const expenseDateStart = document.getElementById('expenseDateStart').value;
    const expenseDateEnd = document.getElementById('expenseDateEnd').value;
    const approvalStatus = document.getElementById('approvalStatus').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    
    // 원본 데이터 로드 (실제 구현 시 API 호출로 대체)
    loadExpenseData();
    
    // 필터링
    expenseData = expenseData.filter(item => {
        // 경비번호 필터링
        if (expenseNumber && !item.expenseNumber.toLowerCase().includes(expenseNumber)) {
            return false;
        }
        
        // 경비유형 필터링
        if (expenseType && item.expenseType !== expenseType) {
            return false;
        }
        
        // 부서 필터링
        if (department && item.department !== department) {
            return false;
        }
        
        // 사원명 필터링
        if (employeeName && !item.employeeName.toLowerCase().includes(employeeName)) {
            return false;
        }
        
        // 지출일자 시작일 필터링
        if (expenseDateStart && item.expenseDate < expenseDateStart) {
            return false;
        }
        
        // 지출일자 종료일 필터링
        if (expenseDateEnd && item.expenseDate > expenseDateEnd) {
            return false;
        }
        
        // 승인상태 필터링
        if (approvalStatus && item.approvalStatus !== approvalStatus) {
            return false;
        }
        
        // 지급상태 필터링
        if (paymentStatus === '완료' && item.paymentStatus !== '완료') {
            return false;
        }
        
        if (paymentStatus === '미지급' && item.paymentStatus !== '미지급') {
            return false;
        }
        
        return true;
    });
    
    // 현재 페이지 초기화
    currentPage = 1;
    
    // 데이터 다시 표시
    displayExpenseData();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 요약 정보 업데이트
    updateSummaryInfo();
}

/**
 * 검색 폼을 초기화하는 함수
 */
function resetSearchForm() {
    document.getElementById('searchForm').reset();
    
    // 원본 데이터 다시 로드
    loadExpenseData();
    
    // 요약 정보 업데이트
    updateSummaryInfo();
}

/**
 * 폼 유효성 검사 함수
 */
function validateForm() {
    const expenseType = document.getElementById('modalExpenseType').value;
    const title = document.getElementById('modalTitle').value.trim();
    const amount = document.getElementById('modalAmount').value.trim();
    const expenseDate = document.getElementById('modalExpenseDate').value.trim();
    const department = document.getElementById('modalDepartment').value;
    const employeeName = document.getElementById('modalEmployeeName').value.trim();
    const paymentMethod = document.getElementById('modalPaymentMethod').value;
    const description = document.getElementById('modalDescription').value.trim();
    
    if (!expenseType) {
        alert('경비유형을 선택하세요.');
        return false;
    }
    
    if (!title) {
        alert('제목을 입력하세요.');
        return false;
    }
    
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
        alert('유효한 금액을 입력하세요.');
        return false;
    }
    
    if (!expenseDate) {
        alert('지출일자를 입력하세요.');
        return false;
    }
    
    if (!department) {
        alert('부서를 선택하세요.');
        return false;
    }
    
    if (!employeeName) {
        alert('사원명을 입력하세요.');
        return false;
    }
    
    if (!paymentMethod) {
        alert('지불방법을 선택하세요.');
        return false;
    }
    
    // 개인카드, 현금, 계좌이체인 경우 계좌번호 필수
    if ((paymentMethod === '개인카드' || paymentMethod === '현금' || paymentMethod === '계좌이체') && 
        !document.getElementById('modalAccountNumber').value.trim()) {
        alert('계좌번호를 입력하세요.');
        return false;
    }
    
    if (!description) {
        alert('상세내용을 입력하세요.');
        return false;
    }
    
    return true;
}

/**
 * Excel로 내보내는 함수
 */
function exportToExcel() {
    // 내보낼 데이터 준비
    const exportData = expenseData.map(item => ({
        '경비번호': item.expenseNumber,
        '경비유형': item.expenseType,
        '제목': item.title,
        '금액': item.amount,
        '지출일자': item.expenseDate,
        '부서': item.department,
        '사원명': item.employeeName,
        '지불방법': item.paymentMethod,
        '계좌번호': item.accountNumber || '',
        '승인상태': item.approvalStatus,
        '지급상태': item.paymentStatus,
        '상세내용': item.description
    }));
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '경비관리');
    
    // 파일 저장
    const fileName = `경비관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
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