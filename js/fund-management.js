/**
 * 자금관리 페이지 JavaScript
 * 
 * 이 파일은 자금관리 페이지의 기능을 구현합니다.
 * - 자금 현황 조회 및 필터링
 * - 입출금 내역 관리
 * - 자금 계획 관리
 * - 보고서 생성
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {

    // 로그인 상태 확인
    checkLoginStatus();
    // 사이드바 토글 기능
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // 자금 현황 검색 기능
    const fundSearchButton = document.getElementById('fundSearchButton');
    if (fundSearchButton) {
        fundSearchButton.addEventListener('click', searchFunds);
    }

    // 엔터키로 검색
    const fundSearchInput = document.getElementById('fundSearchInput');
    if (fundSearchInput) {
        fundSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFunds();
            }
        });
    }

    // 자금 유형 필터 변경 이벤트
    const fundTypeFilter = document.getElementById('fundTypeFilter');
    if (fundTypeFilter) {
        fundTypeFilter.addEventListener('change', filterFundsByType);
    }

    // 기간 필터 변경 이벤트
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', filterFundsByPeriod);
    }

    // 자금 등록 버튼 이벤트
    const saveFundBtn = document.getElementById('saveFundBtn');
    if (saveFundBtn) {
        saveFundBtn.addEventListener('click', saveFund);
    }

    // 자금 내보내기 버튼 이벤트
    const exportFundBtn = document.getElementById('exportFundBtn');
    if (exportFundBtn) {
        exportFundBtn.addEventListener('click', exportFunds);
    }

    // 자금 계획 등록 버튼 이벤트
    const saveFundPlanBtn = document.getElementById('saveFundPlanBtn');
    if (saveFundPlanBtn) {
        saveFundPlanBtn.addEventListener('click', saveFundPlan);
    }

    // 보고서 생성 버튼 이벤트
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }

    // 자금 상세 조회 버튼 이벤트
    setupViewFundButtons();

    // 자금 수정 버튼 이벤트
    setupEditFundButtons();

    // 자금 삭제 버튼 이벤트
    setupDeleteFundButtons();

    // 현재 날짜를 거래일자 기본값으로 설정
    const transactionDateInput = document.getElementById('transactionDate');
    if (transactionDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        transactionDateInput.value = formattedDate;
    }

    // 차트 초기화 (Chart.js 사용 시)
    initializeCharts();
});

/**
 * 자금 검색 함수
 */
function searchFunds() {
    const searchInput = document.getElementById('fundSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('fundTypeFilter').value;
    
    const tableRows = document.querySelectorAll('#fundTable tbody tr');
    
    tableRows.forEach(row => {
        const description = row.cells[2].textContent.toLowerCase();
        const account = row.cells[3].textContent.toLowerCase();
        const type = row.cells[4].textContent.toLowerCase();
        
        // 검색어와 유형 필터 모두 적용
        const matchesSearch = description.includes(searchInput) || 
                             account.includes(searchInput);
                             
        const matchesType = typeFilter === 'all' || type.includes(typeFilter);
        
        // 두 조건 모두 만족할 때만 표시
        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 자금 유형별 필터링 함수
 */
function filterFundsByType() {
    const typeFilter = document.getElementById('fundTypeFilter').value;
    const tableRows = document.querySelectorAll('#fundTable tbody tr');
    
    if (typeFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    tableRows.forEach(row => {
        const type = row.cells[4].textContent.toLowerCase();
        if (type.includes(typeFilter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 기간별 필터링 함수
 */
function filterFundsByPeriod() {
    const periodFilter = document.getElementById('periodFilter').value;
    const tableRows = document.querySelectorAll('#fundTable tbody tr');
    
    if (periodFilter === 'all') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    const today = new Date();
    let startDate;
    
    switch (periodFilter) {
        case 'today':
            startDate = new Date(today);
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'quarter':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 3);
            break;
        case 'year':
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }
    
    tableRows.forEach(row => {
        const dateStr = row.cells[1].textContent;
        const rowDate = new Date(dateStr);
        
        if (rowDate >= startDate && rowDate <= today) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 자금 등록/수정 저장 함수
 */
function saveFund() {
    // 폼 유효성 검사
    if (!validateFundForm()) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 여기서는 실제 저장 대신 성공 메시지만 표시 (백엔드 연동 필요)
    alert('자금 내역이 성공적으로 저장되었습니다.');
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFundModal'));
    modal.hide();
    
    // 실제 구현에서는 서버에 데이터를 전송하고 응답을 받아 처리해야 함
    // 임시로 화면에 추가하는 코드
    addFundToTable();
}

/**
 * 자금 폼 유효성 검사 함수
 */
function validateFundForm() {
    const requiredFields = [
        'transactionDate',
        'description',
        'account',
        'transactionType',
        'amount'
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
 * 임시로 자금 내역을 테이블에 추가하는 함수 (실제로는 서버에서 데이터를 받아와야 함)
 */
function addFundToTable() {
    const table = document.getElementById('fundTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    
    const newRow = table.insertRow();
    
    // 번호
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowCount + 1;
    
    // 거래일자
    const cell2 = newRow.insertCell(1);
    cell2.textContent = document.getElementById('transactionDate').value;
    
    // 내용
    const cell3 = newRow.insertCell(2);
    cell3.textContent = document.getElementById('description').value;
    
    // 계좌
    const cell4 = newRow.insertCell(3);
    const account = document.getElementById('account');
    cell4.textContent = account.options[account.selectedIndex].text;
    
    // 유형
    const cell5 = newRow.insertCell(4);
    const transactionType = document.getElementById('transactionType');
    const typeValue = transactionType.value;
    const typeText = transactionType.options[transactionType.selectedIndex].text;
    
    let badgeClass = 'bg-info'; // 기본값
    
    // 유형에 따라 배지 색상 변경
    switch (typeValue) {
        case 'income':
            badgeClass = 'bg-success';
            break;
        case 'expense':
            badgeClass = 'bg-danger';
            break;
        case 'transfer':
            badgeClass = 'bg-warning';
            break;
    }
    
    cell5.innerHTML = `<span class="badge ${badgeClass}">${typeText}</span>`;
    
    // 금액
    const cell6 = newRow.insertCell(5);
    const amount = parseFloat(document.getElementById('amount').value);
    const formattedAmount = amount.toLocaleString() + '원';
    
    if (typeValue === 'income') {
        cell6.classList.add('text-success');
        cell6.textContent = formattedAmount;
    } else if (typeValue === 'expense') {
        cell6.classList.add('text-danger');
        cell6.textContent = '-' + formattedAmount;
    } else {
        cell6.textContent = formattedAmount;
    }
    
    // 잔액
    const cell7 = newRow.insertCell(6);
    // 실제로는 이전 잔액에 현재 금액을 더하거나 빼서 계산해야 함
    const balance = 10000000 + (typeValue === 'income' ? amount : (typeValue === 'expense' ? -amount : 0));
    cell7.textContent = balance.toLocaleString() + '원';
    
    // 관리 버튼
    const cell8 = newRow.insertCell(7);
    cell8.innerHTML = `
        <button class="btn btn-sm btn-info view-fund" data-id="${rowCount + 1}">
            <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary edit-fund" data-id="${rowCount + 1}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-fund" data-id="${rowCount + 1}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 새로 추가된 버튼에 이벤트 핸들러 연결
    setupViewFundButtons();
    setupEditFundButtons();
    setupDeleteFundButtons();
}

/**
 * 자금 상세 조회 버튼 이벤트 설정
 */
function setupViewFundButtons() {
    const viewButtons = document.querySelectorAll('.view-fund');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fundId = this.getAttribute('data-id');
            viewFund(fundId);
        });
    });
}

/**
 * 자금 수정 버튼 이벤트 설정
 */
function setupEditFundButtons() {
    const editButtons = document.querySelectorAll('.edit-fund');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fundId = this.getAttribute('data-id');
            editFund(fundId);
        });
    });
}

/**
 * 자금 삭제 버튼 이벤트 설정
 */
function setupDeleteFundButtons() {
    const deleteButtons = document.querySelectorAll('.delete-fund');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fundId = this.getAttribute('data-id');
            deleteFund(fundId);
        });
    });
}

/**
 * 자금 상세 조회 함수
 */
function viewFund(fundId) {
    // 실제로는 서버에서 해당 ID의 자금 정보를 가져와야 함
    
    // 모달 표시
    const viewFundModal = new bootstrap.Modal(document.getElementById('viewFundModal'));
    viewFundModal.show();
}

/**
 * 자금 수정 함수
 */
function editFund(fundId) {
    // 실제로는 서버에서 해당 ID의 자금 정보를 가져와야 함
    
    // 모달 제목 변경
    document.getElementById('addFundModalLabel').textContent = '자금 내역 수정';
    
    // 모달 표시
    const addFundModal = new bootstrap.Modal(document.getElementById('addFundModal'));
    addFundModal.show();
    
    // 모달이 닫힐 때 제목 원래대로 변경
    document.getElementById('addFundModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('addFundModalLabel').textContent = '자금 내역 등록';
    });
}

/**
 * 자금 삭제 함수
 */
function deleteFund(fundId) {
    if (confirm('정말로 이 자금 내역을 삭제하시겠습니까?')) {
        // 실제로는 서버에 삭제 요청을 보내야 함
        // 여기서는 임시로 테이블에서만 삭제
        
        const table = document.getElementById('fundTable');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const firstCell = rows[i].cells[0];
            if (firstCell && firstCell.textContent == fundId) {
                table.deleteRow(i);
                break;
            }
        }
        
        alert('자금 내역이 삭제되었습니다.');
    }
}

/**
 * 자금 계획 저장 함수
 */
function saveFundPlan() {
    // 실제로는 서버에 자금 계획 저장 요청을 보내야 함
    alert('자금 계획이 저장되었습니다.');
}

/**
 * 보고서 생성 함수
 */
function generateReport() {
    // 실제로는 서버에 보고서 생성 요청을 보내야 함
    alert('보고서 생성이 시작됩니다.');
}

/**
 * 자금 내보내기 함수
 */
function exportFunds() {
    // 실제로는 서버에서 Excel 파일 등으로 내보내기를 처리해야 함
    alert('자금 내역 내보내기가 시작됩니다.');
}

/**
 * 차트 초기화 함수 (Chart.js 사용 시)
 */
function initializeCharts() {
    // Chart.js가 로드되었는지 확인
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js가 로드되지 않았습니다.');
        return;
    }
    
    // 월별 수입/지출 차트
    const monthlyChart = document.getElementById('monthlyChart');
    if (monthlyChart) {
        new Chart(monthlyChart, {
            type: 'bar',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                datasets: [
                    {
                        label: '수입',
                        data: [1200, 1900, 3000, 5400, 1800, 2500, 3500, 4200, 3800, 5200, 4800, 6000],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '지출',
                        data: [1000, 1700, 2200, 3900, 1600, 2100, 2800, 3700, 3200, 4500, 4000, 5200],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 계좌별 잔액 차트
    const accountBalanceChart = document.getElementById('accountBalanceChart');
    if (accountBalanceChart) {
        new Chart(accountBalanceChart, {
            type: 'pie',
            data: {
                labels: ['기업은행', '신한은행', '국민은행', '우리은행', '하나은행'],
                datasets: [{
                    data: [15000000, 8000000, 12000000, 9000000, 6000000],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
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
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return context.label + ': ' + value.toLocaleString() + '원';
                            }
                        }
                    }
                }
            }
        });
    }
}